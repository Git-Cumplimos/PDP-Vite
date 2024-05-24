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
import { makeDateFormatter, onChangeNumber } from "../../../../utils/functions";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import { enumBilleteraComisiones } from "../../enumBilleteraComisiones";

type Props = {};

const dateFormatter = makeDateFormatter(true);

const urlComisiones = process.env.REACT_APP_URL_COMISIONES;
// const urlComisiones = "http://localhost:5000";

const HistorialDispersionesUsuarioPadre = (props: Props) => {
  const { pdpUser, userPermissions } = useAuth();
  const navigate = useNavigate();

  const tsPdpUser = useMemo(
    () => pdpUser ?? { uuid: 0, is_comercio_padre: false },
    [pdpUser]
  );

  const tsUserPermissions = useMemo<{ id_permission: number }[]>(
    () => userPermissions ?? [],
    [userPermissions]
  );
  const tsUserPermissionsList = useMemo<number[]>(
    () => tsUserPermissions.map(({ id_permission }) => id_permission),
    [tsUserPermissions]
  );

  const [dispersiones, setDispersiones] = useState<any[]>([]);
  const [isNextPage, setIsNextPage] = useState(false);

  const [searchFilters, dispatch] = useReducer(reducerCommerceFilters, {
    ...initialSearchObj,
    fk_id_user: tsPdpUser.uuid,
  });

  const tableDispersiones = useMemo(
    () =>
      dispersiones.map(
        ({
          pk_id_dispersion,
          fk_id_user,
          uname,
          email,
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
          fk_id_user: number;
          uname: string;
          email: string;
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
          usuario: `${uname} (Id: ${fk_id_user})`,
          estado,
          time_start: time_start
            ? dateFormatter.format(new Date(time_start))
            : "",
          time_end: time_end
            ? dateFormatter.format(new Date(time_end))
            : time_end,
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
    (e, i) => navigate(`${dispersiones[i]?.pk_id_dispersion}`),
    [navigate, dispersiones]
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlComisiones}/servicio-wallet-comisiones/estado-dispersion-usuario-padre-paginate?${new URLSearchParams(
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

  if (
    !tsUserPermissionsList.includes(
      enumBilleteraComisiones.ver_historial_transferencia_billetera_up_soporte
    )
  ) {
    if (!tsPdpUser.is_comercio_padre) {
      return <Navigate to={"/billetera-comisiones"} />;
    }
    if (!tsPdpUser.uuid) {
      return <Navigate to={"/billetera-comisiones"} />;
    }
  }

  return (
    <Fragment>
      <DataTable
        title="Transferencias"
        headers={[
          "Id transferencia",
          "Usuario",
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
        onChange={(ev) =>
          dispatch({
            type: "SET_ALL",
            value: (old) => ({
              ...old,
              [ev.target.name]: ["pk_id_dispersion", "fk_id_user"].includes(
                ev.target.name
              )
                ? onChangeNumber(ev)
                : ev.target.name === "date_search"
                ? new FormData(ev.target.form).getAll(ev.target.name)
                : ev.target.value,
              page: 1,
            }),
          })
        }
      >
        <Input
          id="pk_id_dispersion"
          name="pk_id_dispersion"
          label={"Id dispersión"}
          type="tel"
          maxLength={10}
          autoComplete="off"
          defaultValue={searchFilters.pk_id_dispersion}
        />
        <Select
          id="estado"
          name="estado"
          label={"Estado"}
          options={[
            { value: "", label: "" },
            { value: "INICIANDO", label: "INICIANDO" },
            { value: "FINALIZADO", label: "FINALIZADO" },
            { value: "PROCESANDO", label: "PROCESANDO" },
          ]}
          // value={searchFilters.estado}
          // onChange={(ev: ChangeEvent<HTMLSelectElement>) => {}}
          defaultValue={searchFilters.estado}
          required
        />
        <Input
          id="dateInit"
          name="date_search"
          label="Fecha inicial"
          type="date"
          defaultValue={searchFilters.date_search[0]}
        />
        <Input
          id="dateEnd"
          name="date_search"
          label="Fecha final"
          type="date"
          defaultValue={searchFilters.date_search[1]}
        />
        {tsUserPermissionsList.includes(
          enumBilleteraComisiones.ver_historial_transferencia_billetera_up_soporte
        ) && (
          <Input
            id="fk_id_user"
            name="fk_id_user"
            label={"Id usuario"}
            type="tel"
            maxLength={10}
            autoComplete="off"
            defaultValue={searchFilters.fk_id_user}
          />
        )}
      </DataTable>
    </Fragment>
  );
};

export default HistorialDispersionesUsuarioPadre;
