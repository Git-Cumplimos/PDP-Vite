import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../utils/notify";
import { postConsultaPines, postConsultaPin } from "../../utils/fetchBackPines";
import { useAuth } from "../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const Pines = () => {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  // const [{ searchPin = "" }, setQuery] = useQuery();
  const [categoriaPin, setCategoriaPin] = useState("");
  const [nombrePin, setNombrePin] = useState("");
  const { roleInfo, infoTicket } = useAuth();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    pin: "",
  });

  const [pines, setPines] = useState([]);
  const [pin, setPin] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  // const tablePines = useMemo(() => {
  //   return [
  //     ...pines.map(({ desc, op }) => {
  //       return {
  //         "Nombre del Pin": desc,
  //         "Categoría": "Pin de Contenido",
  //         "Categoría": op == "em" || op == "cb" || op == "hv" ? "Pin de Servicio" : "Pin de Contenido"
  //       };
  //     }),
  //   ];
  // }, [pines]);

  const tablePines = useMemo(() => {
    return [
      ...pines.filter(({ desc, op }) => {
        const categoriaMatch =
          op == "em" || op == "cb" || op == "hv"
            ? "Pin de Servicio"
            : "Pin de Contenido";
        const nombreMatch = desc.toLowerCase().includes(nombrePin.toLowerCase());
        const categoriaMatchFilter = categoriaPin
          ? categoriaMatch.toLowerCase().includes(categoriaPin.toLowerCase())
          : true;
        return categoriaMatchFilter && nombreMatch;
      }).map(({ desc, op }) => {
        return {
          "Nombre del Pin": op == "cb" ? "Certificado de Tradición y Libertad (SNR)" : desc,
          "Categoría": op == "em" || op == "cb" || op == "hv" ? "Pin de Servicio" : "Pin de Contenido",
        };
      }),
    ];
  }, [pines, categoriaPin, nombrePin]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      console.log("*******tablePines[i]", tablePines[i])
      console.log("*******tablePines[i][op], i", tablePines[i]["op"], i)
      console.log("*******pines[i][op], i", pines[i]["op"], i)
      console.log("*******ACAAAAAAAAA, i", i)
      const nombrePin = tablePines[i]["Nombre del Pin"] == "Certificado de Tradición y Libertad (SNR)" ? "Certificado TL" : tablePines[i]["Nombre del Pin"];
      console.log("*******ACAAAAAAAAA, nombrePin", nombrePin)
      const index = pines.findIndex(pin => pin.desc === nombrePin);
      console.log("*******ACAAAAAAAAA, index", index)
      // console.log("*******ACAAAAAAAAA, pines[index].op", pines[index].op)
      if (index !== -1) {
        fecthTablaConveniosPaginadoFunc2(pines[index].op, index);
      }
    },
    [navigate, pines, tablePines]
  );

  // const onSelectAutorizador = useCallback(
  //   (e, i) => {
  //     fecthTablaConveniosPaginadoFunc2(pines[i]["op"], i);
  //   },
  //   [navigate, pines, tablePines]
  // );
  // const onSelectAutorizador = useCallback(
  //   (e, i) => {
  //     const filteredIndex = tablePines.findIndex((pin) => pin["Nombre del Pin"] === pines[i]["desc"] && pin["Categoría"] === (pines[i]["op"] == "em" || pines[i]["op"] == "cb" || pines[i]["op"] == "hv" ? "Pin de Servicio" : "Pin de Contenido"));
  //     fecthTablaConveniosPaginadoFunc2(pines[i]["op"], filteredIndex);
  //   },
  //   [navigate, pines, tablePines]
  // );
  // const onSelectAutorizador = useCallback(
  //   (e, i) => {
  //     console.log("*******", tablePines[i])
  //     console.log("*******tablePines[i][op]", tablePines[i]["op"])
  //     console.log("*******i", i)
  //     const selectedPin = tablePines[i];
  //     fecthTablaConveniosPaginadoFunc2(selectedPin["op"], i);
  //   },
  //   [navigate, tablePines]
  // );

  // const onSelectAutorizador = useCallback(
  //   (e, i) => {
  //     const selectedPin = tablePines.find(pin => pin["Nombre del Pin"] === pines[i]["desc"]);
  //     if (selectedPin) {
  //       fecthTablaConveniosPaginadoFunc2(selectedPin["Nombre del Pin"], selectedPin["Categoría"]);
  //     }
  //   },
  //   [navigate, pines, tablePines]
  // );

  const fecthTablaConveniosPaginadoFunc2 = (op, i) => {
    setShowLoading(true)
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: op,
    })
      .then((autoArr) => {

        setShowLoading(false)
        setPin(autoArr?.results ?? []);

        if (autoArr.results.length == 0) {
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
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fecthTablaPines();
  }, [datosTrans, page, limit]);

  useEffect(() => {
    fecthTablaPines();
  }, [datosTrans, page, limit]);

  const fecthTablaPines = () => {
    setShowLoading(true)
    postConsultaPines({
      idcomercio: roleInfo?.["id_comercio"],
      page,
      limit,
      pin: datosTrans.pin
    })
      .then((autoArr) => {
        console.log("ESTO ES AUTOARR de fecthTablaPines", autoArr)
        setShowLoading(false)
        setMaxPages(autoArr?.maxPages);
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
        <Input
          id="searchCategoria"
          name="searchCategoria"
          label={"Categoría del Pin"}
          minLength="1"
          maxLength="30"
          type="text"
          autoComplete="off"
          onInput={(e) => {
            setCategoriaPin(e.target.value);
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default Pines;
