import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { postConsultaPines, postConsultaPin } from "../../utils/fetchBackPines";
import { useAuth } from "../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Select from "../../../../components/Base/Select";

const Pines = () => {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const [categoriaPin, setCategoriaPin] = useState("");
  const [nombrePin, setNombrePin] = useState("");
  const { roleInfo } = useAuth();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [pines, setPines] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tablePines = useMemo(() => {
    // Aplicamos los filtros
    const filteredPines = pines.filter((pin) => {
      const nombrePinMatches = pin?.desc?.toLowerCase()?.includes(nombrePin?.toLowerCase());
      const categoriaPinMatches =
        pin?.op === "hv" || pin?.op === "em" || pin?.op === "cb" ? "Pin de Servicio" : "Pin de Contenido";

      if (!nombrePin && !categoriaPin) {
        return true;
      } else if (nombrePin && categoriaPin) {
        return nombrePinMatches && categoriaPinMatches.toLowerCase()?.includes(categoriaPin?.toLowerCase());
      } else if (nombrePin) {
        return nombrePinMatches;
      } else {
        return categoriaPinMatches?.toLowerCase().includes(categoriaPin?.toLowerCase());
      }
    });

    // Calculamos los datos de la página actual y la cantidad de páginas
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, filteredPines.length);
    const currentPagePines = filteredPines.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredPines.length / limit);

    // Actualizamos maxPage y onSetPageData con el número de páginas
    setMaxPages(totalPages);
    setPageData({ page, limit });

    // Transformamos los datos de la página actual
    return currentPagePines.map((pin) => ({
      NombrePin: pin?.op === "cb" ? "Certificado de Tradición y Libertad (SNR)" : pin?.op === "hv" ? "Histórico Vehicular" : pin?.op === "ff" ? "FreeFire Pines" : pin?.op === "ng" ? "Noggin Pines" : pin?.desc,
      CategoriaPin: pin?.op === "hv" || pin?.op === "em" || pin?.op === "cb" ? "Pin de Servicio" : "Pin de Contenido",
    }));
  }, [nombrePin, categoriaPin, pines, page, limit]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      const nombrePin = tablePines[i]["NombrePin"] == "Certificado de Tradición y Libertad (SNR)" ? "Certificado TL" : tablePines[i]["NombrePin"] == "Histórico Vehicular" ? "Historico Vehicular" : tablePines[i]["NombrePin"]
      const index = pines.findIndex(pin => pin?.desc === nombrePin);
      if (index !== -1) {
        fecthTablaConveniosPaginadoFunc2(pines[index]["op"], index);
      }
    },
    [navigate, pines, tablePines, nombrePin, categoriaPin]
  );

  const fecthTablaConveniosPaginadoFunc2 = (op, i) => {
    setShowLoading(true)
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: op,
    })
      .then((autoArr) => {
        setShowLoading(false)
        setPines(autoArr?.results ?? []);
        if (i !== undefined) {
          if (autoArr?.results?.length == 0) {
            navigate("../Pines/PinesContenido/CompraPin", {
              state: {
                desc: pines[i]["desc"],
                op: pines[i]["op"],
              },
            });
          } else {
            navigate("../Pines/PinesContenido/InformacionPin", {
              state: {
                op: pines[i]["op"],
              },
            });
          }
        }

      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    fecthTablaPines();
  }, [limit]);

  const fecthTablaPines = () => {
    setShowLoading(true)
    postConsultaPines({
      idcomercio: roleInfo?.["id_comercio"],
      page,
      limit,
      pin: nombrePin !== undefined || nombrePin !== "" ? nombrePin : "",
      categoria: categoriaPin
    })
      .then((autoArr) => {
        setShowLoading(false)
        setPines(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <SimpleLoading show={showLoading} />
      <h1 className="text-3xl text-center">
        Servicio de venta de pines de servicio y contenido
      </h1>
      <TableEnterprise
        title="Tabla pines"
        maxPage={maxPages}
        headers={["Nombre del Pin", "Categoría"]}
        data={tablePines}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
      >
        <Input
          id="searchPin"
          name="searchPin"
          label={"Nombre del Pin"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          onInput={(e) => {
            setNombrePin(e.target.value);
          }}
        />
        <Select
          id={"estado"}
          label={"Categoría del Pin"}
          name={"estado"}
          options={[
            { value: "", label: "" },
            { value: "Pin de Contenido", label: "Pin de Contenido" },
            { value: "Pin de Servicio", label: "Pin de Servicio" },
          ]}
          onInput={(e) => {
            setCategoriaPin(e.target.value);
          }}
          required
        />
      </TableEnterprise>
    </>
  );
};

export default Pines;
