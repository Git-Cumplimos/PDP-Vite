import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Select from "../../../components/Base/Select/Select";
import fetchData from "../../../utils/fetchData";
import Loteria from "../Views/Loteria";
import Premios from "../Views/Premios";
import Reportes from "../Views/Reportes";

const urlLoto =
  "http://loginconsulta.us-east-2.elasticbeanstalk.com/contiploteria";

const CashierLoteria = () => {
  const [sorteo, setSorteo] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);

  const history = useHistory();
  const { page } = useParams();
  const { pathname } = useLocation();

  const notifyError = useCallback((msg = "Error") => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);

  const searchLoteriaInfo = useCallback(() => {
    fetchData(
      urlLoto,
      "GET",
      {
        num_loteria: "01",
      },
      {}
    )
      .then((res) => {
        const sortOrd = res.filter(({ tip_sorteo }) => {
          return tip_sorteo === 1;
        });
        const sortExt = res.filter(({ tip_sorteo }) => {
          return tip_sorteo === 2;
        });
        if (sortOrd.length > 0) {
          setSorteo(sortOrd[0].num_sorteo);
        } else {
          notifyError("No se encontraron sorteos ordinarios");
        }
        if (sortExt.length > 0) {
          setSorteoExtra(sortExt[0].num_sorteo);
        } else {
          notifyError("No se encontraron sorteos extraordinarios");
        }
      })
      .catch((err) => console.error(err));
  }, [notifyError]);

  useEffect(() => {
    searchLoteriaInfo();
  }, [searchLoteriaInfo]);

  // const options

  const SelectPage = () => {
    switch (page) {
      case "ordinario":
        return <Loteria sorteo={sorteo} />;

      case "extraordinario":
        return <Loteria sorteo={sorteoExtra} />;

      case "premios":
        return <Premios />;

      case "reportes":
        return <Reportes />;

      default:
        return "";
    }
  };

  const [options, posibles] = useMemo(() => {
    const posib = [];
    const opts = [{ value: "", label: "" }];
    if (sorteo !== null) {
      opts.push({ value: "ordinario", label: `Sorteo oridinario - ${sorteo}` });
      posib.push("ordinario");
    }
    if (sorteoExtra !== null) {
      opts.push({
        value: "extraordinario",
        label: `Sorteo extraordinario - ${sorteoExtra}`,
      });
      posib.push("extraordinario");
    }
    opts.push(
      { value: "premios", label: "Reclamar premios" },
      { value: "reportes", label: "Ver reportes" }
    );
    posib.push("premios", "reportes");
    return [[...opts], [...posib]];
  }, [sorteo, sorteoExtra]);

  return (
    <div className="flex flex-col justify-center items-center">
      <ToastContainer />
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

export default CashierLoteria;
