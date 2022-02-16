import React from "react";
import Button from "../../../components/Base/Button/Button";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import classes from "../views/CrearAsesor.module.css";
import { useState } from "react";
import { useEffect } from "react";
import { notify } from "../../../utils/notify";
import { useNavigate } from "react-router-dom";
const CrearAsesor = () => {
  const navigate = useNavigate();
  const {
    contenedorPrincipal,
    contenedorNombreAsesor,
    contenedorItems,
    contenedorResponsable,
  } = classes;
  const [responsables, setResponsables] = useState(0);
  const [estadoAsesor, setEstadoAsesor] = useState();
  const [cambioResponsable, setCambioResponsable] = useState(0);
  const [nombreAsesor, setNombreAsesor] = useState("");
  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsable`)
      .then((response) => response.json())
      .then((respuesta) => setResponsables(respuesta.obj.results));
  }, []);

  const CrearAsesor = (e) => {
    e.preventDefault();
    const datos = {
      nom_asesor: nombreAsesor,
      estado: estadoAsesor,
      id_responsable: parseInt(cambioResponsable),
    };
    fetch(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/crearasesor`,
      /* `http://127.0.0.1:5000/actualizacionestado?id_proceso=${params.id}` */ {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta));
    notify("El Asesor Ha Sido Creado Con Exito.");
    setTimeout(() => navigate("/administradorgestorcomercial/admin"), 2500);
  };
  return (
    <div className={contenedorPrincipal}>
      {responsables ? (
        <div className={contenedorItems}>
          <Form>
            <div className={contenedorNombreAsesor}>
              <Fieldset legend="Crear Asesor">
                <div className={contenedorNombreAsesor}>
                  <Input
                    label={"Nombre Asesor"}
                    placeholder="Ingrese Nombre Completo"
                    value={nombreAsesor}
                    onChange={(e) => setNombreAsesor(e.target.value)}
                    type={"text"}
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
            <Button type={""} onClick={(e) => CrearAsesor(e)}>
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

export default CrearAsesor;
