import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getComisionesPlanesPagar } from "../../utils/fetchComisionesPlanes";
import { notifyError } from "../../../../utils/notify";

const SearchPlanesComisionesPagar = ({
  selectedGruposPlanes,
  setSelectedGruposPlanes,
  handleClose,
}) => {
  const [planesComisiones, setPlanesComisiones] = useState([]);
  const [dataPlanesComisiones, setDataPlanesComisiones] = useState({
    pk_planes_comisiones: "",
    nombre_plan_comision: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return planesComisiones.map(
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
        };
      }
    );
  }, [planesComisiones]);
  const addPlanes = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (
        !selectedGruposPlanes?.planes_agregar?.find(
          (a) =>
            a?.fk_planes_comisiones === planesComisiones[i].pk_planes_comisiones
        )
      ) {
        const obj = { ...selectedGruposPlanes };
        obj["planes_agregar"] = [
          ...obj["planes_agregar"],
          {
            fk_planes_comisiones: planesComisiones[i].pk_planes_comisiones,
            fk_tbl_grupo_planes_comisiones:
              selectedGruposPlanes["pk_tbl_grupo_planes_comisiones"],
          },
        ];
        setSelectedGruposPlanes((old) => {
          return {
            ...old,
            planes_agregar: obj["planes_agregar"],
          };
        });
      } else {
        return notifyError("El plan ya se ha agregado anteriormente");
      }
      handleClose();
    },
    [selectedGruposPlanes, planesComisiones]
  );
  useEffect(() => {
    fetchPlans();
  }, [dataPlanesComisiones, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDataPlanesComisiones((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchPlans = () => {
    let obj = { page, limit, sortDir: "DESC", sortBy: "pk_planes_comisiones" };
    if (dataPlanesComisiones.pk_planes_comisiones !== "")
      obj["pk_planes_comisiones"] = dataPlanesComisiones.pk_planes_comisiones;
    if (dataPlanesComisiones.nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = dataPlanesComisiones.nombre_plan_comision;
    if (selectedGruposPlanes.pk_tbl_grupo_planes_comisiones) {
      obj["fk_tbl_grupo_planes_comisiones"] =
        selectedGruposPlanes.pk_tbl_grupo_planes_comisiones;
    }
    getComisionesPlanesPagar(obj)
      .then((res) => {
        setPlanesComisiones(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Lista de Planes de Comisión'
        maxPage={maxPages}
        headers={["Id", "Plan comisión"]}
        data={dataTable}
        onSelectRow={addPlanes}
        onSetPageData={setPageData}>
        <Input
          id='pk_planes_comisiones'
          name='pk_planes_comisiones'
          label={"Id plan comisión"}
          type='number'
          autoComplete='off'
          value={dataPlanesComisiones.pk_planes_comisiones}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_plan_comision'
          name='nombre_plan_comision'
          label={"Nombre plan comisión"}
          type='text'
          autoComplete='off'
          value={dataPlanesComisiones.nombre_plan_comision}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default SearchPlanesComisionesPagar;
