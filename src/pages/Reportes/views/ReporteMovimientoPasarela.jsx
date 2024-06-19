import { Fragment, useEffect, useMemo, useState, useCallback, } from "react";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notify } from "../../../utils/notify";
import useFetchDebounce from "../../../hooks/useFetchDebounce";

const url = process.env.REACT_APP_URL_PASARELAS;

const ReporteMovimientoPasarela = () => {
  const [fecha, setFecha] = useState("");
  const [fileList, setFileList] = useState([]);
  const [urlList, setUrlList] = useState([]);
  const [pageData, setPageData] = useState({ page: 1, limit: 10, date: undefined});
  const [maxPages, setMaxPages] = useState(1);
   

  /////////////////////// BANDERA ////////////
  const handleClose = useCallback(() => {
    setFecha("");
  }, []);

  const [File, loadingFiles] = useFetchDebounce(
    {
      url: `${url}backend/pasarela-pagos/movimiento-pasarelas`,
      options: useMemo(() => {
          if (fecha !== ""){
            pageData.fecha_reporte=fecha
          }          
          return {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageData),
          }
        }, [fecha,pageData]),
        autoDispatch: true,
    },
    {
      onPending: useCallback(() => "Enlistando archivos", []),
      onSuccess: useCallback((res) => {
        const listOfFiles = (res?.obj?.result?.archivos || []).map(
          ({ archivo, tipo, fecha}) => ({
            archivo,
            tipo,
            date: fecha
              ? Intl.DateTimeFormat("es-CO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "numeric",
                }).format(new Date(fecha))
              : "",
          })
        );
        const listOfUrl = (res?.obj?.result?.archivos || []).map(
          ({ url}) => ({
            url
          })
        );
        setFileList(listOfFiles);
        setUrlList(listOfUrl);
        setMaxPages(res?.obj?.result?.maxpages || 1);
        handleClose();
        return "Listado de archivo de movimiento exitosa";
      }, [handleClose]),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          return error.message;
        } else {
          console.error(error);
          return "Error enlistando los archivos";
        }
      }, []),
    }
  );

  useEffect(() => {
    File()
  }, [File,pageData,fecha]);

  const searchDate = useCallback((ev) => {
    setFecha(ev.target.value)
    File()
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Reporte Movimientos Pasarelas</h1>
      <TableEnterprise
        title="Vista de reportes"
        headers={["Nombre", "Tipo", "Fecha Generación"]}
        maxPage={maxPages}
        data={fileList}
        onSelectRow={(_, i) => {
          if (!loadingFiles) {
            window.open(urlList[i].url, "_blank");
            notify('El reporte de movimientos fue descargado exitosamente')
            }
          }
        }
        onSetPageData={setPageData}
      >
        <Input
          id={"date_report"}
          name={"date_ini"}
          label={"Fecha"}
          type={"date"}
          onChange={(ev) => searchDate(ev)}
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default ReporteMovimientoPasarela;
