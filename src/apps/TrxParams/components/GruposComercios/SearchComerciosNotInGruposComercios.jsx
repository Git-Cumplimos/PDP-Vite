import { useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchComerciosNotInGruposComercios } from "../../utils/fetchGruposComercios";
import { notifyError } from "../../../../utils/notify";

const SearchComerciosNotInGruposComercios = ({
  setSelectedGruposComercios,
  handleClose,
  selectedGruposComercios,
  pk_tbl_grupo_comercios,
  comerciosOriginal,
}) => {
  const [dataComercios, setDataComercios] = useState({
    pk_comercio: "",
    nombre_comercio: "",
  });
  const [comercios, setComercios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableComercios = useMemo(() => {
    return [
      ...comercios.map(({ nombre_comercio, pk_comercio }) => {
        return {
          pk_comercio,
          nombre_comercio,
        };
      }),
    ];
  }, [comercios]);
  useEffect(() => {
    fetchComerciosNotInGruposComerciosFunc();
  }, [page, limit, dataComercios]);
  const fetchComerciosNotInGruposComerciosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(dataComercios.pk_comercio))
      obj["pk_comercio"] = parseInt(dataComercios.pk_comercio);
    if (dataComercios.nombre_comercio)
      obj["nombre_comercio"] = dataComercios.nombre_comercio;

    obj["pk_tbl_grupo_comercios"] = pk_tbl_grupo_comercios;
    fetchComerciosNotInGruposComercios({
      ...obj,
      page,
      limit,
      sortBy: "pk_comercio",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, dataComercios]);
  const addComercio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (
        !selectedGruposComercios?.comercios_agregar?.find(
          (a) => a?.fk_comercio === comercios[i].pk_comercio
        )
      ) {
        const obj = { ...selectedGruposComercios };
        obj["comercios_agregar"] = [
          ...obj["comercios_agregar"],
          {
            fk_comercio: comercios[i].pk_comercio,
            fk_tbl_grupo_comercios:
              selectedGruposComercios["pk_tbl_grupo_comercios"],
          },
        ];
        setSelectedGruposComercios((old) => {
          return {
            ...old,
            comercios_agregar: obj["comercios_agregar"],
          };
        });
        handleClose();
      } else {
        return notifyError("El comercio ya se ha agregado anteriormente");
      }
    },
    [selectedGruposComercios, comercios]
  );
  return (
    <>
      <TableEnterprise
        title='Lista de comercios'
        maxPage={maxPages}
        headers={["Id", "Comercio"]}
        data={tableComercios}
        onSelectRow={addComercio}
        onSetPageData={setPageData}>
        <Input
          id='pk_comercio'
          label='Id comercio'
          type='text'
          name='pk_comercio'
          minLength='1'
          maxLength='10'
          // required
          value={dataComercios.pk_comercio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDataComercios((old) => {
                return { ...old, pk_comercio: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_comercio'
          label='Nombre comercio'
          type='text'
          name='nombre_comercio'
          minLength='1'
          maxLength='10'
          // required
          value={dataComercios.nombre_comercio}
          onInput={(e) => {
            setDataComercios((old) => {
              return { ...old, nombre_comercio: e.target.value };
            });
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SearchComerciosNotInGruposComercios;
