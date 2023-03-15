import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postConsultaOperadores } from "../../utils/fetchServicioRecargas";
import Select from "../../../../components/Base/Select";

const RecargasPaquetes = ({ subRoutes }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState({
    operador: "",
    isPack: "",
  });
  const [operadores, setOperadores] = useState([]);
  const [maxPages, setMaxPages] = useState(3);
  /* Filtrado de la matriz de operadores. */

  const tableOperadores = useMemo(() => {
    let filteredOperadores = operadores.filter((operador) => {
      return (
        operador.desc.toLowerCase().includes(search.operador.toLowerCase()) &&
        operador.isPack.toLowerCase().includes(search.isPack.toLowerCase())
      );
    });

    if (search.isPack) {
      filteredOperadores = filteredOperadores.filter((operador) => {
        return operador.isPack.toLowerCase() === search.isPack.toLowerCase();
      });
    }
    return filteredOperadores
      .slice((page - 1) * limit, page * limit)
      .map(({ desc, isPack }) => {
        return {
          Descripcion: desc,
          Servicio: isPack,
        };
      });
  }, [operadores, search, page, limit]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      if (operadores[i].desc === "Movistar") {
        navigate("../movistar/recargas-movistar");
      } else if (operadores[i].desc === "Paquetes Movistar") {
        navigate("../movistar/paquetes-movistar");
      } else {
        operadores[i].isPack === "Recarga"
          ? navigate("../recargas-paquetes/Recargar", {
              state: {
                operador_recargar: operadores[i].desc,
                producto: operadores[i].op,
              },
            })
          : navigate("../recargas-paquetes/Venta-paquetes", {
              state: {
                operador_recargar: operadores[i].desc,
                producto: operadores[i].op,
                operadorPaquete: operadores[i].operadorPacks,
              },
            });
      }
    },
    [navigate, operadores]
  );
  /**
   * Obtiene los datos y establece el estado del componente.
   */

  const fecthTablaConveniosPaginadoFunc = async () => {
    try {
      const autoArr = await postConsultaOperadores({
        idcomercio: roleInfo?.["id_comercio"],
        page,
        limit,
        operador: search.operador,
        ispack: search.isPack,
        category: search.category,
      });
      setMaxPages(autoArr?.maxPages);
      setOperadores(autoArr?.response[0] ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  /* Establecer el estado de maxPages en la longitud de la matriz de operadores dividida por el límite. */
  useEffect(() => {
    if (operadores.length > limit) {
      setMaxPages(Math.ceil(operadores.length / limit));
    } else {
      setMaxPages(3);
    }
  }, [operadores, limit]);

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [page, limit, search.operador, search.isPack, search.category, roleInfo]);

  return (
    <>
      <h1 className="text-3xl text-center">
        Servicios de recargas y venta de paquetes
      </h1>
      <TableEnterprise
        title="Tabla servicio de recargas"
        maxPage={maxPages}
        headers={["Descripción", "Servicio"]}
        data={tableOperadores}
        onSelectRow={onSelectAutorizador}
        // onSetPageData={setPageData}
        onSetPageData={({ page, limit }) => setPageData({ page, limit })}
      >
        <Input
          id="searchConvenio"
          name="searchConvenio"
          label={"Nombre operador"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          // value={search.operador}
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
        {/* <div></div> */}
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
