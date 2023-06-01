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
import { useImgs } from "../../../../hooks/ImgsHooks";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { ErrorCustomFetch } from "../utils/utils";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { useNavigate } from "react-router-dom";
import { toPhoneNumber } from "../../../../utils/functions";
import { v4 } from "uuid";
import { PropsBackendRecargas } from "../utils/TypesSubModulos";

type PropsPaquetes = {
  BackendPaquetes: () => Promise<PropsBackendRecargas>;
};
type TypeInfo = "Ninguno" | "Informacion" | "Resumen" | "TrxExitosa";
type TypeDataInput = {
  celular: string;
};
type TypeInfTicket = { [key: string]: any } | null;

//------ constantes generales--------
const datePackageInputInitial = {
  celular: "",
};

const Paquetes = ({ operadorCurrent }: { operadorCurrent: any }) => {
  const [datePackageInput, setDatePackageInput] = useState<TypeDataInput>(
    datePackageInputInitial
  );
  const [dataGetPaquetes, setDataGetPaquetes] = useState<any | null>(null);
  const [datePackage, setDatePackage] = useState<any | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [typeInfo, setTypeInfo] = useState<TypeInfo>("Ninguno");
  const [infTicket, setInfTicket] = useState<TypeInfTicket>(null);
  const printDiv = useRef(null);

  const validNavigate = useNavigate();
  const id_uuid = v4();
  const { svgs }: any = useImgs();
  const { roleInfo, pdpUser }: any = useAuth();
  const useHookDynamic = operadorCurrent?.backend;
  const [loadingPeticion, PeticionGetPaquetes, PeticionTrx] = useHookDynamic(
    operadorCurrent.name,
    "paquetes"
  );

  useEffect(() => {
    PeticionGetPaquetes({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: {},
    })
      .then((response: any) => {
        setDataGetPaquetes(response?.results);
        // setMaxPage(response?.obj?.result?.maxPages);
      })
      .catch((error: any) => {
        let msg = `Error respuesta PDP: Fallo al consumir el servicio (${operadorCurrent.name} - catch) [0010002]`;
        if (error instanceof ErrorCustomFetch) {
        } else {
          notifyError(msg);
        }
        setDataGetPaquetes([]);
      });
  }, [operadorCurrent, roleInfo, pdpUser]);

  const onChangeInput = useCallback((e) => {
    let valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    if (valueInput[0] != 3) {
      if (valueInput != "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        valueInput = "";
      }
    }
    setDatePackageInput((anterior) => ({
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
    PeticionTrx({
      roleInfo: roleInfo,
      pdpUser: pdpUser,
      moduleInfo: { ...datePackageInput, ...datePackage },
      id_uuid: id_uuid,
    })
      .then((result: any) => {
        if (result?.status === true) {
          if (result?.ticket) {
            setInfTicket(result?.ticket);
          }
          notify(`Recarga ${operadorCurrent.name} exitosa`);
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
  }, [roleInfo, pdpUser, datePackageInput, datePackage, operadorCurrent]);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const HandleCloseInformacion = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDatePackage(null);
    setDatePackageInput(datePackageInputInitial);
  }, []);

  const HandleCloseResumen = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDatePackage(null);
    setDatePackageInput(datePackageInputInitial);
    notify("Compra cancelada");
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDatePackage(null);
    setDatePackageInput(datePackageInputInitial);
    validNavigate("/telefonia-movil");
  }, [validNavigate]);

  const handleCloseModal = useCallback(() => {
    if (typeInfo === "Informacion") {
      HandleCloseInformacion();
    } else if (typeInfo === "Resumen" && !loadingPeticion?.trx) {
      HandleCloseResumen();
    } else if (typeInfo === "TrxExitosa") {
      HandleCloseTrxExitosa();
    } else if (loadingPeticion?.trx) {
      notify("Se está procesando la transacción, por favor esperar");
    }
  }, [
    typeInfo,
    loadingPeticion?.trx,
    HandleCloseInformacion,
    HandleCloseResumen,
    HandleCloseTrxExitosa,
  ]);

  return (
    <div className="py-10 flex items-center flex-col">
      <img
        className="w-24  "
        src={
          operadorCurrent?.logo?.includes("http")
            ? operadorCurrent?.logo
            : svgs?.[operadorCurrent?.logo]
        }
      ></img>
      <TableEnterprise
        title={"Paquetes"}
        maxPage={3}
        headers={["Código", "Tipo", "Descripción", "Valor"]}
        data={
          dataGetPaquetes?.map((inf: any) => ({
            Código: inf.codigo,
            Tipo: inf.tipo,
            Descripción: inf.descripcion,
            Valor: inf.valor,
          })) ?? []
        }
        onSelectRow={(e: any, i: any) => {
          setDatePackage(dataGetPaquetes?.[i]);
          setShowModal(true);
          setTypeInfo("Informacion");
        }}
        // onSetPageData={(pagedata) => {
        //   setPageData(pagedata.page);
        //   setLimit(pagedata.limit);
        // }}
      ></TableEnterprise>
      <Modal show={showModal} handleClose={handleCloseModal}>
        {/******************************ResumenPaquete*******************************************************/}
        {typeInfo === "Informacion" && (
          <PaymentSummary
            title={`Paquete ${operadorCurrent.name}`}
            subtitle={datePackage?.tipo ?? ""}
          >
            <label className="whitespace-pre-line">
              {datePackage?.descripcion}
            </label>
            <label>
              {`Valor: ${formatMoney.format(datePackage?.valor ?? 0)}`}
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
                value={datePackageInput.celular}
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
              Celular: toPhoneNumber(datePackageInput.celular),
              Valor: formatMoney.format(datePackage.valor),
              "Tipo de Oferta": datePackage.tipo,
              "Descripción Corta": datePackage.descripcion,
              "Código de la Oferta": datePackage.codigo,
            }}
          >
            {!loadingPeticion.trx ? (
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
