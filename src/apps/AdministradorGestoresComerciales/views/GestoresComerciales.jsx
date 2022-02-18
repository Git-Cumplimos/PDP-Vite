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
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination/Pagination";
const GestoresComerciales = () => {
  const { ContenedorTabla } = classes;
  const navigate = useNavigate();

  const [asesoresComerciales, setAsesoresComerciales] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState([]);

  useEffect(() => {
    const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;
    console.log(url);
    fetchData(`${url}/asesores`, "GET", {})
      .then((res) => setAsesoresComerciales(res.obj.results))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;
    console.log(url);
    fetchData(`${url}/asesores`, "GET", {})
      .then((res) => setCantidadPaginas(res.obj.maxPages))
      .catch((err) => console.error(err));
  }, []);
  const handleSubmit = () => {
    navigate(`/administradorgestorcomercial/admin/crearasesor`);
  };
  const AgregarComercio = () => {
    const spanResult = document.getElementById("result");
    spanResult.value = "";
    const x = document.getElementById("cars");
    for (let i = 0; i < x.option.length; i++) {
      if (x.option[i].selected === true) {
        spanResult.value += x.option[i].value + " ";
        document.getElementById("result").innerHTML = spanResult.value;
        document.getElementById("result").style.color = "green";
      }
    }
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
      <Pagination maxPage={cantidadPaginas} lgButtons={false} grid>
        {Array.isArray(asesoresComerciales) &&
        asesoresComerciales.length > 0 ? (
          <Table
            headers={["Id Asesor", "Nombre Asesor", "Estado", "Responsable"]}
            data={asesoresComerciales.map(
              ({ id_asesor, nom_asesor, estado, responsable }) => {
                return {
                  id_asesor,
                  nom_asesor,
                  estado,
                  responsable: responsable["nombre"],
                };
              }
            )}
            onSelectRow={(e, i) =>
              navigate(
                `/administradorgestorcomercial/admin/modificarasesor/${asesoresComerciales[i]["id_asesor"]}`
              )
            }
          ></Table>
        ) : (
          ""
        )}
      </Pagination>
      <Button type="" onClick={() => handleSubmit()}>
        Agregar Asesor
      </Button>

      <select name="cars" id="cars" multiple="multiple">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="opel">Opel</option>
        <option value="audi">Audi</option>
      </select>
      <span id="result"></span>
      <input
        type="button"
        id="but1"
        value="Click"
        onClick={() => AgregarComercio}
      />
    </div>
  );
};
export default GestoresComerciales;
