import React from "react";
import { useNavigate } from "react-router-dom";

import Table from "../../../components/Base/Table/Table";
import { useState, useEffect } from "react";
import Form from "../../../components/Base/Form/Form";
import Select from "../../../components/Base/Select/Select";
import Input from "../../../components/Base/Input/Input";
import Fieldset from "../../../components/Base/Fieldset/Fieldset";
import LogoPDP from "../../../components/Base/LogoPDP/LogoPDP";
import Modal from "../../../components/Base/Modal/Modal";
import Button from "../../../components/Base/Button/Button";
import classes from "../views/GestoresComerciales.module.css";
const GestoresComerciales = () => {
  const { ContenedorTabla } = classes;
  const navigate = useNavigate();

  const [asesoresComerciales, setAsesoresComerciales] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_URL_SERVICE_COMMERCE}/asesor`)
      .then((response) => response.json())
      .then((respuesta) =>
        /*  console.log(
            respuesta.obj.results[0]["estado"]
          )  */ setAsesoresComerciales(respuesta.obj.results)
      );
  }, []);
  const handleSubmit = () => {
    navigate(`/administradorgestorcomercial/admin/crearasesor`);
  };
  asesoresComerciales.filter((e) => {
    if (e.estado == true) {
      e.estado = "Activo";
    } else if (e.estado == false) {
      e.estado = "Inactivo";
    }
  });
  return (
    <div className={ContenedorTabla}>
      <Table
        headers={["Id Asesor", "Nombre Asesor", "Estado", "Responsable"]}
        data={asesoresComerciales.map(
          ({ id_asesor, nom_asesor, estado, responsable }) => ({
            id_asesor,
            nom_asesor,
            estado,
            responsable: responsable["nombre"],
          })
        )}
        onSelectRow={(e, i) =>
          navigate(
            `/administradorgestorcomercial/admin/modificarasesor/${asesoresComerciales[i]["id_asesor"]}`
          )
        }
      ></Table>
      <Button type="" onClick={() => handleSubmit()}>
        Agregar Asesor
      </Button>
    </div>
  );
};
export default GestoresComerciales;
