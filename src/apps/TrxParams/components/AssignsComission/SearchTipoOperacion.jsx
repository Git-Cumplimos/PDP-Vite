import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getTiposOperaciones } from "../../utils/fetchTiposTransacciones";

const SearchTipoOperacion = ({ newComision, setNewComision, handleClose }) => {
  const [tiposOperacion, setTiposOperacion] = useState([]);
  const [dataTiposOperacion, setDataTiposOperacion] = useState({
    id_tipo_op: "",
    nombre_operacion: "",
    nombre_autorizador: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return tiposOperacion.map(
      ({ id_tipo_op, nombre_operacion, nombre_autorizador }) => {
        return {
          id_tipo_op,
          nombre_operacion,
          nombre_autorizador,
        };
      }
    );
  }, [tiposOperacion]);
  const selectTipoOp = useCallback(
    (ev, i) => {
      ev.preventDefault();
      setNewComision((old) => ({
        ...old,
        fk_tipo_op: tiposOperacion[i].id_tipo_op,
        nombre_tipo_operacion: tiposOperacion[i].nombre_operacion,
      }));
      handleClose();
    },
    [tiposOperacion]
  );
  useEffect(() => {
    fetchPlans();
  }, [dataTiposOperacion, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDataTiposOperacion((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchPlans = () => {
    let obj = { page, limit, sortDir: "DESC", sortBy: "id_tipo_op" };
    if (dataTiposOperacion.id_tipo_op !== "")
      obj["id_tipo_op"] = dataTiposOperacion.id_tipo_op;
    if (dataTiposOperacion.nombre_operacion !== "")
      obj["nombre_operacion"] = dataTiposOperacion.nombre_operacion;
    if (dataTiposOperacion.nombre_autorizador !== "")
      obj["nombre_autorizador"] = dataTiposOperacion.nombre_autorizador;
    getTiposOperaciones(obj)
      .then((res) => {
        setTiposOperacion(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Lista de tipos de operación'
        maxPage={maxPages}
        headers={["Id", "Operación", "Autorizador"]}
        data={dataTable}
        onSelectRow={selectTipoOp}
        onSetPageData={setPageData}>
        <Input
          id='id_tipo_op'
          name='id_tipo_op'
          label={"Id operación"}
          type='number'
          autoComplete='off'
          value={dataTiposOperacion.id_tipo_op}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_operacion'
          name='nombre_operacion'
          label={"Nombre operación"}
          type='text'
          autoComplete='off'
          value={dataTiposOperacion.nombre_operacion}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_autorizador'
          name='nombre_autorizador'
          label={"Nombre autorizador"}
          type='text'
          autoComplete='off'
          value={dataTiposOperacion.nombre_autorizador}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default SearchTipoOperacion;
