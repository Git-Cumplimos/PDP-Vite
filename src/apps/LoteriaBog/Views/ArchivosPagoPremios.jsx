import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import TextArea from "../../../components/Base/TextArea";
import { useFetch } from "../../../hooks/useFetch";
import { notifyError } from "../../../utils/notify";
import { useLoteria } from "../utils/LoteriaHooks";

const url = process.env.REACT_APP_URL_LOTERIAS;

const loteriasObj = {
    "02": "Lotería de Bogotá",
    "064": "Lotería de Bogotá Extraordinario",
    "23": "Lotería del Tolima",
    "10": "Lotería de Cundinamarca"
};

const ArchivosPagoPremios = () => {

  const [fileList, setFileList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(1);
  const [route, setRoute] = useState("");
  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();
  const { codigos_lot } = useLoteria();
  
  useEffect(() => {
    let cod = "";
    if (codigos_lot?.length === 2){
        cod= codigos_lot?.[0]?.cod_loteria +","+ codigos_lot?.[1]?.cod_loteria;
    }
    else{
        cod= codigos_lot?.[0]?.cod_loteria
    }
    fetchList(`${url}/listarPagosPremiosS3`, "GET", {idloteria: cod, path: route, ...pageData })
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
        setFileList(listOfFiles);
        setMaxPages(res?.obj?.maxpages || 1);
      })
      .catch((err) => console.error(err));
  }, [route, fetchList, pageData, codigos_lot]);

  const isLoading = useMemo(
    () => loadingList || loadingFile,
    [loadingList, loadingFile]
  );

  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Vista archivos de pago de premios</h1>
      <TableEnterprise
        title="Vista de reportes"
        maxPage={maxPages}
        headers={["Nombre", "Tipo", "Última modificación"]}
        // data={fileList}
        data={
            route.length === 0
              ? fileList?.map(({ name, ...rest }) => ({
                  name: loteriasObj[name.replace("/","")],
                  ...rest,
                }))
              : fileList
          }
        onSelectRow={(_, i) => {
          if (!isLoading) {
            if (fileList[i]?.type === "Carpeta") {
              setRoute((old) => {
                return `${old}${fileList[i]?.name}`;
              });
            } else if (fileList[i]?.type === "Archivo") {
              fetchFile(`${url}/readPagoPremiosS3`, "GET", {
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
        <TextArea
          id={"date_report_ArchivosPagoPremios_2"}
          label={"Ruta"}
        //   value={route}
        value={
            route.length > 0
            ? route
                .split("/")
                .map((part, ind) => (ind === 0 ? loteriasObj[part] : part))
                .join("/")
            : route
        }
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

export default ArchivosPagoPremios;