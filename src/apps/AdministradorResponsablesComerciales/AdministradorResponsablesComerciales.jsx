import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Base/Button/Button";
import Table from "../../components/Base/Table/Table";
import classes from "./AdministradorResponsablesComerciales.module.css";
const { contenedorPrincipal } = classes;
const AdministradorResponsablesComerciales = () => {
  const navigate = useNavigate();
  const [responsables, setResponsables] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL_SERVICE_COMMERCE}/responsables`)
      .then((response) => response.json())
      .then((respuesta) =>
        /*  console.log(
            respuesta.obj.results[0]["estado"]
          )  */ setResponsables(respuesta.obj.results)
      );
  }, []);
  responsables.filter((e) => {
    if (e.estado == true) {
      e.estado = "Activo";
    } else if (e.estado == false) {
      e.estado = "Inactivo";
    }
  });
  return (
    <div className={contenedorPrincipal}>
      <Table
        headers={["Id Responsable", "Nombre Responsable", "Estado"]}
        data={responsables.map(({ id_responsable, nombre, estado }) => ({
          id_responsable,
          nombre,
          estado,
        }))}
        onSelectRow={(e, i) =>
          navigate(
            `/administradorresponsablecomercial/modificarresponsable/${responsables[i]["id_responsable"]}`
          )
        }
      ></Table>
      <Button type="" /* onClick={() => handleSubmit()} */>
        Agregar Responsable
      </Button>
    </div>
  );
};

export default AdministradorResponsablesComerciales;
