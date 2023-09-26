import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
// import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import TextArea from "../../../components/Base/TextArea";
import { useAuth } from "../../../hooks/AuthHooks";

import { useFetch } from "../../../hooks/useFetch";

import { notifyError } from "../../../utils/notify";

// const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;
const url = `http://localhost:2000`;

const reportPermisions = {
  "reporte-general-transacciones/": 41,
  "reporte-general-transacciones-csv/": 41
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

const Koncilia = () => {
  const { userPermissions } = useAuth();

  const [fileList, setFileList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(1);

  const [route, setRoute] = useState("");

  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();

  const mappedPermissions = useMemo(
    () =>
      filterPermissions(
        userPermissions.map(({ id_permission }) => id_permission)
      ),
    [userPermissions]
  );

  useEffect(() => {
    fetchList(`${url}/read-files`, "GET", { path: route, ...pageData })
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
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                }).format(new Date(date))
              : "",
          })
        );
        const filteredFiles = listOfFiles.filter(
          ({ name }) =>
            route !== "" || (route === "" && mappedPermissions.includes(name))
        );
        setFileList(filteredFiles);
        setMaxPages(res?.obj?.maxpages || 1);
      })
      .catch((err) => console.error(err));
  }, [route, fetchList, pageData, mappedPermissions]);

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
        headers={["Nombre", "Tipo", "Ultima modificacion"]}
        data={fileList}
        onSelectRow={(_, i) => {
          if (!isLoading) {
            if (fileList[i]?.type === "Carpeta") {
              setRoute((old) => {
                return `${old}${fileList[i]?.name}`;
              });
            } else if (fileList[i]?.type === "Archivo") {
              fetchFile(`${url}/file-url`, "GET", {
                filename: `${route}${fileList[i]?.name}`,
              })
                .then((res) => {
                  if (!res?.status) {
                    notifyError(res?.msg);
                    return;
                  }
                  window.open(res?.obj, "_blank");
                })
                .catch((err) => console.error(err));
            }
          }
        }}
        onSetPageData={setPageData}
      >
        {/* <Input
          id={"date_report_koncilia_1"}
          name={"date_ini"}
          label={"Fecha inicial"}
          type={"date"}
        />
        <Input
          id={"date_report_koncilia_2"}
          name={"date_end"}
          label={"Fecha Final"}
          type={"date"}
        /> */}
        <TextArea
          id={"date_report_koncilia_2"}
          label={"Ruta"}
          value={route}
          readOnly
          rows={3}
        />
        <ButtonBar>
          <Button
            disabled={!route}
            onClick={() =>
              setRoute((old) => {
                const splited = old.split("/");
                splited.splice(splited.length - 2, 1);
                return `${splited.join("/")}`;
              })
            }
          >
            Ir una carpeta atras
          </Button>
        </ButtonBar>
      </TableEnterprise>
    </Fragment>
  );
};

export default Koncilia;
