import { useState } from "react";
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
  const posibles = ["semanal", "extra", "premios", "reportes"];
  const [page, setPage] = useState("");

  const SelectPage = () => {
    switch (page) {
      case "semanal":
        return <Ordinario />;

      case "extra":
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
          { value: "semanal", label: "Sorteo oridinario" },
          { value: "extra", label: "Sorteo extraordinario" },
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
