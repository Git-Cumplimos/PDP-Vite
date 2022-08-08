//import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Base/Input";
import Select from "../../components/Base/Select";
//import Table from "../../components/Base/Table";
import TableEnterprise from "../../components/Base/TableEnterprise";
import fetchData from "../../utils/fetchData";
import { notifyError } from "../../utils/notify";
const ValidacionApertura = () => {
  const navigate = useNavigate();
  const [datosEnrolamientos, setDatosEnrolamientos] = useState([]);
  const [datosOrdenados, setOrdenados] = useState(0);
  const [datosFiltradosFecha, setDatosFiltradosFecha] = useState([]);
  const [datosFiltradosEstado, setDatosFiltradosEstado] = useState([]);
  const [datosFiltradosNumero, setDatosFiltradosNumero] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [estadoProceso, setEstadoProceso] = useState("");
  const [numeroProceso, setNumeroProceso] = useState("");
  //const [keys, setKey] = useState(0);
  /* const [datosFiltrados, setDatosFiltrados] = useState(["perro"]);  */
  useEffect(() => {
    fetchData(
      /*  `http://127.0.0.1:5000/actualizacionestado` */
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?id_reconocer=-`,
      "GET",
      {},
      {},
      false
    )
      /*    .then((response) => response.json()) */
      .then((respuesta) => {
        setDatosEnrolamientos(respuesta?.obj?.results);
        setCantidadPaginas(respuesta?.obj?.maxPages);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos ");
      });
  }, []);
  useEffect(() => {
    if (fechaInicial && fechaFinal) {
      fetchData(
        /* `http://127.0.0.1:5000/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&validation_state=${estadoProceso}`, */
        /*         `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&validation_state=${estadoProceso}`,
         */ `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}`,
        "GET"
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          setDatosFiltradosFecha(respuesta?.obj?.results);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al cargar Datos Por Fecha y Estado");
        });
    }
  }, [fechaInicial, fechaFinal /* , estadoProceso */]);

  useEffect(() => {
    if (estadoProceso) {
      fetchData(
        /*  `http://127.0.0.1:5000/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&validation_state=${estadoProceso}` */
        /* `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?validation_state=En Proceso de Validación`, */
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?validation_state=${estadoProceso}`,
        "GET",
        {},
        {},
        false
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          setDatosFiltradosEstado(respuesta?.obj?.results);
        });
    }
  }, [estadoProceso]);
  useEffect(() => {
    if (numeroProceso) {
      fetchData(
        /*  `http://127.0.0.1:5000/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}&validation_state=${estadoProceso}` */
        /* `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?validation_state=En Proceso de Validación`, */
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?numDoc=${numeroProceso}`,
        "GET",
        {},
        {},
        false
      )
        /* .then((response) => response.json()) */
        .then((respuesta) => {
          setDatosFiltradosNumero(respuesta?.obj?.results);
        });
    }
  }, [numeroProceso]);
  console.log(datosOrdenados);
  datosEnrolamientos.map((e) => delete e.task_token);
  datosEnrolamientos.map((e) => delete e.id_reconocer);
  //const datosFiltrados = datosEnrolamientos.map((e) => Object.values(e));
  //const key = datosEnrolamientos.map((e) => Object.keys(e));

  console.log(datosEnrolamientos);
  datosEnrolamientos.filter((e) => {
    if (e.validation_state === "101") {
      e.validation_state = "Habilitado Para ReconoserID";
    } else if (e.validation_state === "102") {
      e.validation_state = "Rechazado Para ReconoserID";
    } else if (e.validation_state === "201") {
      e.validation_state = "Aprobado Para Crear Comercio";
    } else if (e.validation_state === "202") {
      e.validation_state = "Rechazado Para Crear Comercio";
    } else if (e.validation_state === "200") {
      e.validation_state = "Pendiente De Aprobación";
    }
  });
  datosFiltradosEstado?.filter((e) => {
    if (e.validation_state === "101") {
      e.validation_state = "Validado Para reconoserID";
    } else if (e.validation_state === "102") {
      e.validation_state = "Rechazado Para reconoserID";
    } else if (e.validation_state === "201") {
      e.validation_state = "Aprobado Para Crear Comercio";
    } else if (e.validation_state === "202") {
      e.validation_state = "Rechazado Para Crear Comercio";
    }
  });
  datosFiltradosFecha?.filter((e) => {
    if (e.validation_state === "101") {
      e.validation_state = "Validado Para ReconoserID";
    } else if (e.validation_state === "102") {
      e.validation_state = "Rechazado Para reconoserID";
    } else if (e.validation_state === "201") {
      e.validation_state = "Aprobado Para Crear Comercio";
    } else if (e.validation_state === "202") {
      e.validation_state = "Rechazado Para Crear Comercio";
    }
  });
  datosFiltradosNumero?.filter((e) => {
    if (e.validation_state === "101") {
      e.validation_state = "Validado Para ReconoserID";
    } else if (e.validation_state === "102") {
      e.validation_state = "Rechazado Para reconoserID";
    } else if (e.validation_state === "201") {
      e.validation_state = "Aprobado Para Crear Comercio";
    } else if (e.validation_state === "202") {
      e.validation_state = "Rechazado Para Crear Comercio";
    }
  });

  return (
    <div>
      {datosFiltradosFecha?.length > 0 ? (
        <TableEnterprise
          maxPage={cantidadPaginas}
          title="Enrolamiento de Comercios"
          headers={[
            "Id_proceso",
            "Nombre",
            "Estado",
            "Departamento",
            "Fecha Inicio",
          ]}
          data={datosFiltradosFecha.map(
            ({
              id_proceso,
              nombre,
              apellido,
              validation_state,
              departamento,
              fecha_inicio,
            }) => ({
              id_proceso,
              nombre: `${nombre} ${apellido}`,

              validation_state,
              departamento,
              fecha_inicio,
            })
          )}
          onSelectRow={(e, i) =>
            navigate(
              `/Solicitud-enrolamiento/validarformulario/verificaciondatos/${datosEnrolamientos[i]["id_proceso"]}`
            )
          }
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
          <Select
            label="Estado Comercio"
            options={{
              "": "",
              "En Proceso de Validacion": "En Proceso de Validación",
              "Aprobado Para ReconoserID": "101",
              "Rechazado Para ReconoserID": "102",
              "Pendiente Validación Identidad": "200",
              "Enrolamiento Exitoso": "201",
              "Enrolamiento Rechazado": "202",
            }}
            value={estadoProceso}
            /* required={true} */
            onChange={(e) => {
              setEstadoProceso(e.target.value);
            }}
          />
          <Input
            label={"Numero Documento"}
            placeholder="Ej:10306520..."
            value={numeroProceso}
            onChange={(e) => setNumeroProceso(e.target.value)}
            type="number"
          ></Input>
        </TableEnterprise>
      ) : datosFiltradosEstado?.length > 0 ? (
        <TableEnterprise
          maxPage={cantidadPaginas}
          title="Enrolamiento de Comercios"
          headers={[
            "Id_proceso",
            "Nombre",
            "Estado",
            "Departamento",
            "Fecha Inicio",
          ]}
          data={datosFiltradosEstado?.map(
            ({
              id_proceso,
              nombre,
              apellido,
              validation_state,
              departamento,
              fecha_inicio,
            }) => ({
              id_proceso,
              nombre: `${nombre} ${apellido}`,

              validation_state,
              departamento,
              fecha_inicio,
            })
          )}
          onSelectRow={(e, i) =>
            navigate(
              `/Solicitud-enrolamiento/validarformularioreconoserid/verificacionapertura/${datosEnrolamientos[i]["id_proceso"]}`
            )
          }
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
          <Select
            label="Estado Comercio"
            options={{
              "": "",
              "En Proceso de Validacion": "En Proceso de Validación",
              "Aprobado Para ReconoserID": "101",
              "Rechazado Para ReconoserID": "102",
              "Pendiente Validación Identidad": "200",
              "Enrolamiento Exitoso": "201",
              "Enrolamiento Rechazado": "202",
            }}
            value={estadoProceso}
            /* required={true} */
            onChange={(e) => {
              setEstadoProceso(e.target.value);
            }}
          />
          <Input
            label={"Numero Documento"}
            placeholder="Ej:10306520..."
            value={numeroProceso}
            onChange={(e) => setNumeroProceso(e.target.value)}
            type="number"
          ></Input>
        </TableEnterprise>
      ) : datosFiltradosNumero?.length > 0 ? (
        <TableEnterprise
          maxPage={cantidadPaginas}
          title="Enrolamiento de Comercios"
          headers={[
            "Id_proceso",
            "Nombre",
            "Estado",
            "Departamento",
            "Fecha Inicio",
          ]}
          data={datosFiltradosNumero?.map(
            ({
              id_proceso,
              nombre,
              apellido,
              validation_state,
              departamento,
              fecha_inicio,
            }) => ({
              id_proceso,
              nombre: `${nombre} ${apellido}`,

              validation_state,
              departamento,
              fecha_inicio,
            })
          )}
          onSelectRow={(e, i) =>
            navigate(
              `/Solicitud-enrolamiento/validarformularioreconoserid/verificacionapertura/${datosEnrolamientos[i]["id_proceso"]}`
            )
          }
        >
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
          <Select
            label="Estado Comercio"
            options={{
              "": "",
              "En Proceso de Validacion": "En Proceso de Validación",
              "Aprobado Para ReconoserID": "101",
              "Rechazado Para ReconoserID": "102",
              "Pendiente Validación Identidad": "200",
              "Enrolamiento Exitoso": "201",
              "Enrolamiento Rechazado": "202",
            }}
            value={estadoProceso}
            /* required={true} */
            onChange={(e) => {
              setEstadoProceso(e.target.value);
            }}
          />
          <Input
            label={"Numero Documento"}
            placeholder="Ej:10306520..."
            value={numeroProceso}
            onChange={(e) => setNumeroProceso(e.target.value)}
            type="number"
          ></Input>
        </TableEnterprise>
      ) : (
        <TableEnterprise
          title="Verificación ReconoserID"
          maxPage={cantidadPaginas}
          headers={["Id_proceso", "Nombre", "Estado", "Fecha Inicio"]}
          data={datosEnrolamientos?.map(
            ({
              id_proceso,
              nombre,
              apellido,
              validation_state,
              fecha_inicio,
            }) => {
              const tempDate = new Date(fecha_inicio);
              tempDate.setHours(tempDate.getHours() + 5);
              fecha_inicio = Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(tempDate);

              return {
                id_proceso,
                nombre: `${nombre} ${apellido}`,
                validation_state,
                fecha_inicio,
              };
            }
          )}
          onSelectRow={(e, i) =>
            navigate(
              `/Solicitud-enrolamiento/validarformularioreconoserid/verificacionapertura/${datosEnrolamientos[i]["id_proceso"]}`
            )
          }
        >
          <Input
            id="dateInit"
            label="Fecha Inicial"
            type="date"
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <Input
            id="dateEnd"
            label="Fecha Final"
            type="date"
            value={fechaFinal}
            onInput={(e) => {
              setFechaFinal(e.target.value);
            }}
          />
          <Select
            label="Estado Comercio"
            options={{
              "": "",
              "En Proceso de Validacion": "En Proceso de Validación",
              "Aprobado Para ReconoserID": "101",
              "Rechazado Para ReconoserID": "102",
              "Pendiente Validación Identidad": "200",
              "Enrolamiento Exitoso": "201",
              "Enrolamiento Rechazado": "202",
            }}
            value={estadoProceso}
            /* required={true} */
            onChange={(e) => {
              setEstadoProceso(e.target.value);
            }}
          />
          <Input
            label={"Numero Documento"}
            placeholder="Ej:10306520..."
            value={numeroProceso}
            onChange={(e) => setNumeroProceso(e.target.value)}
            type="number"
          ></Input>
        </TableEnterprise>
      )}
    </div>
  );
};

export default ValidacionApertura;
