import { Fragment, useEffect, useMemo, useState } from "react";

import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
// import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

import { useAuth } from "../../../../hooks/AuthHooks";

import { useFetch } from "../../../../hooks/useFetch";

import { notifyError } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input";
import TextArea from "../../../../components/Base/TextArea";
// const url = process.env.REACT_APP_URL_PinesVus;
const url = `${process.env.REACT_APP_BASE_API}/cert/pinesVus`
// const reportPermisions = {
//   "sftp_user/prueba_Pines/": 41,
// };

// const filterPermissions = (permissionList) => {
//   const filteredReports = [
//     ...Object.entries(reportPermisions).filter(([, permission]) => {
//       if (permissionList.includes(permission)) {
//         return true;
//       }
//       return false;
//     }),
//   ].map(([path]) => path);
//   return filteredReports;
// };

const DescargarArchivoPeticiones = () => {
  const { userPermissions } = useAuth();

  const [fileList, setFileList] = useState([]);
//   const [pageData, setPageData] = useState({ page: 1, limit: 10 });
//   const [maxPages, setMaxPages] = useState(1);

  const [route, setRoute] = useState("sftp_user/prueba_Pines/");

  const [loadingList, fetchList] = useFetch();
  const [loadingFile, fetchFile] = useFetch();
  const [fecha, setFecha] = useState("")
//   const [fechaFin, setFechaFin] = useState("")
  const [dataTable, setDataTable] = useState([])
  const [disableBtn, setDisableBtn] = useState(true)
  const [carpeta, setCarpeta] = useState("")

//   const mappedPermissions = useMemo(
//     () =>
//       filterPermissions(
//         userPermissions.map(({ id_permission }) => id_permission)
//       ),
//     [userPermissions]
//   );

  useEffect(() => {
    if (fecha !== ''){
    const ruta=`Archivos_peticiones/Archivo_peticiones_${fecha}.csv`
    const query = {
      ruta : ruta
    }  
    fetchList(`${url}/descargaArchivosS3`, "GET", query)
      .then((res) => {
        if (!res?.status) {
            notifyError(res?.msg);
            setFileList([]);
            setDataTable([])
            return;
        }
        setFileList(res?.obj || []);
        setDataTable([{'Archivos': res?.obj?.archivo}] || [])
      })
      .catch((err) => console.error(err));
    }
  }, [fecha]);

  const isLoading = useMemo(
    () => loadingList || loadingFile,
    [loadingList, loadingFile]
  );

//   useEffect(() => {
//     const Data = []
//     setDisableBtn(true)
//     Object.keys(fileList).forEach(function(element) {
//       Data.push({"archivo":element})
//     });
//     setDataTable(Data)   
//   }, [setFileList, fileList])

  const modicarDataTable = (e) => {
    setDisableBtn(false)
    console.log(fileList?.[e])
    const Data = fileList?.[e].map(
      ({ archivo }) => {
        return {
          archivo
        };
      }
    )
    setDataTable(Data)
  };

//   const irAtras = (e) => {
//     setDisableBtn(true)
//     setCarpeta("")
//     const Data = []
//     Object.keys(fileList).forEach(function(element) {
//       Data.push({"archivo":element})
//     });
//     setDataTable(Data) 
//   };
  
  return (
    <Fragment>
      <h1 className="text-3xl font-medium my-6">Vista de peticiones</h1>
      <TableEnterprise
        title="Vista de peticiones"
        // maxPage={maxPages}
        // onChange={onChange}
        headers={["Archivos"]}
        data={dataTable}
        onSelectRow={(_, i) => {
          // console.log(`${dataTable[i]?.archivo}`, fileList[i]?.url)
        //   if(!disableBtn){
            window.open(fileList?.url, "_blank");
        //   }
        //   else{
        //     modicarDataTable(`${dataTable[i]?.archivo}`)
        //     setCarpeta(`${dataTable[i]?.archivo}`)
        //   }
        }}
        // onSetPageData={setPageData}
      >
        <Input
            id="dateInit"
            label="Fecha"
            type="date"
            value={fecha}
            onInput={(e) => setFecha(e.target.value)}
          />
        {/* <Input
            id="dateFin"
            label="Fecha final"
            type="date"
            value={fechaFin}
            onInput={(e) => setFechaFin(e.target.value)}
          /> */}
        {/* <TextArea
          id={"date_report_koncilia_2"}
          label={"Carpeta"}
          value={carpeta}
          readOnly
          rows={3}
        /> */}
        {/* <ButtonBar>
          <Button
            disabled={disableBtn}
            onClick={() =>
              irAtras()
            }
          >
            Ir atras
          </Button>
        </ButtonBar> */}
      </TableEnterprise>
    </Fragment>
  );
};

export default DescargarArchivoPeticiones;
