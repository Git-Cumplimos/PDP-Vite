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

//--------- Typing ------------------
type TypeDataInput = {
  numero_factura: string;
};
type TypeDataOutput = null | {
  CompanyID: string;
  IdentificationType: string;
  Name: string;
  PayableAmount: string;
  numero_factura: string;
};

//--------- constantes ------------------
const dataInputInitial = {
  numero_factura: "",
};
const url_consulta = `${process.env.REACT_APP_URL_ALMASEG}/servicio_almaseg/consulta-generacion-pin`;

//--------- componente ------------------
const ConsultaGeneracionPin = (): JSX.Element => {
  const [dataInput, setDataInput] = useState<TypeDataInput>(dataInputInitial);
  const [dataOutput, setDataOutput] = useState<TypeDataOutput>(null);
  const [loadingPeticionConsultaPin, peticionConsultaPin] = useFetchAlmaseg(
    url_consulta,
    "consulta generacion pin",
    "GET"
  );

  const doOnChange = useCallback((ev: ChangeEvent<HTMLFormElement>) => {
    setDataInput((old) => ({ ...old, [ev.target.name]: ev.target.value }));
  }, []);

  const doOnReset = useCallback(() => {
    setDataInput(dataInputInitial);
    setDataOutput(null);
  }, []);

  const doOnSubmit = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      peticionConsultaPin(dataInput, {})
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
    <div>
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
          <div className="px-4 py-8 mt-6  grid gap-4 grid-cols-2 grid-rows-3 justify-items-center border-solid border-2 border-gray-400 rounded-2xl">
            <h2 className="font-semibold">Número de factura: </h2>
            <h2>{dataOutput?.numero_factura ?? ""}</h2>
            <h2 className="font-semibold">Tipo de identificación: </h2>
            <h2>{dataOutput?.IdentificationType ?? ""} </h2>
            <h2 className="font-semibold">Número de identificación: </h2>
            <h2>{dataOutput?.CompanyID ?? ""} </h2>
            <h2 className="font-semibold">Nombres y Apellidos: </h2>
            <h2>{dataOutput?.Name ?? ""} </h2>
            <h2 className="font-semibold">Valor del PIN: </h2>
            <h2>{`$ ${dataOutput?.PayableAmount ?? ""}`} </h2>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ConsultaGeneracionPin;
