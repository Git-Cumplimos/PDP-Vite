import React, { Fragment, useEffect, useState } from "react";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import Form from "../../../components/Base/Form";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import {
  PeticionConciliacion,
  PeticionDescargar,
} from "../utils/fetchMovistar";

const URL = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/conciliacion/buscar`;
const URLDescarga = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/conciliacion/descargar`;

const ConcilacionMovistar = () => {
  const [paramts, setParamts] = useState({
    fechainicial: "",
    fechafinal: "",
    filtro: "",
    subfiltrocompleto: "",
    subfiltroincompleto: "",
  });

  const [banderaCheckbox, setBanderaCheckbox] = useState({
    p: true, //PtoPago
    m: true, //Movistar
    d: true, //Diferencias
  });

  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [table, setTable] = useState("");

  const [data, setData] = useState(null);

  useEffect(() => {
    let arrayParamts = [];
    let arraySubfiltroincompleto = [];
    for (let banderaInd in banderaCheckbox) {
      if (banderaCheckbox[banderaInd]) {
        arraySubfiltroincompleto.push(banderaInd);
      }
    }
    if (arraySubfiltroincompleto.length > 0) {
      arrayParamts.push(
        `subfiltroincompleto=${arraySubfiltroincompleto.join("")}`
      );
    }

    for (let nombreParamts in paramts) {
      if (paramts[nombreParamts] != "") {
        arrayParamts.push(`${nombreParamts}=${paramts[nombreParamts]}`);
      }
    }

    let URLCompleta = "";
    URLCompleta =
      arrayParamts.length > 0
        ? (URLCompleta = URL + "?" + arrayParamts.join("&"))
        : URL;

    PeticionConciliacion(URLCompleta).then((response) =>
      setData(response.obj.results)
    );
  }, [paramts, banderaCheckbox]);

  function FunctionInput(e) {
    setParamts((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
    if (e.target.name == "subfiltroincompleto") {
      setBanderaCheckbox((anterior) => ({
        ...anterior,
        [e.target.value]: e.target.checked,
      }));
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Conciliaciones Movistar</h1>
      <Form grid>
        <TableEnterprise
          title="Conciliación Movistar"
          maxPage={maxPages}
          headers={["Fecha", "PuntoDePago", "Movistar", "Diferencias"]}
          data={
            data?.map((inf) => ({
              Fecha: inf.fechabusqueda,
              ArchivoPuntoDePago: inf.ptopago.status,
              ArchivoMovistar: inf.movistar.status,
              Diferencias: inf.diferencias.status,
            })) ?? []
          }
          onSelectRow={(e, i) => {
            // console.log(e, data?.[i]);
            PeticionDescargar(
              URLDescarga+"?fechabusqueda=" +
                data?.[i].fechabusqueda
            );
          }}
          onSetPageData={setPageData}
        >
          <Input
            name="fechainicial"
            label="Fecha inicial"
            type="date"
            value={paramts.fechainicial}
            onChange={(e) => FunctionInput(e)}
          />
          <Input
            name="fechafinal"
            label="Fecha final"
            type="date"
            value={paramts.fechafinal}
            onChange={(e) => FunctionInput(e)}
          />
          <Select
            name="filtro"
            label="Tipo de busqueda"
            options={{
              Todas: "",
              "Conciliaciones efectivas": "completo",
              "Conciliaciones pendientes": "incompleto",
            }}
            value={paramts.filtro}
            onChange={(e) => FunctionInput(e)}
          />
          <br />
          {/* {paramts.filtro == "completo" ? (
            <Select
              name="subfiltrocompleto"
              label="Diferencias__________"
              options={{
                Todas: "",
                "Archivo de diferencias no registra ninguna diferencia": false,
                "Archivo de diferencias registra diferencias": true,
              }}
              value={paramts.subfiltrocompleto}
              onChange={(e) => FunctionInput(e)}
            />
          ) : (
            <></>
          )} */}
          {/* {paramts.filtro == "incompleto" ? (
            <>
              <label>Archivos Faltantes de Punto De Pago</label>
              <Input
                // label="Fecha finalf"
                name="subfiltroincompleto"
                type="checkbox"
                checked={banderaCheckbox.p}
                value={"p"}
                onChange={(e) => FunctionInput(e)}
              />
              <label>Archivo Faltantes de Movistar</label>
              <Input
                // label="Fecha finalf"
                name="subfiltroincompleto"
                type="checkbox"
                checked={banderaCheckbox.m}
                value={"m"}
                onChange={(e) => FunctionInput(e)}
              />
              <label>Archivo Faltantes de Diferencias</label>
              <Input
                // label="Fecha finalf"
                name="subfiltroincompleto"
                type="checkbox"
                checked={banderaCheckbox.d}
                value={"d"}
                onChange={(e) => FunctionInput(e)}
              />
            </>
          ) : (
            <></>
          )} */}
        </TableEnterprise>
      </Form>
    </div>
  );
};

export default ConcilacionMovistar;
