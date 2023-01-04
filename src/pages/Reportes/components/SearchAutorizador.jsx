import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { fetchAutorizadores } from "../../../apps/TrxParams/utils/fetchRevalAutorizadores";
import { getTiposOperaciones } from "../../../apps/TrxParams/utils/fetchTiposTransacciones";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const SearchAutorizador = ({ setReport, handleClose }) => {
  const [autorizadores, setAutorizadores] = useState([]);
  const [dataAutorizadores, setDataAutorizadores] = useState({
    nombre_autorizador: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return autorizadores.map(({ id_autorizador, nombre_autorizador }) => {
      return {
        id_autorizador,
        nombre_autorizador,
      };
    });
  }, [autorizadores]);
  const selectAuto = useCallback(
    (ev, i) => {
      ev.preventDefault();
      setReport((old) => ({
        ...old,
        id_autorizador: autorizadores[i].id_autorizador,
        nombre_autorizador: autorizadores[i].nombre_autorizador,
      }));
      handleClose();
    },
    [autorizadores]
  );
  useEffect(() => {
    fetchPlans();
  }, [dataAutorizadores, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDataAutorizadores((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchPlans = () => {
    let obj = { page, limit };
    if (dataAutorizadores.nombre_autorizador !== "")
      obj["nombre_autorizador"] = dataAutorizadores.nombre_autorizador;
    fetchAutorizadores(obj)
      .then((res) => {
        setAutorizadores(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Lista de autorizadores'
        maxPage={maxPages}
        headers={["Id", "Autorizador"]}
        data={dataTable}
        onSelectRow={selectAuto}
        onSetPageData={setPageData}>
        <Input
          id='nombre_autorizador'
          name='nombre_autorizador'
          label={"Nombre autorizador"}
          type='text'
          autoComplete='off'
          value={dataAutorizadores.nombre_autorizador}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default SearchAutorizador;
