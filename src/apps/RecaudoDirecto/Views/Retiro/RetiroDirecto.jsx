import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getRetirosList } from "../../utils/fetchFunctions"

const RetiroDirecto = () => {
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('');


  const [listRetiro, setListRetiro] = useState('')
  const [cargando, setCargando] = useState(false)
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  const getRetiros = useCallback(async () => {
    await getRetirosList({
      ...searchFilters,
      limit: pageData.limit,
      offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit
    })
    .then((data) => {
      setListRetiro(data?.obj?.results ?? []);
      setMaxPages(data?.obj?.maxPages ?? '')
    })
    .catch((err) => {
      // setListRetiro([]);
      // if (err?.cause === "custom") {
      //   notifyError(err?.message);
      //   return;
      // }
      console.error(err?.message);
    });
    setCargando(true)
  }, [pageData, searchFilters])

  useEffect(() => { getRetiros() }, [getRetiros, pageData, searchFilters])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Retiros Directos</h1>
      {cargando ? (
        <TableEnterprise
          title="Convenios de Retiros"
          headers={[
            "Código convenio",
            "Código EAN o IAC",
            "Nombre convenio",
          ]}
          data={listRetiro.map(
            ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
            }) => ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
            })
          )}
          onSelectRow={(e, i) => {
            navigate(`/recaudo-directo/consultar-retiro/retirar/${listRetiro[i].pk_id_convenio_directo}`)
          }}
          maxPage={maxPages}
          onSetPageData={setPageData}
          onChange={(ev) => {
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }}
        >
          <Input
            id={"pk_codigo_convenio"}
            label={"Código de convenio"}
            name={"pk_id_convenio_directo"}
            type="tel"
            autoComplete="off"
            maxLength={"4"}
          />
          <Input
            id={"codigo_ean_iac_search"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            type="tel"
            autoComplete="off"
            maxLength={"13"}
          />
          <Input
            id={"nombre_convenio"}
            label={"Nombre del convenio"}
            name={"nombre_convenio"}
            type="text"
            autoComplete="off"
            maxLength={"30"}
          />
        </TableEnterprise>
      ) : (<>cargando...</>)}
    </Fragment>
  )
}

export default RetiroDirecto