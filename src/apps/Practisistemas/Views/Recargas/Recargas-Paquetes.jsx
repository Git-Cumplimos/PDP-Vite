import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postConsultaOperadores } from "../../utils/fetchServicioRecargas";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const RecargasPaquetes = ({ subRoutes }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [operadores, setOperadores] = useState([]);
  const [maxPages, setMaxPages] = useState(3);

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState({
    operador: "",
    isPack: "",
  });

  /**
   * Toma una cadena, la divide en una matriz de palabras, escribe en mayúscula la primera letra de cada
   * palabra y luego vuelve a unir la matriz en una cadena.
   * @return una cadena con la primera letra de cada palabra en mayúscula.
   */
  const capitalize = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /* Filtrado de los datos recibidos del Fetch */
  /* Filtrado de los datos recibidos del Fetch */
  const tableOperadores = useMemo(() => {
    const filteredOperadores = operadores.filter((operador) => {
      if (!operador || !operador.desc) {
        return false;
      }

      return (
        (operador.isPack === search.isPack || search.isPack === "") &&
        (operador.desc.toLowerCase().includes(search.operador.toLowerCase()) ||
          search.operador === "")
      );
    });

    /* Cálculo del número de páginas que tendrá la tabla. */
    const totalItems = filteredOperadores.length;
    if (totalItems <= limit) {
      setMaxPages(1);
    } else if (totalItems > limit) {
      setMaxPages(Math.ceil(totalItems / limit));
    }

    /* Una función que se llama cuando se cambia la página. */
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const pageOperadores = filteredOperadores.slice(startIndex, endIndex);

    return pageOperadores.map((operador) => {
      if (!operador || !operador.desc) {
        return ["", ""];
      }

      return [capitalize(operador.desc), operador.isPack];
    });
  }, [operadores, search, page, limit]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      console.log("OPERADORES", operadores);
      const nombrePin = tableOperadores[i][0];
      const index = operadores.findIndex(
        (item) => item?.desc.toLowerCase() === nombrePin.toLowerCase()
      );

      console.log("index", index);
      console.log("tableOperadores[i][0]", tableOperadores[i][0]);
      console.log("operadores[index]", operadores[index]);
      const desc = operadores[index]?.desc;
      const isPack = operadores[index]?.isPack;
      const op = operadores[index]?.op;
      const operadorPacks = operadores[index]?.packs;

      if (desc === "Movistar") {
        navigate("../movistar/recargas-movistar");
      } else if (desc === "Paquetes Movistar") {
        navigate("../movistar/paquetes-movistar");
      } else if (desc === "Avantel") {
        navigate("../recargas-paquetes/Venta-paquetes", {
          state: {
            operador_recargar: desc,
            producto: op,
          },
        });
      } else {
        isPack === "Recarga"
          ? navigate("../recargas-paquetes/Recargar", {
              state: {
                operador_recargar: desc,
                producto: op,
              },
            })
          : navigate("../recargas-paquetes/Venta-paquetes", {
              state: {
                operador_recargar: desc,
                producto: op,
                operadorPaquete: operadorPacks,
              },
            });
      }
    },
    [navigate, operadores, tableOperadores]
  );

  /**
   * Obtiene datos y establece los datos en una variable de estado.
   */
  const fecthTablaPaginadoFunc = async () => {
    try {
      setShowLoading(true);
      console.log(roleInfo, "roleinfo");
      const autoArr = await postConsultaOperadores({
        idcomercio: roleInfo?.["id_comercio"],
        // page,
        // limit,
        // operador,
        // ispack,
      });
      setOperadores(autoArr?.response ?? [0]);
      setMaxPages(autoArr?.maxPages ?? 3);
    } catch (e) {
      console.error(e);
    } finally {
      setShowLoading(false); // Ocultar indicador de carga
    }
  };

  useEffect(() => {
    const page = 1;
    const limit = 10;
    const operador = search.operador;
    const ispack = search.isPack;

    /* Llamar a la función con los parámetros. */
    fecthTablaPaginadoFunc(page, limit, operador, ispack);
  }, []);
  return (
    <>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl text-center">
        Servicios de recargas y venta de paquetes
      </h1>
      <TableEnterprise
        title="Tabla servicio de recargas"
        maxPage={maxPages}
        headers={["Descripción", "Servicio"]}
        data={tableOperadores}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
      >
        <Input
          id="searchConvenio"
          name="searchConvenio"
          label={"Nombre operador"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          /* Una función de devolución de llamada que se llama cuando cambia la entrada. */
          onInput={(e) =>
            setSearch((old) => ({ ...old, operador: e.target.value }))
          }
        />
        {/* <Input
          id="searchServicio"
          name="searchServicio"
          label={"Categoria del Servicio"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          // value={search.isPack}
          onInput={(e) =>
            setSearch((old) => ({ ...old, isPack: e.target.value }))
          } */}
        {/* /> */}
        <Select
          id={"category"}
          label={"Categoria del Servicio"}
          name={"category"}
          options={[
            { value: "", label: "" },
            { value: "Recarga", label: "Recarga" },
            { value: "Venta de paquete", label: "Venta de Paquete" },
          ]}
          required
          onInput={(e) =>
            setSearch((old) => ({ ...old, isPack: e.target.value }))
          }
        />
      </TableEnterprise>
    </>
  );
};

export default RecargasPaquetes;
