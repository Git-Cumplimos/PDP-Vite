import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
// import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

import { useAuth } from "../../../../hooks/AuthHooks";

import { useFetch } from "../../../../hooks/useFetch";

import { notifyError } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input";

const url = process.env.REACT_APP_URL_PinesVus;

const reportPermisions = {
  "sftp_user/prueba_Pines/": 41,
};

const filterPermissions = (permissionList) => {
  const filteredReports = [
    ...Object.entries(reportPermisions).filter(([, permission]) => {
      if (permissionList.includes(permission)) {
        return true;
      }
      return false;
    }),
  ].map(([path]) => path);
  return filteredReports;
};

const DescargarReportePines = () => {
  const { userPermissions } = useAuth();

  const [fileList, setFileList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(1);

  const [route, setRoute] = useState("sftp_user/prueba_Pines/");

  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();
  const [fecha_reporte, setFecha_reporte] = useState("")

  const mappedPermissions = useMemo(
    () =>
      filterPermissions(
        userPermissions.map(({ id_permission }) => id_permission)
      ),
    [userPermissions]
  );

  useEffect(() => {
    if (fecha_reporte !== ''){
    const query = {fechaReportes : fecha_reporte}  
    fetchList(`${url}/listarArchivosS3`, "GET", query)
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        console.log(res)
        const listOfFiles = (res?.obj?.results?.results || []).map(
          ({ name, type, date }) => ({
            name,
            type,
            date: date
              ? Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                }).format(new Date(date))
              : "",
          })
        );
        setFileList(res?.obj);
        setMaxPages(res?.obj?.results?.maxpages || 1);
      })
      .catch((err) => console.error(err));
    }
  }, [fecha_reporte, pageData]);

  const isLoading = useMemo(
    () => loadingList || loadingFile,
    [loadingList, loadingFile]
  );

  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Vista de reportes</h1>
      <TableEnterprise
        title="Vista de reportes"
        maxPage={maxPages}
        // onChange={onChange}
        headers={["Archivos"]}
        data={fileList.map(
          ({ archivo }) => {
            return {
              archivo
            };
          }
        )}
        onSelectRow={(_, i) => {
          console.log(`${route}${fileList[i]?.archivo}`, fileList[i]?.url)
          window.open(fileList[i]?.url, "_blank");
        }}
        onSetPageData={setPageData}
      >
        <Input
            id="dateInit"
            label="Fecha participación"
            type="date"
            value={fecha_reporte}
            onInput={(e) => setFecha_reporte(e.target.value)}
          />
      </TableEnterprise>
    </Fragment>
  );
};

export default DescargarReportePines;
