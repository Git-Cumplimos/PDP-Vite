import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getTiposOperaciones } from "../../utils/fetchTiposTransacciones";
import { fetchGruposConvenios } from "../../utils/fetchGruposConvenios";

const SearchGruposConvenios = ({
  newComision,
  setNewComision,
  handleClose,
}) => {
  const [gruposConvenios, setGruposConvenios] = useState([]);
  const [dataGruposConvenios, setDataGruposConvenios] = useState({
    pk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const dataTable = useMemo(() => {
    return gruposConvenios.map(
      ({ pk_tbl_grupo_convenios, nombre_grupo_convenios, convenios }) => {
        return {
          Id: pk_tbl_grupo_convenios,
          "Nombre grupo": nombre_grupo_convenios,
          "Cantidad convenios": convenios.length > 0 ? convenios[0].count : 0,
        };
      }
    );
  }, [gruposConvenios]);
  const selectGrupoConvenios = useCallback(
    (ev, i) => {
      ev.preventDefault();
      setNewComision((old) => ({
        ...old,
        fk_tbl_grupo_convenios: gruposConvenios[i].pk_tbl_grupo_convenios,
        nombre_grupo_convenios: gruposConvenios[i].nombre_grupo_convenios,
      }));
      handleClose();
    },
    [gruposConvenios]
  );
  useEffect(() => {
    fetchGruposConveniosFunc();
  }, [dataGruposConvenios, page, limit]);
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDataGruposConvenios((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const fetchGruposConveniosFunc = () => {
    let obj = {
      page,
      limit,
      sortDir: "DESC",
      sortBy: "pk_tbl_grupo_convenios",
    };
    if (dataGruposConvenios.pk_tbl_grupo_convenios !== "")
      obj["pk_tbl_grupo_convenios"] =
        dataGruposConvenios.pk_tbl_grupo_convenios;
    if (dataGruposConvenios.nombre_grupo_convenios !== "")
      obj["nombre_grupo_convenios"] =
        dataGruposConvenios.nombre_grupo_convenios;
    fetchGruposConvenios(obj)
      .then((res) => {
        setGruposConvenios(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Lista de grupos de convenios'
        maxPage={maxPages}
        headers={["Id", "Grupo convenio", "Cant. convenios"]}
        data={dataTable}
        onSelectRow={selectGrupoConvenios}
        onSetPageData={setPageData}>
        <Input
          id='pk_tbl_grupo_convenios'
          name='pk_tbl_grupo_convenios'
          label={"Id convenio"}
          type='number'
          autoComplete='off'
          value={dataGruposConvenios.pk_tbl_grupo_convenios}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_grupo_convenios'
          name='nombre_grupo_convenios'
          label={"Nombre convenio"}
          type='text'
          autoComplete='off'
          value={dataGruposConvenios.nombre_grupo_convenios}
          onChange={onChangeFormat}
        />
      </TableEnterprise>
    </>
  );
};

export default SearchGruposConvenios;
