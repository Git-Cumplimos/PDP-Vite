import React, { Fragment, useEffect } from "react";
import Select from "../../../components/Base/Select";
import { useState } from "react";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";
const ReporteComercios = () => {
  const [tipoBusqueda, setTipoBusqueda] = useState("");
  const [estadoProceso, setEstadoProceso] = useState("");
  const [tipoZona, setTipoZona] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [datosEstadoProceso, setDatosEstadoProceso] = useState("");
  const [datosTipoZona, setDatosTipoZona] = useState("");
  const [datosFecha, setDatosFecha] = useState("");

  useEffect(() => {
    if (tipoBusqueda && estadoProceso) {
      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?validation_state=${estadoProceso}`,
        "GET"
      )
        .then((result) => setDatosEstadoProceso(result?.obj?.results))
        .catch((error) => {
          console.log(error);
          notifyError("Error al cargar Estado del Proceso");
        });
    }
  }, [tipoBusqueda, estadoProceso]);
  useEffect(() => {
    if (tipoBusqueda && tipoZona) {
      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?tipozona=${tipoZona}`,
        "GET"
      )
        .then((result) => setDatosTipoZona(result?.obj?.results))
        .catch((error) => {
          console.log(error);
          notifyError("Error al cargar Tipo de Zona");
        });
    }
  }, [tipoBusqueda, tipoZona]);

  useEffect(() => {
    if (tipoBusqueda && fechaInicial && fechaFinal) {
      fetchData(
        `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actualizacionestado?fecha_inicio_inicio=${fechaInicial}&fecha_inicio_fin=${fechaFinal}`,
        "GET"
      )
        .then((result) => setDatosFecha(result?.obj?.results))
        .catch((error) => {
          console.log(error);
          notifyError("Error al cargar Fechas");
        });
    }
  }, [tipoBusqueda, fechaInicial, fechaFinal]);
  if (datosEstadoProceso) {
    datosEstadoProceso.filter((e) => {
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
  }
  if (datosFecha) {
    datosFecha.filter((e) => {
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
  }

  if (datosTipoZona) {
    datosTipoZona.filter((e) => {
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
  }
  return (
    <div>
      <h1 className="w-full flex flex-col justify-center items-center my-8 text-3xl">
        Reporte Enrolamiento De Comercios
      </h1>

      <Select
        onChange={(event) => setTipoBusqueda(event.target.value)}
        id="comissionType" /* para que es esto */
        name="comissionType"
        required
        label={`Tipo de Reporte`}
        options={{
          "": "",
          "Estado Proceso": "validation_state",
          "Tipo Zona": "tipozona",
          "Fecha Inscripcion": "fecha_inicio",
        }}
      ></Select>

      {tipoBusqueda === "validation_state" ? (
        <Fragment>
          <Select
            onChange={(event) => setEstadoProceso(event.target.value)}
            id="comissionType" /* para que es esto */
            name="comissionType"
            required
            label={`Estado Proceso`}
            options={{
              "": "",
              "En Proceso de Validacion": "En Proceso de Validación",
              "Aprobado Para ReconoserID": "101",
              "Rechazado Para ReconoserID": "102",
              "Pendiente de Validación de Identidad ": "200",
              "Enrolamiento Exitoso": "201",
              "Enrolamiento Rechazado": "202",
            }}
          ></Select>
          {estadoProceso && datosEstadoProceso ? (
            <TableEnterprise
              title="Reporte Enrolamiento de Comercios"
              headers={[
                "Id_proceso",
                "Nombre",
                "Estado",
                "Departamento",
                "Fecha Inicio",
              ]}
              data={datosEstadoProceso?.map(
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
              /* onSelectRow={(e, i) =>
                navigate(
                  `/Solicitud-enrolamiento/validarformulario/verificaciondatos/${datosEnrolamientos[i]["id_proceso"]}`
                )
              } */
            ></TableEnterprise>
          ) : (
            ""
          )}
        </Fragment>
      ) : tipoBusqueda === "tipozona" ? (
        <Fragment>
          <Select
            onChange={(event) => setTipoZona(event.target.value)}
            id="comissionType" /* para que es esto */
            name="comissionType"
            required
            label={`Tipo De Zona`}
            options={{
              "": "",
              Norte: "1",
              Centro: "2",
              Occidente: "3",
            }}
          ></Select>
          {tipoZona && datosTipoZona ? (
            <TableEnterprise
              title="Reporte Enrolamiento de Comercios"
              headers={[
                "Id_proceso",
                "Nombre",
                "Estado",
                "Departamento",
                "Fecha Inicio",
              ]}
              data={datosTipoZona?.map(
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
            ></TableEnterprise>
          ) : (
            ""
          )}
        </Fragment>
      ) : tipoBusqueda === "fecha_inicio" ? (
        <div>
          <Input
            id="dateInit"
            label="Fecha inicial"
            type="date"
            onInput={(e) => {
              setFechaInicial(e.target.value);
            }}
          />
          <div className="my-2">
            <Input
              id="dateInit"
              label="Fecha Final"
              type="date"
              onInput={(e) => {
                setFechaFinal(e.target.value);
              }}
            />
          </div>
          {fechaInicial && fechaFinal && datosFecha ? (
            <TableEnterprise
              title="Reporte Enrolamiento de Comercios"
              headers={[
                "Id_proceso",
                "Nombre",
                "Estado",
                "Departamento",
                "Fecha Inicio",
              ]}
              data={datosFecha?.map(
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
            ></TableEnterprise>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ReporteComercios;
