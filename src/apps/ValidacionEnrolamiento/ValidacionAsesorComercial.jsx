import React from "react";
import Table from "../../components/Base/Table/Table";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ValidacionAsesorComercial() {
  const navigate = useNavigate();
  const [datosEnrolamientos, setDatosEnrolamientos] = useState([]);
  const [datosOrdenados, setOrdenados] = useState(0);
  const [keys, setKey] = useState(0);
  /* const [datosFiltrados, setDatosFiltrados] = useState(["perro"]);  */
  useEffect(() => {
    fetch(
      /*  `http://127.0.0.1:5000/actualizacionestado` */
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?validation_state=En Proceso de Validación`
    )
      .then((response) => response.json())
      .then((respuesta) => setDatosEnrolamientos(respuesta.obj.results));
  }, []);
  /*   console.log(datosOrdenados); */
  datosEnrolamientos.map((e) => delete e.task_token);
  datosEnrolamientos.map((e) => delete e.id_reconocer);
  const datosFiltrados = datosEnrolamientos.map((e) => Object.values(e));
  const key = datosEnrolamientos.map((e) => Object.keys(e));

  datosEnrolamientos.filter((e) => {
    if (e.validation_state === "101") {
      e.validation_state = "Validado Para reconoser";
    } else if (e.validation_state === "102") {
      e.validation_state = "Rechazado Para reconoser";
    }
  });

  /*   console.log(datosEnrolamientos);
  console.log(datosFiltrados); */

  return (
    <div>
      <Table
        headers={["Id_proceso", "Nombre", "Estado"]}
        data={datosEnrolamientos.map(
          ({ id_proceso, nombre, apellido, validation_state }) => ({
            id_proceso,
            nombre: `${nombre} ${apellido}`,

            validation_state,
          })
        )}
        onSelectRow={(e, i) =>
          navigate(
            `/Solicitud-enrolamiento/validarformulario/verificaciondatos/${datosFiltrados[i][15]}`
          )
        }
      ></Table>
    </div>
  );
}

export default ValidacionAsesorComercial;
