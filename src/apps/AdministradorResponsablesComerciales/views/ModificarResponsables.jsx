import React from "react";

import fetchData from "../../../utils/fetchData";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Form from "../../../components/Base/Form/Form";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import Button from "../../../components/Base/Button/Button";
import { notify } from "../../../utils/notify";
import SelecionarAsesor from "./SeleccionarAsesor";

const ModificarResponsables = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [datosResponsable, SetDatosResponsable] = useState(0);
  const [estadoResponsable, setEstadoResponsable] = useState();

  const [selected, setSelected] = useState(null);
  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "GET",
      {}
    )
      .then((respuesta) => SetDatosResponsable(respuesta.obj.results))
      .catch(() => {});
  }, []);

  const ActualizarDatosResponsable = (e) => {
    e.preventDefault();
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables?id_responsable=${params.id}`,
      "PUT",
      {},
      { estado: estadoResponsable },
      { "Content-type": "application/json" }
    ).then((respuesta) => console.log(respuesta /* .obj.data */));
    notify("El Asesor ha sido Actualizado con Exito.");
    setTimeout(() => navigate("/administradorresponsablecomercial"), 2500);
  };
  return (
    <div /* className={contenedorPrincipal} */>
      {datosResponsable ? (
        <div /* className={contenedorItems} */>
          <Form>
            <div /* className={contenedorNombreAsesor} */>
              <Fieldset legend="Modificar Responsable">
                <div /* className={contenedorNombreAsesor} */>
                  <Input
                    label={"Nombre Responsable"}
                    placeholder={datosResponsable[0].nombre}
                    type={"text"}
                    disabled
                  ></Input>
                  <Input
                    label={"Estado Actual Responsable"}
                    placeholder={
                      datosResponsable[0].estado === true
                        ? "Activo"
                        : "Inactivo"
                    }
                    type={"text"}
                    disabled
                  ></Input>
                </div>
                <div>
                  <Select
                    onChange={(event) =>
                      setEstadoResponsable(
                        event.target.value === "true" ? true : false
                      )
                    }
                    id="comissionType"
                    name="comissionType"
                    value={estadoResponsable}
                    label={`Estado Responsable Comercial`}
                    options={{
                      "": "",
                      Activo: "true",
                      Inactivo: "false",
                    }}
                  ></Select>
                </div>
                {/* <Pagination maxPage={typesDB?.maxPages} lgButtons={false} grid>
                  {Array.isArray(Object.keys(typesByPermissions)) &&
                  Object.keys(typesByPermissions).length > 0 ? (
                    <MultipleSelect
                      label={"Transacciones visibles para el permiso"}
                      options={typesByPermissions}
                      onChange={setTypesByPermissions}
                    />
                  ) : (
                    ""
                  )}
                  {Array.isArray(typesDB?.results) &&
                  typesDB?.results.length > 0 ? (
                    <Table
                      headers={["Id", "Nombre operacion", "Aliado"]}
                      data={typesDB?.results.map(
                        ({ id_tipo_operacion, Nombre, Aliado }) => {
                          return { id_tipo_operacion, Nombre, Aliado };
                        }
                      )}
                      onSelectRow={(e, i) => {
                        const { id_tipo_operacion, Nombre, Aliado_corto } =
                          typesDB?.results[i];
                        const copy = { ...typesByPermissions };
                        copy[
                          `${id_tipo_operacion}) ${Nombre} (${Aliado_corto})`
                        ] = true;
                        setTypesByPermissions({ ...copy });
                        // setTypesDB([]);
                      }}
                    />
                  ) : (
                    ""
                  )}
                </Pagination> */}
              </Fieldset>
            </div>
          </Form>
          <div>
            <Button type={""} onClick={(e) => ActualizarDatosResponsable(e)}>
              Modificar y Guardar
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ModificarResponsables;
