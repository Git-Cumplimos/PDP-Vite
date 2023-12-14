import { useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
// import { notifyError } from "../../../../utils/notify";
import { buscarPlataformaExt } from "../../utils/fetchCaja";

const SearchEntidadesExternas = ({
  setSelectedEntidadesExt,
  handleClose,
  selectedEntidadesExt,
}) => {
  const [data, setData] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({ pk_nombre_plataforma: "" });

  const tableConvenios = useMemo(() => {
    return [
      ...data.map(({ pk_id_plataforma, pk_nombre_plataforma}) => {
        return {
          pk_id_plataforma,
          pk_nombre_plataforma
        };
      }),
    ];
  }, [data]);

  const buscarPlataforma = useCallback(() => {
    buscarPlataformaExt({ ...pageData, ...searchFilters })
      .then((res) => {
        setMaxPages(res?.obj?.maxPages);
        setData(res?.obj?.results ?? []);    
      })
      .catch((err) => console.error(err));
  }, [pageData, searchFilters]);

  useEffect(() => {
    buscarPlataforma();
  }, [pageData,searchFilters,buscarPlataforma]);

  const addEntidad = useCallback(
    (ev, i) => {
      ev.preventDefault();
      if (
        !selectedEntidadesExt?.entidades_agregar?.find(
          (a) => a?.id_plataforma === data[i].pk_id_plataforma
        )
      ) {
        const obj = { ...selectedEntidadesExt };
        obj["entidades_agregar"] = [
          ...obj["entidades_agregar"],
          {
            id_plataforma: data[i].pk_id_plataforma,
            nombre_plataforma: data[i].pk_nombre_plataforma,
          },
        ];
        setSelectedEntidadesExt((old) => {
          return {
            ...old,
            entidades_agregar: obj["entidades_agregar"],
          };
        });
        handleClose();
      } else {
        var dato = selectedEntidadesExt?.entidades_agregar?.find(
          (a) => a?.id_plataforma === data[i].pk_id_plataforma
        )
        var posicion = selectedEntidadesExt?.entidades_agregar?.indexOf(dato);
        selectedEntidadesExt?.entidades_agregar.splice(posicion, 1);
        handleClose();
      }
    },
    [selectedEntidadesExt,data,handleClose,setSelectedEntidadesExt]
  );

  return (
    <>
      <TableEnterprise
        title='Lista de entidades'
        maxPage={maxPages}
        headers={["Id", "Nombre Plataforma"]}
        data={tableConvenios}
        onSelectRow={addEntidad}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
        onSetPageData={setPageData}>
        <Input
          id='pk_nombre_plataforma'
          label='Nombre Plataforma'
          type='text'
          name='pk_nombre_plataforma'
          maxLength={"30"}
          autoComplete="off"
        />
      </TableEnterprise>
    </>
  );
};

export default SearchEntidadesExternas;
