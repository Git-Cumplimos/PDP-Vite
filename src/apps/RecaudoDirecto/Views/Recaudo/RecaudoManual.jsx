import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { getRecaudosList } from "../../utils/fetchFunctions"
import { notifyError } from "../../../../utils/notify";
import { onChangeEan13Number } from "../../utils/functions";
import { onChangeNumber } from "../../../../utils/functions";

const RecaudoManual = () => {
  const navigate = useNavigate();


  const [listRecaudos, setListRecaudos] = useState([])
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  const getRecaudos = useCallback(async () => {
    await getRecaudosList({
      ...pageData,
      ...searchFilters,
      estado: true
    })
      .then((data) => {
        setListRecaudos(data?.obj?.results ?? []);
        setMaxPages(data?.obj?.maxPages ?? '')
      })
      .catch((err) => {
        // setListRecaudos([]);
        // if (err?.cause === "custom") {
        //   notifyError(err?.message);
        //   return;
        // }
        console.error(err?.message);
      });
  }, [pageData, searchFilters])

  useEffect(() => { getRecaudos() }, [getRecaudos, searchFilters, pageData])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudos manual</h1>
      <TableEnterprise
        title="Convenios de recaudo"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
        ]}
        // data={datos['value'].map(
        data={listRecaudos.map(
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

          if (listRecaudos[i].estado) {
            if (listRecaudos[i].fk_id_tipo_convenio !== 2) {
              navigate(`/recaudo-directo/recaudo/${listRecaudos[i].pk_id_convenio_directo}`)
            } else { notifyError("Error, convenio con autorizador esta en desarrollo!") }
          } else { notifyError("Error, convenio no activo!") }
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
          onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
          required
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"ean13"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onInput={(ev) => { ev.target.value = onChangeEan13Number(ev); }}
          required
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}

          required
        />
      </TableEnterprise>
    </Fragment>
  )
}

export default RecaudoManual