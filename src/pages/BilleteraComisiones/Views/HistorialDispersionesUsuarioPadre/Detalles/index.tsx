import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { initialSearchObj, reducerCommerceFilters } from "./state/table";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import DataTable from "../../../../../components/Base/DataTable";
import { makeDateFormatter } from "../../../../../utils/functions";
import { formatMoney } from "../../../../../components/Base/MoneyInput";
import { Navigate, useParams } from "react-router-dom";
import Modal from "../../../../../components/Base/Modal";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../../../components/Base/Tickets";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Button from "../../../../../components/Base/Button";
import { notify, notifyError } from "../../../../../utils/notify";

type Props = {};

const dateFormatter = makeDateFormatter(true);

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
// const urlComisiones = "http://localhost:5000";

const classesCopyBtn =
  "absolute right-4 top-4 bi bi-clipboard p-1 border border-white " +
  "rounded-md w-9 h-9 text-center hover:border-coolGray-700 hover:bg-white " +
  "hover:text-coolGray-700 font-semibold cursor-pointer text-xl";

const DetallesHistoricoDUP = (props: Props) => {
  const { pk_id_dispersion } = useParams();
  const [dispersiones, setDispersiones] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [currentInfo, setCurrentInfo] = useState<
    undefined | { type: "RESPONSE" | "TICKET"; value: any }
  >();

  const handleClose = useCallback(() => setCurrentInfo(undefined), []);

  const printDiv = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const [searchFilters, dispatch] = useReducer(
    reducerCommerceFilters,
    initialSearchObj
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
        } else {
          notifyError("Transaccion sin finalizar");
        }
      } else {
        if (currentDisp?.estado === "ERROR") {
          setCurrentInfo({ type: "RESPONSE", value: currentDisp?.response });
        } else if (currentDisp?.estado === "FINALIZADO") {
          setCurrentInfo({ type: "TICKET", value: currentDisp?.ticket });
        } else {
          notifyError("Estado de la transaccion invalido");
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
    if (pk_id_dispersion) {
      dispatch({
        type: "SET_PK_ID_DISPERSION",
        value: parseFloat(pk_id_dispersion) ?? 0,
      });
    }
  }, [pk_id_dispersion]);

  if (!pk_id_dispersion) {
    return <Navigate to={"/billetera-comisiones"} />;
  }

  return (
    <Fragment>
      <DataTable
        title="Transferencias"
        headers={[
          "Id comercio",
          "Id transaccion",
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
      <Modal
        show={!!currentInfo}
        handleClose={handleClose}
      >
        {currentInfo?.type === "RESPONSE" && (
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-full">
              <h1 className="text-2xl font-semibold">Response</h1>
              <pre className="whitespace-pre-wrap">
                <code className="block p-4 rounded-md border bg-coolGray-700 text-white relative">
                  {JSON.stringify(currentInfo.value, null, 2)}
                  <span
                    className={`${classesCopyBtn}`}
                    onClick={() => {
                      if (navigator) {
                        navigator.clipboard.writeText(
                          JSON.stringify(currentInfo.value, null, 2)
                        );
                        notify(
                          "Response copiado al portapapeles satisfactoriamente",
                          {
                            toastId: "copy-response",
                          }
                        );
                      }
                    }}
                  />
                </code>
              </pre>
            </div>
          </div>
        )}
        {currentInfo?.type === "TICKET" && (
          <div className="flex flex-col justify-center items-center">
            <Tickets
              refPrint={printDiv}
              ticket={currentInfo.value}
              type="Reimpresión"
              stateTrx
            />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        )}
      </Modal>
    </Fragment>
  );
};

export default DetallesHistoricoDUP;
