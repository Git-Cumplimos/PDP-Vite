import React, {
  Fragment,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import DataTable from "../../../../components/Base/DataTable";
import Input from "../../../../components/Base/Input";
import { initialSearchObj, reducerCommerceFilters } from "./state/table";
import { onChangeNumber } from "../../../../utils/functions";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";

type Props = {};

// const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
const urlComisiones = "http://localhost:5000";

const HistorialDispersionesUsuarioPadre = (props: Props) => {
  const { pdpUser } = useAuth();

  const tsPdpUser = useMemo(
    () => pdpUser ?? { uuid: 0, is_comercio_padre: false },
    [pdpUser]
  );

  const [dispersiones, setDispersiones] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [searchFilters, dispatch] = useReducer(
    reducerCommerceFilters,
    initialSearchObj
  );

  const tableDispersiones = useMemo(
    () =>
      dispersiones.map(
        ({
          pk_id_dispersion,
          estado,
          time_start,
          time_end,
          total_por_iniciar,
          total_finalizadas_ok,
          total_finalizadas_error,
          total_procesando,
          total,
        }: {
          pk_id_dispersion: number;
          estado: string;
          time_start: string;
          time_end: string;
          total_por_iniciar: number;
          total_finalizadas_ok: number;
          total_finalizadas_error: number;
          total_procesando: number;
          total: number;
        }) => ({
          pk_id_dispersion,
          estado,
          time_start,
          time_end,
          total,
          total_por_iniciar,
          total_procesando,
          total_finalizadas_ok,
          total_finalizadas_error,
        })
      ),
    [dispersiones]
  );

  const onSelectDispersiones = useCallback(
    (e, i) => {}, //onSelectComerce(dispersiones[i], e),
    []
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlComisiones}/servicio-wallet-comisiones/estado-dispersion-usuario-padre-paginate?${new URLSearchParams(
            Object.entries(searchFilters)
              .filter(([_, val]) => val)
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

  if (!tsPdpUser.is_comercio_padre || !tsPdpUser.uuid) {
    <Navigate to={"/billetera-comisiones"} />
  }

  return (
    <Fragment>
      <DataTable
        title="Transferencias"
        headers={[
          "Id transferencia",
          "Estado",
          "Fecha de inicio",
          "Fecha de fin",
          "Total transferencias",
          "Total por iniciar",
          "Total procesando",
          "Total exitosas",
          "Total fallidas",
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
              onClickNext={(_) =>
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) => (isNextPage ? oldPage + 1 : oldPage),
                })
              }
              onClickPrev={(_) =>
                dispatch({
                  type: "SET_PAGE",
                  value: (oldPage) => (oldPage > 1 ? oldPage - 1 : oldPage),
                })
              }
            />
          </Fragment>
        }
        onChange={(ev) =>
          dispatch({
            type: "SET_ALL",
            value: (old) => ({
              ...old,
              [ev.target.name]: ["pk_id_dispersion"].includes(ev.target.name)
                ? onChangeNumber(ev)
                : ev.target.value,
              page: 1,
            }),
          })
        }
      >
        <Input
          id="pk_id_dispersion"
          name="pk_id_dispersion"
          label={"Id dispersion"}
          type="tel"
          maxLength={10}
          autoComplete="off"
          defaultValue={searchFilters.pk_id_dispersion}
        />
        <Input
          id="nombre_comercio"
          name="nombre_comercio"
          label={"Nombre comercio"}
          type="text"
          maxLength={60}
          autoComplete="off"
          defaultValue={searchFilters.estado}
        />
      </DataTable>
    </Fragment>
  );
};

export default HistorialDispersionesUsuarioPadre;
