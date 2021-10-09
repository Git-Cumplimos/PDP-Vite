import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthHooks";
import ProvideLoteria from "./components/ProvideLoteria";
import Select from "../../components/Base/Select/Select";
import Ordinario from "./Views/Ordinario";
import Extraordinario from "./Views/Extraordinario";
import Premios from "./Views/Premios";
import Reportes from "./Views/Reportes";

const AdminLoteria = () => {
  return <div>Estamos en loteria Admin</div>;
};

const CashierLoteria = () => {
  const posibles = ["ordinario", "extraordinario", "premios", "reportes"];
  
  const [page, setPage] = useState("");
  const [sorteo, setSorteo] = useState();
  const [sorteoExtra, setSorteoExtra] = useState();

  const searchLoteriaInfo = (num) => {
    // fetchData(urls.loteria)
    //   .then((res) => {})
    //   .catch((err) => console.error(err));
    setTimeout(() => {
      setSorteo("2608");
      setSorteoExtra("2");
    }, 1000);
  };

  useEffect(() => {
    searchLoteriaInfo(2);
  }, []);

  // const options

  const SelectPage = () => {
    switch (page) {
      case "ordinario":
        return <Ordinario sorteo={sorteo} />;

      case "extraordinario":
        return <Extraordinario />;

      case "premios":
        return <Premios />;

      case "reportes":
        return <Reportes />;

      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <Select
        id="pagesLDB"
        label="Elegir pagina"
        options={[
          { value: "", label: "" },
          { value: "ordinario", label: `Sorteo oridinario - ${sorteo}` },
          { value: "extraordinario", label: `Sorteo extraordinario - ${sorteoExtra}` },
          { value: "premios", label: "Reclamar premios" },
          { value: "reportes", label: "Ver reportes" },
        ]}
        onChange={(e) => setPage(e.target.value)}
      />
      {posibles.includes(page) ? <SelectPage /> : ""}
    </div>
  );
};

const LoteriaBog = () => {
  const auth = useAuth();
  return (
    <ProvideLoteria>
      {auth.roleInfo.role === 0 ? <AdminLoteria /> : <CashierLoteria />}
    </ProvideLoteria>
  );
};

export default LoteriaBog;
