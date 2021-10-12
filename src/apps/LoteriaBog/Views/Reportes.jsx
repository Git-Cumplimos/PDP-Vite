import { useEffect, useState } from "react";
import Table from "../../../components/Base/Table/Table";
import { useLoteria } from "../utils/LoteriaHooks";

const Reportes = () => {
  const {
    reportes: { moda },
    searchModa,
  } = useLoteria();

  const [info, setInfo] = useState("No hay datos");

  useEffect(() => {
    setInfo("Cargando ...");
    searchModa()
      .then(() => setInfo("No hay datos"))
      .catch((err) => {
        console.error(err);
        setInfo("Error buscando los datos");
      });
  }, [searchModa]);
  return (
    <div>
      <h1 className="text-xl">Reportes</h1>
      {moda !== null ? (
        <Table headers={Object.keys(moda[0])} data={moda} />
      ) : (
        <h1>{info}</h1>
      )}
    </div>
  );
};

export default Reportes;
