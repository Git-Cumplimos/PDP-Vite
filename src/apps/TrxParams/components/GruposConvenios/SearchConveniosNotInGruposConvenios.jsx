import { useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchComerciosNotInGruposComercios } from "../../utils/fetchGruposComercios";
import { notifyError } from "../../../../utils/notify";
import { fetchConveniosNotInGruposConvenios } from "../../utils/fetchGruposConvenios";

const SearchConveniosNotInGruposConvenios = ({
  setSelectedGruposConvenios,
  handleClose,
  selectedGruposConvenios,
  pk_tbl_grupo_convenios,
  comerciosOriginal,
}) => {
  const [dataConvenios, setDataConvenios] = useState({
    id_convenio: "",
    nombre_convenio: "",
  });
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(({ nombre_convenio, id_convenio }) => {
        return {
          id_convenio,
          nombre_convenio,
        };
      }),
    ];
  }, [convenios]);
  useEffect(() => {
    fetchConveniosNotInGruposConveniosFunc();
  }, [page, limit, dataConvenios]);
  const fetchConveniosNotInGruposConveniosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(dataConvenios.id_convenio))
      obj["id_convenio"] = parseInt(dataConvenios.id_convenio);
    if (dataConvenios.nombre_convenio)
      obj["nombre_convenio"] = dataConvenios.nombre_convenio;

    obj["pk_tbl_grupo_convenios"] = pk_tbl_grupo_convenios;
    fetchConveniosNotInGruposConvenios({
      ...obj,
      page,
      limit,
      sortBy: "id_convenio",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, dataConvenios]);
  const addConvenio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (
        !selectedGruposConvenios?.convenios_agregar?.find(
          (a) => a?.fk_convenio === convenios[i].id_convenio
        )
      ) {
        const obj = { ...selectedGruposConvenios };
        obj["convenios_agregar"] = [
          ...obj["convenios_agregar"],
          {
            fk_convenio: convenios[i].id_convenio,
            fk_tbl_grupo_convenios:
              selectedGruposConvenios["pk_tbl_grupo_convenios"],
          },
        ];
        setSelectedGruposConvenios((old) => {
          return {
            ...old,
            convenios_agregar: obj["convenios_agregar"],
          };
        });
        handleClose();
      } else {
        return notifyError("El convenio ya se ha agregado anteriormente");
      }
    },
    [selectedGruposConvenios, convenios]
  );
  return (
    <>
      <TableEnterprise
        title='Lista de convenios'
        maxPage={maxPages}
        headers={["Id", "Comercio"]}
        data={tableConvenios}
        onSelectRow={addConvenio}
        onSetPageData={setPageData}>
        <Input
          id='id_convenio'
          label='Id grupo de planes'
          type='text'
          name='id_convenio'
          minLength='1'
          maxLength='10'
          // required
          value={dataConvenios.id_convenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDataConvenios((old) => {
                return { ...old, id_convenio: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_convenio'
          label='Nombre grupo de planes'
          type='text'
          name='nombre_convenio'
          minLength='1'
          maxLength='10'
          // required
          value={dataConvenios.nombre_convenio}
          onInput={(e) => {
            setDataConvenios((old) => {
              return { ...old, nombre_convenio: e.target.value };
            });
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SearchConveniosNotInGruposConvenios;
