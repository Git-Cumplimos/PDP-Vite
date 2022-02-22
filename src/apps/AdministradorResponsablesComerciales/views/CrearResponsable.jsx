import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import fetchData from "../../../utils/fetchData";
import { notify } from "../../../utils/notify";
const CrearResponsable = () => {
  const navigate = useNavigate();
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [estadoResponsable, setEstadoResponsable] = useState();
  const [datosZonas, setDatosZonas] = useState(0);
  const [asignarZona, setAsignarZona] = useState();

  const [datosResponsables, setDatosResponsables] = useState(0);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/zonas`,
      "GET"
    ).then((respuesta) => setDatosZonas(respuesta.obj.results));
  }, []);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables`,
      "GET"
    ).then((respuesta) => setDatosResponsables(respuesta.obj.results));
  }, []);

  const fCrearResponsable = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables`,
      "POST",
      {},
      {
        nombre: nombreResponsable,
        estado: estadoResponsable,
        zona: asignarZona,
      }
    ).then((respuesta) => console.log(respuesta));
    /*  notify("El Asesor Ha Sido Creado Con Exito.");
    setTimeout(() => navigate("/administradorgestorcomercial/admin"), 2500); */
  };

  /*   useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/unidades-de-negocio`,
      "GET"
    ).then((respuesta) => setUnidadesNegocio(respuesta.obj.results));
  }, []); */

  /* const fAsignarUnidadNegocio = (e) => {
    e.preventDefault();
    console.log(datosResponsables.length + 1);
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/reponsable-negocio`,
      "POST",
      {},
      {
        responsable_id_responsable: 9,
        negocio_id_negocio: asignarUnidadNegocio,
      },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta));
  }; */

  return (
    <div /* className={contenedorPrincipal} */>
      {datosZonas ? (
        <div /* className={contenedorItems} */>
          <Form>
            <div /* className={contenedorNombreAsesor} */>
              <Fieldset legend="Crear Responsable">
                <div /* className={contenedorNombreAsesor} */>
                  <Input
                    label={"Nombre Responsable"}
                    placeholder=" Nombre Completo"
                    value={nombreResponsable}
                    onChange={(e) => setNombreResponsable(e.target.value)}
                    type={"text"}
                  ></Input>
                </div>
                <div /* className={contenedorItems} */>
                  <Select
                    onChange={(event) =>
                      setEstadoResponsable(
                        event.target.value === "true" ? true : false
                      )
                    }
                    id="comissionType"
                    name="comissionType"
                    label={`Estado Responsable Comercial`}
                    options={{
                      "": "",
                      Activo: "true",
                      Inactivo: "false",
                    }}
                  ></Select>
                  <Select
                    onChange={(event) => setAsignarZona(event.target.value)}
                    id="comissionType"
                    name="comissionType"
                    value={asignarZona}
                    label={`Modificar Zona`}
                    options={
                      Object.fromEntries([
                        ["", ""],
                        ...datosZonas.map(({ zona }) => {
                          return [zona];
                        }),
                      ]) || { "": "" }
                    }
                  ></Select>
                </div>
              </Fieldset>
            </div>
          </Form>
          <div>
            <Button type={""} onClick={(e) => fCrearResponsable(e)}>
              Crear y Guardar
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default CrearResponsable;
