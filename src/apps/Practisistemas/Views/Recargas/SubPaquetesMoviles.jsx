import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postConsultaPaquetes } from "../../utils/fetchServicioRecargas";

const SubPaquetesMoviles = ({ subRoutes }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentPaquetes, setCurrentPaquetes] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const { roleInfo } = useAuth();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    valor: "",
  });

  /* Filtrado de la matriz de objetos. */

  const paquetesFiltrados = useMemo(() => {
    const paquetesArray = Array.isArray(paquetes) ? paquetes : [];
    const validPaquetes = paquetesArray.filter((objeto) => {
      const paquete = Object.values(objeto)[0]; // Obtener el objeto paquete dentro de cada objeto
      return paquete.productDesc !== undefined && paquete.cost !== undefined;
    });

    const filteredPaquetes = datosTrans.valor
      ? validPaquetes.filter((objeto) => {
          const paquete = Object.values(objeto)[0];
          const searchValue = datosTrans.valor;
          const numCost = paquete.cost;
          console.log("searchValue:", searchValue, "numCost:", numCost);
          return numCost.toString().startsWith(searchValue.toString());
        })
      : validPaquetes;

    return filteredPaquetes;
  }, [paquetes, datosTrans.valor]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate("../recargas-paquetes/Recargar-paquete", {
        state: {
          valor_paquete: currentPaquetes[i]["sell"],
          codigo_paq: currentPaquetes[i]["practiCode"],
          descripcion: currentPaquetes[i]["productDesc"],
          operador: state?.producto,
          operador_recargar: state?.operador_recargar,
          operadorPaquete: state?.operadorPaquete,
        },
      });
    },
    [navigate, currentPaquetes]
  );

  useEffect(() => {
    fecthTablaPaquetesFunc();
  }, [datosTrans, page, limit]);
  useEffect(() => {
    if (paquetesFiltrados.length > 0) {
      setCurrentPaquetes(paquetesFiltrados);
    } else {
      setCurrentPaquetes(paquetes);
    }
  }, [paquetesFiltrados, paquetes]);

  useEffect(() => {
    if (state?.producto) {
      fecthTablaPaquetesFunc();
    } else {
      navigate("../");
    }
  }, [state?.producto]);

  const fecthTablaPaquetesFunc = () => {
    const postData = {
      idcomercio: roleInfo?.["id_comercio"],
      producto: state?.producto,
      page,
      limit,
    };

    postConsultaPaquetes(postData)
      .then((autoArr) => {
        /* Configuración del estado del componente. */
        if (autoArr && autoArr.response && autoArr.response.data) {
          setMaxPages(autoArr.maxPages);
          setPaquetes(autoArr.response.data);
        }
      })
      .catch((err) => console.error(err));
  };

  const data2 = currentPaquetes
    .map((objeto) => {
      const paquete = Object.values(objeto)[0]; // Obtener el objeto paquete dentro de cada objeto
      return paquete.productDesc && paquete.cost
        ? { cost: paquete.cost, productDesc: paquete.productDesc }
        : null;
    })
    .filter(Boolean);

  return (
    <>
      <h1 className="text-3xl text-center">
        Servicios de recargas y venta de paquetes
      </h1>
      <TableEnterprise
        title="Tabla servicio de venta de paquetes"
        maxPage={maxPages}
        headers={["Descripción", "Valor del paquete"]}
        data={data2.map(({ productDesc, cost }) => [productDesc, cost])}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
      >
        <Input
          id="valor_p"
          name="valor_p"
          label="Valor"
          minLength="1"
          maxLength="13"
          type="text"
          autoComplete="off"
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, valor: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default SubPaquetesMoviles;
