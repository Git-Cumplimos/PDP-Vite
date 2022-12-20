import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import {
  getComisionesPlanes,
  getComisionesPlanesPagar,
} from "../../utils/fetchComisionesPlanes";
import Select from "../../../../components/Base/Select";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";

const SearchTiposOperaciones = ({
  newComision,
  setNewComision,
  handleClose,
}) => {
  const [tiposOperaciones, setTiposOperaciones] = useState([]);
  const [dataTiposOperaciones, setDataTiposOperaciones] = useState({
    pk_planes_comisiones: "",
    nombre_plan_comision: "",
    tipo_comision: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return tiposOperaciones.map(
      ({
        comisiones,
        fecha_creacion,
        fecha_modificacion,
        nombre_plan_comision,
        pk_planes_comisiones,
        tipo_comision,
      }) => {
        return {
          pk_planes_comisiones,
          nombre_plan_comision,
          tipo_comision,
        };
      }
    );
  }, [tiposOperaciones]);
  const selectPlan = useCallback(
    (ev, i) => {
      ev.preventDefault();
      setNewComision((old) => ({
        ...old,
        fk_planes_comisiones: tiposOperaciones[i].pk_planes_comisiones,
        nombre_plan: tiposOperaciones[i].nombre_plan_comision,
      }));
      handleClose();
    },
    [tiposOperaciones]
  );
  useEffect(() => {
    fetchTiposTransaccionFunc();
  }, [dataTiposOperaciones, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDataTiposOperaciones((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchPlans = () => {
    let obj = { page, limit, sortDir: "DESC", sortBy: "pk_planes_comisiones" };
    if (dataTiposOperaciones.pk_planes_comisiones !== "")
      obj["pk_planes_comisiones"] = dataTiposOperaciones.pk_planes_comisiones;
    if (dataTiposOperaciones.nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = dataTiposOperaciones.nombre_plan_comision;
    if (dataTiposOperaciones.tipo_comision !== "")
      obj["tipo_comision"] = dataTiposOperaciones.tipo_comision;
    getComisionesPlanes(obj)
      .then((res) => {
        setTiposOperaciones(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fetchTiposTransaccionFunc = () => {
    fetchTrxTypesPages("", page)
      .then((res) => {
        setTiposOperaciones(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Lista de Planes de Comisión'
        maxPage={maxPages}
        headers={["Id", "Plan comisión", "Tipo Comisión"]}
        data={dataTable}
        onSelectRow={selectPlan}
        onSetPageData={setPageData}>
        <Input
          id='pk_planes_comisiones'
          name='pk_planes_comisiones'
          label={"Id plan comisión"}
          type='number'
          autoComplete='off'
          value={dataTiposOperaciones.pk_planes_comisiones}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_plan_comision'
          name='nombre_plan_comision'
          label={"Nombre plan comisión"}
          type='text'
          autoComplete='off'
          value={dataTiposOperaciones.nombre_plan_comision}
          onChange={onChangeFormat}
        />
        <Select
          id='tipo_comision'
          name='tipo_comision'
          label='Tipo de comisión'
          options={{
            "": "",
            Pagar: "PAGAR",
            Cobrar: "COBRAR",
          }}
          value={dataTiposOperaciones.tipo_comision}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default SearchTiposOperaciones;
