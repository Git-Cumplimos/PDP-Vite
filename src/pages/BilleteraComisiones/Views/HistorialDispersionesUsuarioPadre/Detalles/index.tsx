import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { initialSearchObj, reducerCommerceFilters } from "./state/table";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import DataTable from "../../../../../components/Base/DataTable";
import { makeDateFormatter } from "../../../../../utils/functions";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { Navigate, useParams } from "react-router-dom";
import Modal from "../../../../../components/Base/Modal";
import Button from "../../../../../components/Base/Button";
import { notifyError } from "../../../../../utils/notify";
import TicketBlock from "../../DispersionUsuarioPadre/TicketBlock";
import SimpleBlockCode from "../../../components/SimpleBlockCode";

type Props = {};

const dateFormatter = makeDateFormatter(true);

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
// const urlComisiones = "http://localhost:5000";

const DetallesHistoricoDUP = (props: Props) => {
  const { pk_id_dispersion } = useParams();
  const [dispersiones, setDispersiones] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [currentInfo, setCurrentInfo] = useState<
    undefined | { type: "RESPONSE" | "TICKET" | "LOGS"; value: any }
  >();

  const handleClose = useCallback(() => setCurrentInfo(undefined), []);

  const [searchFilters, dispatch] = useReducer(
    reducerCommerceFilters,
    initialSearchObj
  );

  const ts_pk_id_dispersion = useMemo(
    () => parseInt(pk_id_dispersion ?? "") ?? 0,
    [pk_id_dispersion]
  );

  const tableDispersiones = useMemo(
    () =>
      dispersiones.map(
        ({
          nombre_comercio,
          fk_id_comercio,
          fk_id_trx,
          estado,
          time_start,
          time_end,
          valor,
        }: {
          nombre_comercio: string;
          fk_id_comercio: number;
          fk_id_trx: number | null;
          estado: string;
          valor: number | string;
          time_start: string;
          time_end: string;
        }) => ({
          comercio: `${nombre_comercio} (${fk_id_comercio})`,
          fk_id_trx,
          estado,
          valor: formatMoney.format(
            typeof valor === "string" ? parseFloat(valor) ?? 0 : valor
          ),
          time_start: time_start
            ? dateFormatter.format(new Date(time_start))
            : "",
          time_end: time_end
            ? dateFormatter.format(new Date(time_end))
            : time_end,
        })
      ),
    [dispersiones]
  );

  const onSelectDispersiones = useCallback(
    (e, i) => {
      const currentDisp = dispersiones[i];
      if (["INICIANDO", "PROCESANDO"].includes(currentDisp?.estado)) {
        if (currentDisp?.ticket) {
          setCurrentInfo({ type: "TICKET", value: currentDisp?.ticket });
        } else if (currentDisp?.response) {
          setCurrentInfo({ type: "RESPONSE", value: currentDisp?.response });
        } else if (currentDisp?.msgs || currentDisp?.records) {
          setCurrentInfo({
            type: "LOGS",
            value: {
              msgs: currentDisp?.msgs ?? [],
              records: currentDisp?.records ?? [],
            },
          });
        } else {
          notifyError("Transacción sin finalizar");
        }
      } else {
        if (currentDisp?.estado === "ERROR") {
          setCurrentInfo({ type: "RESPONSE", value: currentDisp?.response });
        } else if (currentDisp?.estado === "FINALIZADO") {
          setCurrentInfo({ type: "TICKET", value: currentDisp?.ticket });
        } else if (currentDisp?.msgs || currentDisp?.records) {
          setCurrentInfo({
            type: "LOGS",
            value: {
              msgs: currentDisp?.msgs ?? [],
              records: currentDisp?.records ?? [],
            },
          });
        } else {
          notifyError("Estado de la transacción invalido");
        }
      }
    },
    [dispersiones]
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlComisiones}/servicio-wallet-comisiones/estado-dispersion-usuario-padre-detallado?${new URLSearchParams(
            Object.entries(searchFilters)
              .filter(([_, val]) =>
                Array.isArray(val)
                  ? val.filter((date) => date).length === 2
                  : val
              )
              .map(([key, val]) => [key, `${val}`])
          )}`,
        [searchFilters]
      ),
    },
    {
      onSuccess: useCallback((res) => {
        setIsNextPage(res?.obj?.next_exist ?? false);
        setDispersiones(res?.obj?.results ?? []);
      }, []),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  useEffect(() => {
    if (ts_pk_id_dispersion) {
      dispatch({
        type: "SET_PK_ID_DISPERSION",
        value: ts_pk_id_dispersion,
      });
    }
  }, [ts_pk_id_dispersion]);

  if (!ts_pk_id_dispersion) {
    return (
      <Navigate
        to={"/billetera-comisiones/historico-tranferencias-usuario-padre"}
      />
    );
  }

  return (
    <Fragment>
      <DataTable
        title="Transferencias"
        headers={[
          "Id comercio",
          "Id transacción",
          "Estado",
          "Valor",
          "Fecha de inicio",
          "Fecha de fin",
        ]}
        data={tableDispersiones}
        onClickRow={onSelectDispersiones}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={searchFilters.limit}
              onChangeLimit={(limit) =>
                dispatch({ type: "SET_LIMIT", value: limit })
              }
            />
            <DataTable.PaginationButtons
              onClickNext={(_) => {
                if (isNextPage) {
                  dispatch({
                    type: "SET_PAGE",
                    value: (oldPage) => oldPage + 1,
                  });
                  setIsNextPage(false);
                }
              }}
              onClickPrev={(_) =>
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) => (oldPage > 1 ? oldPage - 1 : oldPage),
                })
              }
            />
          </Fragment>
        }
      />
      <Modal show={!!currentInfo} handleClose={handleClose}>
        {currentInfo?.type === "RESPONSE" && (
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-full">
              <h1 className="text-2xl font-semibold">Response</h1>
              <SimpleBlockCode json={currentInfo.value} />
            </div>
          </div>
        )}
        {currentInfo?.type === "LOGS" && (
          <div className="flex gap-4">
            <div className="flex flex-col gap-4 w-full">
              <h1 className="text-2xl font-semibold">Logs</h1>
              <div className="grid grid-cols-8">
                {(currentInfo.value?.msgs ?? []).map((msg: string) => (
                  <Fragment>
                    <p className="col-span-3">
                      <span className="bi bi-dot text-xl block" />
                      {msg.slice(0, 23)}
                    </p>
                    <p className="col-span-5">{msg.split(" -> ")[1]}</p>
                  </Fragment>
                ))}
              </div>
              <SimpleBlockCode json={currentInfo.value?.records} />
            </div>
          </div>
        )}
        {currentInfo?.type === "TICKET" && (
          <TicketBlock ticketData={currentInfo.value}>
            <Button onClick={handleClose}>Cerrar</Button>
          </TicketBlock>
        )}
      </Modal>
    </Fragment>
  );
};

export default DetallesHistoricoDUP;
