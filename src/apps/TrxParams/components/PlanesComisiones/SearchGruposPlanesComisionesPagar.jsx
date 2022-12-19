import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getComisionesPlanesPagar } from "../../utils/fetchComisionesPlanes";
import { fetchGruposPlanesComisiones } from "../../utils/fetchGruposPlanesComisiones";

const SearchGruposPlanesComisiones = ({
  setSelectedGruposComercios,
  handleClose,
}) => {
  const [dataGruposPlanesComisiones, setDataGruposPlanesComisiones] = useState({
    pk_tbl_grupo_planes_comisiones: "",
    nombre_grupo_plan: "",
  });
  const [gruposPlanes, setGruposPlanes] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableGruposPlanes = useMemo(() => {
    return [
      ...gruposPlanes.map(
        ({
          nombre_grupo_plan,
          pk_tbl_grupo_planes_comisiones,
          planes_comisiones,
        }) => {
          return {
            Id: pk_tbl_grupo_planes_comisiones,
            "Nombre grupo": nombre_grupo_plan,
            "Cantidad comercios": planes_comisiones.length ?? 0,
          };
        }
      ),
    ];
  }, [gruposPlanes]);
  useEffect(() => {
    fetchGruposPlanesComisionesFunc();
  }, [page, limit, dataGruposPlanesComisiones]);
  const fetchGruposPlanesComisionesFunc = useCallback(() => {
    let obj = {};
    if (parseInt(dataGruposPlanesComisiones.pk_tbl_grupo_planes_comisiones))
      obj["pk_tbl_grupo_planes_comisiones"] = parseInt(
        dataGruposPlanesComisiones.pk_tbl_grupo_planes_comisiones
      );
    if (dataGruposPlanesComisiones.nombre_grupo_plan)
      obj["nombre_grupo_plan"] = dataGruposPlanesComisiones.nombre_grupo_plan;
    fetchGruposPlanesComisiones({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_planes_comisiones",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setGruposPlanes(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, dataGruposPlanesComisiones]);
  const onClickRow = useCallback(
    (ev, i) => {
      console.log(gruposPlanes[i]);
      setSelectedGruposComercios((old) => ({
        ...old,
        nombre_grupo_plan: gruposPlanes[i]?.nombre_grupo_plan,
        fk_tbl_grupo_planes_comisiones:
          gruposPlanes[i]?.pk_tbl_grupo_planes_comisiones,
      }));
      handleClose();
    },
    [gruposPlanes]
  );
  return (
    <>
      <TableEnterprise
        title='Lista de Planes de Comisión'
        maxPage={maxPages}
        headers={["Id", "Nombre grupo", "Cantidad planes"]}
        data={tableGruposPlanes}
        onSelectRow={onClickRow}
        onSetPageData={setPageData}>
        <Input
          id='pk_tbl_grupo_planes_comisiones'
          label='Id grupo de planes'
          type='text'
          name='pk_tbl_grupo_planes_comisiones'
          minLength='1'
          maxLength='10'
          // required
          value={dataGruposPlanesComisiones.pk_tbl_grupo_planes_comisiones}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDataGruposPlanesComisiones((old) => {
                return { ...old, pk_tbl_grupo_planes_comisiones: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_grupo_plan'
          label='Nombre grupo de planes'
          type='text'
          name='nombre_grupo_plan'
          minLength='1'
          maxLength='10'
          // required
          value={dataGruposPlanesComisiones.nombre_grupo_plan}
          onInput={(e) => {
            setDataGruposPlanesComisiones((old) => {
              return { ...old, nombre_grupo_plan: e.target.value };
            });
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SearchGruposPlanesComisiones;
