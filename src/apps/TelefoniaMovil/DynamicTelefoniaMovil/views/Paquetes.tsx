import React, {
  ReactNode,
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
import { ErrorCustomFetch, descriptionErrorFront } from "../utils/fetchUtils";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useNavigate } from "react-router-dom";
import { toPhoneNumber } from "../../../../utils/functions";
import { v4 } from "uuid";
import {
  PropOperadoresComponent,
  TypeInputDataPaquetes,
  TypeOutputDataGetPaquetes,
  TypeOutputTrxPaquetes,
  TypeTableDataGetPaquetes,
} from "../TypeDinamic";

type TypeInfo = "Ninguno" | "Informacion" | "Resumen" | "TrxExitosa";
type TypeDataInput = {
  celular: string;
};
type TypeInfTicket = { [key: string]: any } | null;

//------ constantes generales--------
const dataPackageInputInitial = {
  celular: "",
};

const dataTableInitial = [
  {
    Código: "Buscando ... ",
    Tipo: "",
    Descripción: "",
    Valor: "",
  },
];

const Paquetes = ({
  operadorCurrent,
  children,
}: {
  operadorCurrent: PropOperadoresComponent;
  children: ReactNode;
}) => {
  const component_name = "Paquetes";
  const msg = descriptionErrorFront.replace(
    "%s",
    `Telefonia movil - ${operadorCurrent.autorizador} - ${component_name}`
  );
  const [dataPackageInput, setDataPackageInput] = useState<TypeDataInput>(
    dataPackageInputInitial
  );
  const [dataGetPackages, setDataGetPackages] = useState<any>([]);
  const [dataPackage, setDataPackage] =
    useState<TypeTableDataGetPaquetes | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeInfo, setTypeInfo] = useState<TypeInfo>("Ninguno");
  const [infTicket, setInfTicket] = useState<TypeInfTicket>(null);
  const [pageTable, setPageTable] = useState<{ limit: number; page: number }>({
    limit: 10,
    page: 1,
  });
  const [maxPages, setMaxPages] = useState<number>(1);
  const printDiv = useRef(null);
  const useHookDynamic = operadorCurrent?.backend;

  const [
    loadingPeticionGetPaquetes,
    PeticionGetPaquetes,
    loadingPeticionTrx,
    PeticionTrx,
  ] = useHookDynamic(
    operadorCurrent.name,
    operadorCurrent.autorizador,
    component_name.toLowerCase()
  );
  const validNavigate = useNavigate();
  const id_uuid = v4();
  const { roleInfo, pdpUser }: any = useAuth();

  useEffect(() => {
    PeticionGetPaquetes({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: { page: pageTable.page, limit: pageTable.limit },
      parameters_operador: operadorCurrent.parameters_operador,
      parameters_submodule: operadorCurrent.parameters_submodule,
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
    operadorCurrent,
    roleInfo,
    pdpUser,
    PeticionGetPaquetes,
    pageTable.limit,
    pageTable.page,
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
      notify("Se está procesando la transacción, por favor esperar");
    }
  }, [
    typeInfo,
    loadingPeticionTrx,
    HandleCloseInformacion,
    HandleCloseResumen,
    HandleCloseTrxExitosa,
  ]);

  const onChangeInput = useCallback((e) => {
    let valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    if (valueInput[0] !== "3") {
      if (valueInput !== "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        valueInput = "";
      }
    }
    setDataPackageInput((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }, []);

  const ValidarAntesCompraPaquete = useCallback((e) => {
    e.preventDefault();
    // if (statePermissionTrx === false) {
    //   notify(
    //     "No se podra realizar la compra de paquetes a movistar porque el usuario no es un comercio, ni oficina propia o kiosko."
    //   );
    //   return;
    // }
    //RealizarCompra
    setShowModal(true);
    setTypeInfo("Resumen");
  }, []);

  const RealizarTrx = useCallback(() => {
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
          if (result?.ticket) {
            setInfTicket(result?.ticket);
          }
          notify(`Compra paquete ${operadorCurrent.name} exitosa`);
          setTypeInfo("TrxExitosa");
        } else {
          notifyError(
            `Error respuesta PDP: Fallo al consumir el servicio (${operadorCurrent.name} - status) [0010002]`
          );
          HandleCloseInformacion();
        }
      })
      .catch((error: any) => {
        HandleCloseInformacion();
        let msg = `Error respuesta PDP: Fallo al consumir el servicio (${operadorCurrent.name} - catch) [0010002]`;
        if (error instanceof ErrorCustomFetch) {
        } else {
          notifyError(msg);
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
        data={
          loadingPeticionGetPaquetes
            ? dataTableInitial
            : dataGetPackages?.map((inf: TypeTableDataGetPaquetes) => {
                return {
                  Código: inf.codigo,
                  Tipo: inf.tipo,
                  Descripción: inf.descripcion_corta,
                  Valor: inf.valor,
                };
              })
        }
        onSelectRow={(e: any, i: number) => {
          setDataPackage(dataGetPackages?.[i]);
          setShowModal(true);
          setTypeInfo("Informacion");
        }}
        onSetPageData={setPageTable}
      ></TableEnterprise>

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
              {`Valor: ${formatMoney.format(dataPackage?.valor ?? 0)}`}
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
                minLength={10}
                maxLength={10}
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
              Valor: formatMoney.format(dataPackage?.valor ?? 0),
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
