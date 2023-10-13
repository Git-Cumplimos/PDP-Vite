import React, { useCallback, useState, FormEvent, ChangeEvent } from "react";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import SimpleLoading from "../../../components/Base/SimpleLoading/SimpleLoading";
import { notifyError } from "../../../utils/notify";
import {
  useFetchAlmaseg,
  TypeServicesBackendAlmaseg,
  ErrorFetchAlmaseg,
} from "../hooks/useFetchAlmaseg";
import { useAuth } from "../../../hooks/AuthHooks";

//--------- Typing ------------------
type TypeDataInput = {
  numero_factura: string;
  comercio: {
    id_comercio: null | number;
    id_usuario: number | null;
    id_terminal: number | null;
  };
  oficina_propia: boolean | null;
  nombre_usuario: string | null;
};
type TypeDataOutput = null | {
  numero_identificacion: string;
  tipo_identificacion: string;
  nombres: string;
  valor_total: string;
  numero_factura: string;
};

//--------- constantes ------------------
const dataInputInitial = {
  numero_factura: "",
};
const url_consulta = `${process.env.REACT_APP_URL_ALMASEG}/servicio_almaseg/consulta-generacion-pin`;

//--------- componente ------------------
const ConsultaGeneracionPin = (): JSX.Element => {
  const { roleInfo, pdpUser } = useAuth();
  const [dataInput, setDataInput] = useState<TypeDataInput>({
    ...dataInputInitial,
    comercio: {
      id_comercio: roleInfo?.["id_comercio"] ?? 0,
      id_usuario: roleInfo?.["id_usuario"] ?? 0,
      id_terminal: roleInfo?.["id_dispositivo"] ?? 0,
    },
    oficina_propia:
      roleInfo?.["tipo_comercio"] === "OFICINAS PROPIAS" ||
      roleInfo?.["tipo_comercio"] === "KIOSCO"
        ? true
        : false,
    nombre_usuario: pdpUser?.["uname"] ?? "",
  });
  const [dataOutput, setDataOutput] = useState<TypeDataOutput>(null);
  const [loadingPeticionConsultaPin, peticionConsultaPin] = useFetchAlmaseg(
    url_consulta,
    "consulta generación pin",
    "POST"
  );

  const doOnChange = useCallback((ev: ChangeEvent<HTMLFormElement>) => {
    setDataInput((old) => ({ ...old, [ev.target.name]: ev.target.value }));
  }, []);

  const doOnReset = useCallback(() => {
    setDataInput((old) => ({
      ...old,
      ...dataInputInitial,
    }));
    setDataOutput(null);
  }, []);

  const doOnSubmit = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      peticionConsultaPin({}, dataInput)
        .then((res: TypeServicesBackendAlmaseg) => {
          setDataOutput(res?.obj?.result);
          setDataInput((old) => ({
            ...old,
            numero_factura: res?.obj?.result?.numero_factura,
          }));
        })
        .catch((error: any) => {
          if (!(error instanceof ErrorFetchAlmaseg)) {
            notifyError(
              `Error respuesta Frontend PDP: Fallo al consumir el servicio (Almaseg - consulta generacion pin) [0010002]`
            );
            console.error({
              "Error PDP":
                "Fallo al consumir el servicio (Almaseg - consulta generacion pin) [0010002]",
              "Error Sequence":
                "ConsultaGeneracionPin - Error en fetch del modulo directamente",
              "Error Console": `${error.message}`,
            });
          }
          doOnReset();
        });
    },
    [peticionConsultaPin, doOnReset, dataInput]
  );

  return (
    <>
      <SimpleLoading show={loadingPeticionConsultaPin}></SimpleLoading>
      <h1 className="text-3xl mt-6">Consulta Para Generación de Pines</h1>
      <div className="px-6 py-8 mt-6 flex items-center flex-col border-solid border-2 border-slate-600 rounded-2xl">
        <Form onSubmit={doOnSubmit} onChange={doOnChange} grid>
          <Input
            name="numero_factura"
            label="Número de factura"
            type="text"
            autoComplete="off"
            minLength={1}
            maxLength={20}
            value={dataInput.numero_factura}
            required
            disabled={dataOutput ? true : false}
          />
          <ButtonBar className={"lg:col-span-2"}>
            {dataOutput ? (
              <Button type="reset" onClick={doOnReset}>
                Búsqueda nueva
              </Button>
            ) : (
              <Button type={"submit"}>Buscar</Button>
            )}
          </ButtonBar>
        </Form>
        {dataOutput ? (
          <>
            <div className="px-4 py-8 mt-6  grid gap-4 grid-cols-2 grid-rows-3 justify-items-center border-solid border-2 border-gray-400 rounded-2xl">
              <h2 className="font-semibold">Número de factura: </h2>
              <h2>{dataOutput?.numero_factura ?? ""}</h2>
              <h2 className="font-semibold">Tipo de identificación: </h2>
              <h2>{dataOutput?.tipo_identificacion ?? ""} </h2>
              <h2 className="font-semibold">Número de identificación: </h2>
              <h2>{dataOutput?.numero_identificacion ?? ""} </h2>
              <h2 className="font-semibold">Nombres y Apellidos: </h2>
              <h2>{dataOutput?.nombres ?? ""} </h2>
              <h2 className="font-semibold">Valor del PIN: </h2>
              <h2>{`$ ${dataOutput?.valor_total ?? ""}`} </h2>
            </div>
            <Form grid onSubmit={() => {}}>
              <ButtonBar className="lg:col-span-2">
                <Button type="submit">Realizar retiro</Button>
              </ButtonBar>
            </Form>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default ConsultaGeneracionPin;
