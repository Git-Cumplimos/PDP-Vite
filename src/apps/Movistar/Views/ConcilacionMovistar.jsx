import React, { useEffect, useState } from "react";
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
  });

  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [data, setData] = useState(null);

  useEffect(() => {
    let arrayParamts = [];

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
  }, [paramts]);

  function FunctionInput(e) {
    setParamts((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl">Conciliaciones Movistar</h1>
      <Form grid>
        <TableEnterprise
          title="Conciliación Movistar"
          maxPage={maxPages}
          headers={["Fecha", "Punto de pago", "Movistar", "Diferencias"]}
          data={
            data?.map((inf) => ({
              Fecha: inf.fechabusqueda,
              ArchivoPuntoDePago: inf.ptopago.status,
              ArchivoMovistar: inf.movistar.status,
              Diferencias: inf.diferencias.status,
            })) ?? []
          }
          onSelectRow={(e, i) => {
            PeticionDescargar(
              URLDescarga + "?fechabusqueda=" + data?.[i].fechabusqueda
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
            label="Tipo de búsqueda"
            options={{
              Todas: "",
              "Conciliaciones efectivas": "completo",
              "Conciliaciones pendientes": "incompleto",
            }}
            value={paramts.filtro}
            onChange={(e) => FunctionInput(e)}
          />
        </TableEnterprise>
      </Form>
    </div>
  );
};

export default ConcilacionMovistar;
