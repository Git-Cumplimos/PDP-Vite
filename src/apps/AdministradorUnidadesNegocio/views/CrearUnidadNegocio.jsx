import React from "react";
import Button from "../../../components/Base/Button/Button";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";

import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";

const CrearUnidadNegocio = () => {
  const [unidadDeNegocio, setUnidadDeNegocio] = useState();
  const navigate = useNavigate();
  const CrearNegocio = () => {
    fetchData(
      `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/unidades-de-negocio`,
      "POST",
      {},
      {
        nom_unidad_neg: unidadDeNegocio,
      }
    )
      /*   .then((response) => response.json()) */
      .then((respuesta) => console.log(respuesta))
      .catch(() => {});
  };
  return (
    <div>
      <Form>
        <div /* className={contenedorNombreAsesor} */>
          <Fieldset legend="Crear Unidad De Negocio">
            <div /* className={contenedorNombreAsesor} */>
              <Input
                label={"Nombre Comercio"}
                placeholder="Ingrese Nombre Comercio"
                value={unidadDeNegocio}
                onChange={(e) => setUnidadDeNegocio(e.target.value)}
                type={"text"}
              ></Input>
            </div>
          </Fieldset>
        </div>
      </Form>
      <div>
        <ButtonBar>
          <Button type={""} onClick={(e) => CrearNegocio(e)}>
            Crear y Guardar
          </Button>
        </ButtonBar>
      </div>
      ;
    </div>
  );
};

export default CrearUnidadNegocio;
