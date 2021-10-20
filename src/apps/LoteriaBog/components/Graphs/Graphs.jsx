import { useEffect, useState } from "react";
import Chart from "../../../../components/Base/Chart/Chart";
import Input from "../../../../components/Base/Input/Input";
import Table from "../../../../components/Base/Table/Table";

const Graphs = ({ moda = { billete: [] , serie: []} }) => {
  const [graphs, setGraphs] = useState(false);

  const [graphBilletes, setGraphBilletes] = useState([]);
  const [graphSeries, setGraphSeries] = useState([]);

  useEffect(() => {
    if (moda !== null) {
      const gBill = [];
      const gSerie = [];
      moda.billete.forEach(({ num_billete, numerobusquedas }) => {
        gBill.push({
          x: num_billete,
          busquedas: numerobusquedas,
        });
      });
      moda.serie.forEach(({ serie, numerobusquedas }) => {
        gSerie.push({
          x: serie,
          busquedas: numerobusquedas,
        });
      });
      setGraphBilletes([...gBill]);
      setGraphSeries([...gSerie]);
    }
  }, [moda]);

  return (
    <>
      <Input
        id="graphType"
        label="Tabla o graficas"
        type="checkbox"
        value={graphs}
        onChange={() => setGraphs(!graphs)}
      />
      {moda !== null ? (
        <>
          <h1 className="text-xl my-4">10 mas buscados</h1>
          <div
            className={`flex justify-center gap-8 flex-col w-full ${
              !graphs ? "md:flex-row" : ""
            }`}
          >
            {Array.isArray(moda.billete) && moda.billete.length > 0 ? (
              graphs ? (
                <Chart
                  title="Numeros de billete mas buscados"
                  xTitle="Numero de billete"
                  yTitle="Numero de busquedas"
                  fontStyle={{
                    fontSize: 14,
                    fontColor: "#000",
                    fontFamily: "Montserrat",
                  }}
                  dataSets={[
                    {
                      type: "bar",
                      label: "Numero de billete",
                      backgroundColor: `rgb(232, 136, 78)`,
                      data: graphBilletes,
                      borderWidth: 2,
                      parsing: {
                        yAxisKey: "busquedas",
                      },
                    },
                  ]}
                  clickEvent={() => console.log("clicked")}
                />
              ) : (
                <Table
                  headers={["Billete", "Numero de busquedas"]}
                  data={moda.billete}
                  className="mx-auto"
                />
              )
            ) : (
              ""
            )}
            {Array.isArray(moda.serie) && moda.serie.length > 0 ? (
              graphs ? (
                <Chart
                  title="Numeros de serie mas buscados"
                  xTitle="Numero de serie"
                  yTitle="Numero de busquedas"
                  fontStyle={{
                    fontSize: 14,
                    fontColor: "#000",
                    fontFamily: "Montserrat",
                  }}
                  dataSets={[
                    {
                      type: "bar",
                      label: "Numero de serie",
                      backgroundColor: `rgb(232, 136, 78)`,
                      data: graphSeries,
                      borderWidth: 2,
                      parsing: {
                        yAxisKey: "busquedas",
                      },
                    },
                  ]}
                  clickEvent={() => console.log("clicked")}
                />
              ) : (
                <Table
                  headers={["Serie", "Numero de busquedas"]}
                  data={moda.serie.map(({ serie, numerobusquedas }) => {
                    return { serie, busquedas: numerobusquedas };
                  })}
                  className="mx-auto"
                />
              )
            ) : (
              ""
            )}
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default Graphs;
