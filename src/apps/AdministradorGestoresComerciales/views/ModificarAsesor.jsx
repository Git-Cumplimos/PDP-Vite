import React from "react";
import Button from "../../../components/Base/Button/Button";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import classes from "./ModificarAsesores.module.css";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
function ModificarAsesor() {
  const {
    contenedorPrincipal,
    contenedorNombreAsesor,
    contenedorItems,
    contenedorResponsable,
  } = classes;
  const [datosAsesores, setDatosAsesores] = useState(0);
  const [responsables, setResponsables] = useState(0);
  const [estadoAsesor, setEstadoAsesor] = useState();
  const [cambioResponsable, setCambioResponsable] = useState(0);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesores?id_asesor=${params.id}`,
      "GET",
      {}
    )
      .then((respuesta) => setDatosAsesores(respuesta.obj.results))
      .catch(() => {});
  }, []);
  /*   console.log(datosAsesores); */

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables`,
      "GET"
    ).then((respuesta) => setResponsables(respuesta.obj.results));
  }, []);

  const ActualizarDatosAsesor = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesores?id_asesor=${params.id}`,
      "PUT",
      {},
      { estado: estadoAsesor, id_responsable: parseInt(cambioResponsable) },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta /* .obj.data */));
    notify("El Asesor ha sido Actualizado con Exito.");
    setTimeout(() => navigate("/administradorgestorcomercial/admin"), 2500);
  };
  return (
    <div className={contenedorPrincipal}>
      {datosAsesores && responsables ? (
        <div className={contenedorItems}>
          <Form>
            <div className={contenedorNombreAsesor}>
              <Fieldset legend="Modificar Asesor">
                <div className={contenedorNombreAsesor}>
                  <Input
                    label={"Nombre Asesor"}
                    placeholder={datosAsesores[0].nom_asesor}
                    type={"text"}
                    disabled
                  ></Input>
                  <Input
                    label={"Estado Actual Asesor"}
                    placeholder={
                      datosAsesores[0].estado === true ? "Activo" : "Inactivo"
                    }
                    type={"text"}
                    disabled
                  ></Input>
                </div>
                <div className={contenedorItems}>
                  <div className={contenedorResponsable}>
                    <Select
                      onChange={(event) =>
                        setCambioResponsable(event.target.value)
                      }
                      id="comissionType"
                      name="comissionType"
                      label={`Seleccione Responsable`}
                      options={
                        Object.fromEntries([
                          ["", ""],
                          ...responsables.map(({ nombre, id_responsable }) => {
                            return [nombre, id_responsable];
                          }),
                        ]) || { "": "" }
                      }
                    ></Select>
                  </div>
                  <Select
                    onChange={(event) =>
                      setEstadoAsesor(
                        event.target.value === "true" ? true : false
                      )
                    }
                    id="comissionType"
                    name="comissionType"
                    label={`Estado Asesor Comercial`}
                    options={{
                      "": "",
                      Activo: "true",
                      Inactivo: "false",
                    }}
                  ></Select>
                </div>
              </Fieldset>
            </div>
          </Form>
          <div>
            <Button type={""} onClick={(e) => ActualizarDatosAsesor(e)}>
              Modificar y Guardar
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default ModificarAsesor;
