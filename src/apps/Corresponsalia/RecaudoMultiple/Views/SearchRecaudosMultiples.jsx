import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchRecaudosMultiples } from "../utils/fetchRecaudoMultiple";
import ConsultarRecaudosMultiples from "../components/ConsultarRecaudosMultiples";
import { useAuth } from "../../../../hooks/AuthHooks";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";

const SearchRecaudosMultiples = () => {
  const [dataRecaudoMultiple, setDataRecaudoMultiple] = useState({
    pk_tbl_recaudo_multiple: "",
  });
  const [uuid, setUuid] = useState("");
  const { roleInfo, pdpUser } = useAuth();
  const [recaudosMultiples, setRecaudosMultiples] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableRecaudosMultiples = useMemo(() => {
    return [
      ...recaudosMultiples.map(
        ({
          count_data,
          fecha_creacion,
          pk_tbl_recaudo_multiple,
          total_transacciones,
        }) => {
          const date = new Date(fecha_creacion);
          date.setHours(date.getHours() + 5);
          return {
            Id: pk_tbl_recaudo_multiple,
            "Total transacciones": total_transacciones,
            "Transacciones finalizadas": count_data,
            Fecha: Intl.DateTimeFormat("es-CO", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            }).format(date),
          };
        }
      ),
    ];
  }, [recaudosMultiples]);
  useEffect(() => {
    fetchRecaudosMultiplesFunc();
  }, [page, limit, dataRecaudoMultiple]);
  const fetchRecaudosMultiplesFunc = useCallback(() => {
    let obj = {};
    if (dataRecaudoMultiple.pk_tbl_recaudo_multiple)
      obj["pk_tbl_recaudo_multiple"] =
        dataRecaudoMultiple.pk_tbl_recaudo_multiple;
    fetchRecaudosMultiples({
      ...obj,
      page,
      limit,
      sortBy: "fecha_creacion",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setRecaudosMultiples(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, dataRecaudoMultiple]);
  const onClickRow = useCallback(
    (ev, i) => {
      setUuid(recaudosMultiples[i]?.pk_tbl_recaudo_multiple);
    },
    [recaudosMultiples]
  );
  const resetUuid = (e) => {
    e.preventDefault();
    setUuid("");
  };
  return (
    <>
      {uuid === "" ? (
        <TableEnterprise
          title='Recaudos multiples'
          maxPage={maxPages}
          headers={[
            "Id",
            "Total transacciones",
            "Transacciones finalizadas",
            "Fecha creación",
          ]}
          data={tableRecaudosMultiples}
          onSelectRow={onClickRow}
          onSetPageData={setPageData}>
          <Input
            id='pk_tbl_recaudo_multiple'
            label='Id recaudo multiple'
            type='text'
            name='pk_tbl_recaudo_multiple'
            minLength='1'
            maxLength='36'
            autoComplete='false'
            // required
            value={dataRecaudoMultiple.pk_tbl_recaudo_multiple}
            onInput={(e) => {
              setDataRecaudoMultiple((old) => {
                return { ...old, pk_tbl_recaudo_multiple: e.target.value };
              });
            }}></Input>
        </TableEnterprise>
      ) : (
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          <h1 className='text-3xl text-center mb-10 mt-5'>
            Consulta recaudo multiple
          </h1>
          <ConsultarRecaudosMultiples
            uuid={uuid}
            roleInfo={roleInfo}
            pdpUser={pdpUser}
          />
          <ButtonBar>
            <Button type='submit' onClick={resetUuid}>
              Volver a ingresar indentificador
            </Button>
          </ButtonBar>
        </div>
      )}
    </>
  );
};

export default SearchRecaudosMultiples;
