import { Fragment, useEffect, useMemo, useState, useCallback, } from "react";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
// import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notifyError,notify } from "../../../utils/notify";

const url = process.env.REACT_APP_URL_CAJA;


const ReporteConsignacionesTransportadora = () => {
  // const { userPermissions } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10, date: undefined});
  const [maxPages, setMaxPages] = useState(1);
  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();

  useEffect(() => {
    getFile()
  }, [fetchList, pageData,]);

  const getFile = useCallback((date) => {
    pageData.date=date
    fetchList(`${url}/reportes/read-files-comprobantes`, "GET", { ...pageData })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        const listOfFiles = (res?.obj?.results || []).map(
          ({ name, type, date }) => ({
            name,
            type,
            date: date
              ? Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "numeric",
                }).format(new Date(date))
              : "",
          })
        );
        setFileList(listOfFiles);
        setMaxPages(res?.obj?.maxpages || 1);
      })
      .catch((err) => console.error(err));
  }, [fetchList, pageData,]);

  const isLoading = useMemo(
    () => loadingList || loadingFile,
    [loadingList, loadingFile]
  );

  const searchDate = (ev) => {
    getFile(ev.target.value)
  };

  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Reporte consignaciones y transportadora</h1>
      <TableEnterprise
        title="Vista de reportes"
        headers={["Nombre", "Tipo", "Última modificacion"]}
        maxPage={maxPages}
        data={fileList}
        onSelectRow={(_, i) => {
          if (!isLoading) {
              if (fileList[i]?.type === "Archivo") {
              fetchFile(`${url}/reportes/file-url-comprobantes`, "GET", {
                filename: `Reportes/${fileList[i]?.name}`,
              })
                .then((res) => {
                  if (!res?.status) {
                    notifyError(res?.msg);
                    return;
                  }
                  window.open(res?.obj, "_blank");
                  notify('El reporte de Consignaciones y Transportadora ha sido creado exitosamente')
                })
                .catch((err) => console.error(err));
            }
          }
        }}
        onSetPageData={setPageData}
      >
        <Input
          id={"date_report"}
          name={"date_ini"}
          label={"Fecha"}
          type={"date"}
          onChange={(ev) =>searchDate(ev)}
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default ReporteConsignacionesTransportadora;
