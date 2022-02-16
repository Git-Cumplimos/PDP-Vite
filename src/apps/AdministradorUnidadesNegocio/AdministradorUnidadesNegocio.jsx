import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Button from "../../components/Base/Button/Button";
import Table from "../../components/Base/Table/Table";
import classes from "./AdministradorUnidadesNegocio.module.css";
const AdministradorUnidadesNegocio = () => {
  const { contenedorPrincipal } = classes;
  const [unidadesDeNegocio, setUnidadesDeNegocio] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL_SERVICE_COMMERCE}/seachunidad`)
      .then((response) => response.json())
      .then((respuesta) => setUnidadesDeNegocio(respuesta.obj.results));
  }, []);
  return (
    <div className={contenedorPrincipal}>
      <Table
        headers={["Id Unidad Negocio", "Nombre Unidad de Negocio"]}
        data={unidadesDeNegocio.map(({ id_negocio, nom_unidad_neg }) => ({
          id_negocio,
          nom_unidad_neg,
        }))}
        /* onSelectRow={
          (e, i) =>
            navigate(
              `/administradorgestorcomercial/admin/modificarasesor/${datosAsesores[i]["codigo_asesor"]}`
            ) */
        /*   <Modal show>
            <LogoPDP></LogoPDP>

            <Input
              label={"Nombre Asesor"}
              placeholder={datosAsesores[i]["nombre_asesor"]}
              disabled
            ></Input>
          </Modal> */
        /*       } */
      ></Table>
      <Button
        type="" /* setEstadoForm((old) => !old) */ /*  handleSubmit()} */
        /* onClick={() => */
      >
        Agregar Unidad De Negocio
      </Button>
    </div>
  );
};

export default AdministradorUnidadesNegocio;
