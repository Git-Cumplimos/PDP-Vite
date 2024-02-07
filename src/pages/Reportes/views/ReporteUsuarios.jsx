import { Fragment, useCallback, useState } from "react";
// import { useAuth } from "../../../hooks/AuthHooks";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import {makeDateFormatter} from "../../../utils/functions";
// import {fetchReporteUsuario} from "../utils/fechReporte";
import * as XLSX from "xlsx";
import { notifyError } from "../../../utils/notify";
import useFetchDispatchDebounce from "../../../hooks/useFetchDispatchDebounce";

const url = `${process.env.REACT_APP_URL_CAJA}/reportes`;
// const url = `http://127.0.0.1:5000/reportes`;

const dateFormatter = makeDateFormatter(true);

const ReporteUsuarios = () => {
  const [disablereport, setDisablereport] = useState(false);
  // const [userData, setUserData] = useState(null);

  const [getUser] = useFetchDispatchDebounce(
    {
      onSuccess: useCallback((res) => handle(res)),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 100 }
  );

  const handle = useCallback((data) => {
    setDisablereport(true)
    let listValue = []
    listValue.push([
      'ID USUARIO',
      'CORREO',
      'NOMBRE',
      'NUMERO DOCUMENTO',
      'TIPO DOCUMENTO',
      'TELEFONO',
      'DIRECCION',
      'ESTADO',
      "ID COMERCIO ASOCIADO",
      'ID TERMINAL',
      'OTP VERIFICADO',
      'ID USUARIO ULTIMA ACTUALIZACION',
      'ID USUARIO SUSER',
      'COMERCIO PADRE',
      'FECHA DE ACTUALIZACION',
      'FECHA DE REGISTRO',
    ])
    data?.obj?.results.map((e)=>listValue.push([
    e.uuid,
    e.email,
    e.uname,
    e.doc_id,
    e.tipo_doc,
    e.phone,
    e.direccion,
    e.estado,
    e.fk_id_comercio,
    e.id_terminal,
    e.otp_verifed,
    e.usuario_ultima_actualizacion,
    e.id_usuario_suser,
    e.is_comercio_padre,
    dateFormatter.format(new Date(e.fecha_registro)),
    dateFormatter.format(new Date(e.fecha_actualizacion)),
    ]))
    var today = new Date()
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    var formattedDate = year + month + day;
    var file_name = `REPORTE USUARIOS ${formattedDate}.xlsx`
    var libro = XLSX.utils.book_new();
    libro.SheetNames.push("Usuarios");
    libro.Sheets["Usuarios"] = XLSX.utils.aoa_to_sheet(listValue);
    setTimeout(() => {
      XLSX.writeFile(libro,file_name)
      setDisablereport(false)
    },1000);
  },[]);

  return (
    <Fragment>
      <h1 className="text-3xl ">Reporte Usuarios</h1>
        <ButtonBar>
          <Button onClick={() => {getUser(`${url}/file-usuarios`);setDisablereport(true)}} type='submit' disabled={disablereport}>
            Generar reporte
          </Button>
        </ButtonBar>
    </Fragment>
  )
}

export default ReporteUsuarios