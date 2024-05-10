import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import Modal from "../../../../components/Base/Modal";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { TypeInfTicket } from "../../../../utils/TypingUtils";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import { TempErrorFrontUser } from "../../../../utils/fetchCustomPdp";

import useHookGouCheckPay from "./hook/useHookGouCheckPay";
import {
  TypingOutputCheckPay,
  TypingDataComercioSimple,
  TypingDataPath,
} from "../../utils/utils_typing";
import {
  ajust_tam_see,
  dict_segun_order,
  dict_summary_trx_own,
  list_a_dict_segun_order,
} from "../../utils/utils_function";
import {
  constOrderSummary,
  constRelationshipSummary,
} from "../../utils/utils_const";

import classes from "./GouCheckPayCross.module.css";
import {
  ListaDestinos,
  ListaTramites,
} from "../../lista_destinos_and_tramites";
import Tickets from "../../../../components/Base/Tickets";

//FRAGMENT ******************** CSS *******************************
const { contendorBorder, contendorIdLog, contendorPago } = classes;

//FRAGMENT ******************** COMPONENT *******************************
const GouCheckPayCross = () => {
  const { roleInfo }: any = useAuth();
  const params = useParams();
  const [dataPath, setDataPath] = useState<TypingDataPath | null>(null);
  const [ticket, setTicket] = useState<TypeInfTicket | null>(null);
  const { loadingPeticion, PeticionCheckPay, trx, summaryTrx, dataComponent } =
    useHookGouCheckPay();
  const validNavigate = useNavigate();
  const printDiv = useRef(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const dataComercioSimple: TypingDataComercioSimple = useMemo(() => {
    return {
      id_comercio: roleInfo?.id_comercio ?? 0,
      id_usuario: roleInfo?.id_usuario ?? 0,
      id_terminal: roleInfo?.id_dispositivo ?? 0,
    };
  }, [roleInfo?.id_comercio, roleInfo?.id_usuario, roleInfo?.id_dispositivo]);

  useEffect(() => {
    const validPath = (): string | null => {
      if (params.id_hash === undefined) {
        return "url incorrecta 'id_hash'";
      }
      if (params.id_hash === ":id_hash") {
        return "url incorrecta 'id_hash'";
      }
      setDataPath({
        id_hash: params.id_hash,
      });
      return null;
    };
    const error_msg = validPath();
    if (error_msg) {
      notifyError(TempErrorFrontUser.replace("%s", error_msg), 3000, {
        toastId: "notify-lot-format",
      });
      return;
    }
  }, [params.id_hash, params.type_setting_time]);

  useEffect(() => {
    if (dataPath === null) {
      return;
    }
    notifyPending(
      PeticionCheckPay(dataComercioSimple, dataPath),
      {
        render: () => {
          return "Procesando";
        },
      },
      {
        render: ({ data }: { data: TypingOutputCheckPay }) => {
          setTicket(data.ticket);

          return `${data.tipo_tramite} Aprobada`;
        },
      },
      {
        render: ({ data: error }) => {
          return error?.message ?? "Se desconoce el estado de la transacción";
        },
      }
    );
  }, [dataComercioSimple, PeticionCheckPay, dataPath]);

  return (
    <Fragment>
      {dataPath && (
        <div className={contendorBorder}>
          {summaryTrx.id_log && (
            <label className={contendorIdLog}>{summaryTrx.id_log}</label>
          )}
          {dataComponent?.destino === "GOU" && <ListaDestinos.GOU />}
          {dataComponent?.destino === "EVERTEC" && <ListaDestinos.EVERTEC />}
          <br></br>
          <PaymentSummary
            title={trx.msg}
            subtitle={summaryTrx?.msg ?? ""}
            summaryTrx={{
              ...list_a_dict_segun_order([
                ...(summaryTrx?.summary_trx_asterisk ?? []),
              ]),
              ...dict_segun_order(
                constOrderSummary,
                dict_summary_trx_own(constRelationshipSummary, {
                  ...{ ...(summaryTrx?.summary_trx_own ?? {}) },
                  status: trx.status !== "Search" ? trx.status : undefined,
                  id_trx: summaryTrx?.id_trx,
                })
              ),
            }}
          >
            {dataPath?.id_hash && !summaryTrx?.id_trx && (
              <label>{ajust_tam_see(dataPath.id_hash, 50)}</label>
            )}

            {summaryTrx.valor_trx && (
              <Fragment>
                <h1 className={contendorPago}>
                  <strong className="justify-self-end">Pago:</strong>
                  <p className="justify-self-start whitespace-pre-wrap">
                    {`${formatMoney.format(summaryTrx.valor_trx)} COP`}
                  </p>
                </h1>
              </Fragment>
            )}
          </PaymentSummary>
          {!loadingPeticion && trx.status === "Aprobada" && (
            <Fragment>
              <br />
              <Button type="submit" onClick={() => setShowModal(true)}>
                Descargar comprobante de pago
              </Button>
            </Fragment>
          )}
          {!loadingPeticion && (
            <div className={trx.status !== "Aprobada" ? "pt-4" : ""}>
              <Button onClick={() => validNavigate("../Transacciones")}>
                Modulo Transacciones
              </Button>
            </div>
          )}

          {!loadingPeticion && (
            <Button onClick={() => validNavigate("../")}>
              Regresar al inicio
            </Button>
          )}
        </div>
      )}
      <Modal show={showModal && ticket} handleClose={() => setShowModal(false)}>
        {/**************** Trx Aprobada **********************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {dataComponent?.tipo_tramite === "GOU:RECARGAR CUPO" && (
            <ListaTramites.GOU_RECARGAR_CUPO
              ticket={ticket}
              refPrint={printDiv}
            />
          )}
          {dataComponent?.tipo_tramite === "EVERTEC:RECARGAR CUPO" && (
            <ListaTramites.EVERTEC_RECARGAR_CUPO
              ticket={ticket}
              refPrint={printDiv}
            />
          )}
          {!dataComponent && <Tickets ticket={ticket} refPrint={printDiv} />}
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ButtonBar>
        </div>
        {/**************** Trx Aprobada **********************/}
      </Modal>
    </Fragment>
  );
};

export default GouCheckPayCross;
