import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReactToPrint } from "react-to-print";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary/PaymentSummary";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import {
  ErrorCustomBackend,
  ErrorCustomComponentCode,
  ErrorCustomFetch,
  descriptionErrorFront,
} from "../utils/fetchUtils";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import { useNavigate } from "react-router-dom";
import { toPhoneNumber } from "../../../../utils/functions";
import { v4 } from "uuid";
import {
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
  TypePropsComponentBody,
  TypeTableDataGetPaquetes,
} from "../TypeDinamic";

//FRAGMENT ********** TYPING ***********
type TypeInfo = "Ninguno" | "Informacion" | "Resumen" | "TrxExitosa";
type TypeDataInput = {
  celular: string;
};
type TypeInfTicket = { [key: string]: any } | null;
type TypyDataPagination = {
  limit: number;
  page: number;
};
type TypeFiltersSinPagination = {
  codigo?: string; //number
  tipo?: string;
  descripcion_corta?: string;
  valor?: number;
};

//FRAGMENT ********* CONST ***********
const dataPackageInputInitial = {
  celular: "",
};

const dataPaginationInitial: TypyDataPagination = {
  limit: 10,
  page: 1,
};
const dataGetPackagesInitial: TypeTableDataGetPaquetes[] = [
  {
    codigo: "Buscando ... ",
    nombre: "",
    tipo: "",
    descripcion_corta: "",
    descripcion_completa: "",
    valor: "",
  },
];

//FRAGMENT ********* COMPONENTE ***********
const Paquetes = ({
  operadorCurrent,
  setLoadingPeticionGlobal,
  loadingPeticionGlobal,
  children,
}: TypePropsComponentBody) => {
  const component_name = "Paquetes";
  const msg = descriptionErrorFront.replace(
    "%s",
    `Telefonia movil - ${operadorCurrent.autorizador} - ${component_name}`
  );
  const [dataPackageInput, setDataPackageInput] = useState<TypeDataInput>(
    dataPackageInputInitial
  );
  const [dataGetPackages, setDataGetPackages] = useState<
    TypeTableDataGetPaquetes[]
  >(dataGetPackagesInitial);
  const [dataPackage, setDataPackage] =
    useState<TypeTableDataGetPaquetes | null>(null);
  const [dataFilters, setDataFilters] = useState<TypeFiltersSinPagination>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeInfo, setTypeInfo] = useState<TypeInfo>("Ninguno");
  const [infTicket, setInfTicket] = useState<TypeInfTicket>(null);
  const [dataPagination, setDataPagination] = useState<TypyDataPagination>(
    dataPaginationInitial
  );
  const [maxPages, setMaxPages] = useState<number>(1);
  const printDiv = useRef(null);
  const useHookDynamic = operadorCurrent?.backend;

  const [, PeticionGetPaquetes, loadingPeticionTrx, PeticionTrx] = //esta bien la coma inicial, es para no tomar el valor inicial, por que no lo uso
    useHookDynamic(
      operadorCurrent.operador,
      operadorCurrent.autorizador,
      component_name.toLowerCase(),
      setLoadingPeticionGlobal
    );
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const { roleInfo, pdpUser }: any = useAuth();

  useEffect(() => {
    setDataFilters({});
    setDataPagination(dataPaginationInitial);
    setDataGetPackages(dataGetPackagesInitial);
  }, [operadorCurrent.name]);

  useEffect(() => {
    PeticionGetPaquetes({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: { ...dataFilters, ...dataPagination },
      parameters_operador: {},
      parameters_submodule: {},
    })
      .then((response: TypeOutputDataGetPaquetes) => {
        setDataGetPackages(response?.results);
        setMaxPages(response?.maxPages);
      })
      .catch((error: any) => {
        if (!(error instanceof ErrorCustomFetch)) {
          notifyError(msg);
          console.error("Error respuesta Front-end PDP", {
            "Error PDP": msg,
            "Error Sequence": `Views ${component_name} - PeticionGetPaquetes -> error sin controlar`,
            "Error Console": `${error.message}`,
          });
        }
        setDataGetPackages([]);
      });
  }, [
    roleInfo,
    pdpUser,
    PeticionGetPaquetes,
    dataFilters,
    dataPagination,
    component_name,
    msg,
  ]);

  const HandleCloseInformacion = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDataPackage(null);
    setDataPackageInput(dataPackageInputInitial);
  }, []);

  const HandleCloseResumen = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDataPackage(null);
    setDataPackageInput(dataPackageInputInitial);
    notify("Compra cancelada");
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDataPackage(null);
    setDataPackageInput(dataPackageInputInitial);
    validNavigate("/telefonia-movil");
  }, [validNavigate]);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "Informacion") {
      HandleCloseInformacion();
    } else if (typeInfo === "Resumen" && !loadingPeticionTrx) {
      HandleCloseResumen();
    } else if (typeInfo === "TrxExitosa") {
      HandleCloseTrxExitosa();
    } else if (loadingPeticionTrx) {
      notifyError("Transacción en proceso", 5000, {
        toastId: "notify-lot-cerrar",
      });
    }
  }, [
    typeInfo,
    loadingPeticionTrx,
    HandleCloseInformacion,
    HandleCloseResumen,
    HandleCloseTrxExitosa,
  ]);

  const onChangeInput = useCallback(
    (e) => {
      let valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
      if (
        valueInput[0] !== "3" &&
        (operadorCurrent?.parameters_operador["celular_check"] ?? true) === true
      ) {
        if (valueInput !== "") {
          notifyError(
            "Número inválido, el No. de celular debe comenzar con el número 3",
            5000,
            {
              toastId: "notify-lot-celular",
            }
          );
          valueInput = "";
        }
      }
      setDataPackageInput((anterior) => ({
        ...anterior,
        [e.target.name]: valueInput,
      }));
    },
    [operadorCurrent?.parameters_operador]
  );

  const ValidarAntesCompraPaquete = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
    setTypeInfo("Resumen");
  }, []);

  const RealizarTrx = useCallback(() => {
    const function_name = "RealizarTrx";
    const moduleInfo = {
      celular: dataPackageInput?.celular,
      valor_total_trx: dataPackage?.valor,
      paquete: {
        codigo: dataPackage?.codigo,
        nombre: dataPackage?.nombre,
        tipo: dataPackage?.tipo,
        descripcion_corta: dataPackage?.descripcion_corta,
      },
    };
    PeticionTrx({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: moduleInfo,
      id_uuid: id_uuid,
    })
      .then((result: TypeOutputTrxPaquetes) => {
        if (result?.status === true) {
          notify(`Recarga ${operadorCurrent.name} exitosa`);
          if (result?.ticket !== null) {
            setInfTicket(result?.ticket);
            setTypeInfo("TrxExitosa");
          } else if (result?.id_trx !== null) {
            HandleCloseInformacion();
            notify(
              `Buscar el ticket en el modulo de transacciones con id_trx = ${result?.id_trx}`
            );
            validNavigate("/transacciones");
          } else {
            HandleCloseInformacion();
            notify("Buscar el ticket en el modulo de transacciones");
          }
        } else {
          throw new ErrorCustomComponentCode(
            msg,
            "el valor de status en la peticion dentro del componente es false",
            `Views ${component_name} - ${function_name} -> status false`,
            "notifyError",
            false
          );
        }
      })
      .catch((error: any) => {
        HandleCloseInformacion();
        if (error instanceof ErrorCustomBackend) {
          if (error.res_obj !== undefined) {
            if (Object.keys(error.res_obj).includes("error_pending_trx")) {
              validNavigate("/transacciones");
            } else {
              validNavigate("/telefonia-movil");
            }
          } else {
            validNavigate("/telefonia-movil");
          }
        } else {
          validNavigate("/telefonia-movil");
        }
        if (!(error instanceof ErrorCustomFetch)) {
          validNavigate("/telefonia-movil");
          notifyError(msg);
          console.error("Error respuesta Front-end PDP", {
            "Error PDP": msg,
            "Error Sequence": `Views ${component_name} - ${function_name} -> error sin controlar`,
            "Error Console": `${error.message}`,
          });
        }
      });
  }, [
    roleInfo,
    pdpUser,
    dataPackageInput,
    dataPackage,
    operadorCurrent.name,
    HandleCloseInformacion,
    PeticionTrx,
    id_uuid,
    msg,
    validNavigate,
  ]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  return (
    <div className="py-10 flex items-center flex-col">
      {children}
      <TableEnterprise
        title={"Paquetes"}
        maxPage={maxPages}
        headers={["Código", "Tipo", "Descripción", "Valor"]}
        data={[
          ...dataGetPackages?.map((inf: TypeTableDataGetPaquetes) => {
            return [inf.codigo, inf.tipo, inf.descripcion_corta, inf.valor];
          }),
        ]}
        onSelectRow={(e: any, i: number) => {
          setDataPackage(dataGetPackages?.[i]);
          setShowModal(true);
          setTypeInfo("Informacion");
        }}
        onSetPageData={setDataPagination}
      >
        <Fragment>
          <Input
            name="codigo"
            label="Código Paquete"
            type="text"
            autoComplete="off"
            maxLength={10}
            value={dataFilters.codigo ?? ""}
            onChange={(ev) => {
              setDataFilters((old) => ({
                ...old,
                [ev.target.name]: (
                  (ev.target.value ?? "").match(/\d/g) ?? []
                ).join(""),
              }));
            }}
          />
          <Input
            name="descripcion_corta"
            label="Descripción Paquete"
            type="text"
            autoComplete="off"
            maxLength={30}
            value={dataFilters.descripcion_corta ?? ""}
            onChange={(e) => {
              setDataFilters((old) => ({
                ...old,
                [e.target.name]: e.target.value,
              }));
            }}
          />
          <MoneyInput
            name="valor"
            label="Valor"
            autoComplete="off"
            value={dataFilters.valor ?? ""}
            maxLength={9}
            onInput={(ev, value) => {
              setDataFilters((old) => ({
                ...old,
                valor: value,
              }));
            }}
            required
          />
        </Fragment>
      </TableEnterprise>

      <Modal show={showModal} handleClose={handleCloseModal}>
        {/******************************ResumenPaquete*******************************************************/}
        {typeInfo === "Informacion" && (
          <PaymentSummary
            title={`Paquete ${operadorCurrent.name}`}
            subtitle={dataPackage?.tipo ?? ""}
          >
            <label className="whitespace-pre-line">
              {dataPackage?.descripcion_completa}
            </label>
            <label>
              {`Valor: ${formatMoney.format(
                parseInt(dataPackage?.valor ?? "0")
              )}`}
            </label>
            <Form
              onChange={onChangeInput}
              onSubmit={ValidarAntesCompraPaquete}
              grid
            >
              <Input
                name="celular"
                label="Número de celular"
                type="tel"
                autoComplete="off"
                minLength={
                  operadorCurrent?.parameters_operador["celular_tam_min"] ?? 10
                }
                maxLength={
                  operadorCurrent?.parameters_operador["celular_tam_max"] ?? 10
                }
                value={dataPackageInput.celular}
                required
              />
              <ButtonBar>
                <Button type="submit">Comprar</Button>
                <Button onClick={HandleCloseInformacion}>Cancelar</Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
        {/******************************Adquirir del paquete*******************************************************/}
        {/******************************Resumen de trx*******************************************************/}
        {typeInfo === "Resumen" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(dataPackageInput.celular),
              Valor: formatMoney.format(parseInt(dataPackage?.valor ?? "0")),
              "Tipo de Oferta": dataPackage?.tipo,
              "Descripción Corta": dataPackage?.descripcion_corta,
              "Código de la Oferta": dataPackage?.codigo,
            }}
          >
            {!loadingPeticionTrx ? (
              <>
                <ButtonBar>
                  <Button type={"submit"} onClick={RealizarTrx}>
                    Aceptar
                  </Button>
                  <Button onClick={HandleCloseResumen}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/******************************Resumen de trx *******************************************************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {infTicket && typeInfo === "TrxExitosa" && (
            <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
              </ButtonBar>
            </div>
          )}
        </div>
        {/******************************inf recibo *******************************************************/}
      </Modal>
    </div>
  );
};

export default Paquetes;
