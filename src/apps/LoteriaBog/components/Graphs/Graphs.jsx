import { useEffect, useState } from "react";
import Chart from "../../../../components/Base/Chart/Chart";
import Input from "../../../../components/Base/Input";
import Table from "../../../../components/Base/Table";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

const Graphs = ({ moda = { billete: [], serie: [] } }) => {
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
        label="Tabla o gráficas"
        type="checkbox"
        value={graphs}
        onChange={() => setGraphs(!graphs)}
      />
      {moda !== null ? (
        <>
          <h1 className="text-xl my-4">10 mas buscados</h1>
          <div
            className={`flex justify-center gap-8 flex-col w-full ${!graphs ? "md:flex-row" : ""
              }`}
          >
            {Array.isArray(moda.billete) && moda.billete.length > 0 ? (
              graphs ? (
                <Chart
                  title="Números de billete mas buscados"
                  xTitle="Número de billete"
                  yTitle="Número de búsquedas"
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
                        yAxisKey: "búsquedas",
                      },
                    },
                  ]}
                  clickEvent={() => console.log("clicked")}
                />
              ) : (
                <Table
                  headers={["Billete", "Número de búsquedas"]}
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
                  title="Números de serie más buscados"
                  xTitle="Número de serie"
                  yTitle="Número de busquedas"
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
                <TableEnterprise
                  title="Búsqueda"
                  headers={["Serie", "Número de búsquedas"]}
                  data={moda.serie.map(({ serie, numerobusquedas }) => {
                    return { serie, busquedas: numerobusquedas };
                  })}
                  className="mx-auto">
                </TableEnterprise>
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
