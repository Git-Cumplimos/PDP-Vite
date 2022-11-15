import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../utils/notify";
import { postConsultaPines, postConsultaPin } from "../../utils/fetchBackPines";
import { useAuth } from "../../../../hooks/AuthHooks";

const Pines = () => {
  const navigate = useNavigate();
  // const [{ searchPin = "" }, setQuery] = useQuery();

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

  const tablePines = useMemo(() => {
    return [
      ...pines.map(({ desc, op }) => {
        return {
          "Nombre del Pin": desc,
        };
      }),
    ];
  }, [pines]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      fecthTablaConveniosPaginadoFunc2(pines[i]["op"], i);
    },
    [navigate, pines]
  );

  const fecthTablaConveniosPaginadoFunc2 = (op, i) => {
    postConsultaPin({
      idcomercio: roleInfo?.["id_comercio"],
      producto: op,
    })
      .then((autoArr) => {
        // setMaxPages(autoArr?.maxPages);
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
    fecthTablaPinesPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaPinesPaginadoFunc = () => {
    postConsultaPines({
      idcomercio: roleInfo?.["id_comercio"],
      page,
      limit
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setPines(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1 className="text-3xl text-center">
        Servicio de venta de Pines de Servicio y Contenido
      </h1>
      <TableEnterprise
        title="Tabla pines"
        maxPage={maxPages}
        headers={["Nombre del Pin"]}
        data={tablePines}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        // onChange={onChange}
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
            setDatosTrans((old) => {
              return { ...old, pin: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default Pines;
