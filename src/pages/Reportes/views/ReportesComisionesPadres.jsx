import { Fragment, useCallback, useMemo, useState } from "react";

import { useAuth } from "../../../hooks/AuthHooks";

import useFetchDebounce from "../../../hooks/useFetchDebounce";
import DataTable from "../../../components/Base/DataTable";

const url = process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const ReportesComisionesPadres = () => {
  const { pdpUser } = useAuth();
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [reports, setReports] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${url}/servicio-reporte-aplicacion-comision/reportes-usuario-padre?uuid=${pdpUser?.uuid}`,
        [pdpUser?.uuid]
      ),
    },
    {
      onSuccess: useCallback((res) => {
        setIsNextPage(res?.obj?.next_exist);
        setReports(res?.obj?.results);
      }, []),
      onError: useCallback((error) => console.error(error), []),
    }
  );

  return (
    <Fragment>
      <DataTable
        title="Reporte comisiones hijos"
        headers={[
          "Fecha del reporte",
          "Nombre del archivo",
          "Fecha ultima modificación",
        ]}
        data={reports?.map(({ name, date, last_modified }) => ({
          date,
          name,
          last_modified,
        })) ?? []}
        onClickRow={(_, index) =>
          window.open(reports[index]?.presigned_url, "_blank")
        }
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={pageData.limit}
              onChangeLimit={(limit) =>
                setPageData((old) => ({ ...old, limit }))
              }
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setPageData((old) => ({
                  ...old,
                  page: isNextPage ? old.page + 1 : old.page,
                }))
              }
              onClickPrev={(_) =>
                setPageData((old) => ({
                  ...old,
                  page: old.page > 1 ? old.page - 1 : old.page,
                }))
              }
            />
          </Fragment>
        }
        onChange={(ev) => {}}
      />
    </Fragment>
  );
};

export default ReportesComisionesPadres;
