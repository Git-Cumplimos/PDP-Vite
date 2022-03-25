import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import TableEnterprise from "../../../components/Base/TableEnterprise";

import { useFetch } from "../../../hooks/useFetch";

import { notifyError } from "../../../utils/notify";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const Koncilia = () => {
  const [fileList, setFileList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(1);
  // const [utilsTable, setUtilsTable] = useState({});

  const [route, setRoute] = useState("");

  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();

  useEffect(() => {
    fetchList(`${url}/read-files`, "GET", { path: route, ...pageData })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setFileList(
          (res?.obj?.results || []).map(({ name, type, date }) => ({
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
          }))
        );
        setMaxPages(res?.obj?.maxpages || 1);
      })
      .catch((err) => console.error(err));
  }, [route, fetchList, pageData]);

  // useEffect(() => {
  //   utilsTable?.resetPage?.();
  // }, [route, utilsTable]);

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
        // onSetUtilsFuncs={setUtilsTable}
      >
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
            Atras
          </Button>
        </ButtonBar>
      </TableEnterprise>
    </Fragment>
  );
};

export default Koncilia;
