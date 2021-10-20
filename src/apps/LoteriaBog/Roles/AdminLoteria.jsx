import { useParams, useHistory, useLocation } from "react-router-dom";
import Select from "../../../components/Base/Select/Select";
import CargaArchivos from "../Views/CargaArchivos";
import DescargarArchivos from "../Views/DescargarArchivos";

const AdminLoteria = () => {
  const history = useHistory();
  const { page } = useParams();
  const { pathname } = useLocation();

  const SelectPage = () => {
    switch (page) {
      case "cargar":
        return <CargaArchivos />;

      case "descargar":
        return <DescargarArchivos />;

      default:
        return "";
    }
  };

  const check = () => {
    const posib = [];
    const opts = [{ value: "", label: "" }];
    opts.push(
      { value: "cargar", label: "Cargar archivos" },
      { value: "descargar", label: "Descargar archivos" }
    );
    posib.push("cargar", "descargar");
    return [[...opts], [...posib]];
  };

  const [options, posibles] = check();

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <Select
        id="pagesLDB"
        label="Elegir pagina"
        options={options}
        value={page}
        onChange={(e) =>
          e.target.value !== undefined && e.target.value === ""
            ? history.push(`/${pathname.split("/")[1]}`)
            : history.push(`/${pathname.split("/")[1]}/${e.target.value}`)
        }
      />
      {posibles.includes(page) ? <SelectPage /> : ""}
    </div>
  );
};

export default AdminLoteria