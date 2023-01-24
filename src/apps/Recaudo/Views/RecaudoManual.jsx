import { Fragment, useCallback, useEffect, useState } from "react";
import fetchData from "../../../utils/fetchData";
import { useNavigate } from "react-router-dom";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Input from "../../../components/Base/Input";
import { onChangeNumber } from "../../../utils/functions";
import useDelayedCallback from "../../../hooks/useDelayedCallback";

const urlConvenios =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const RecaudoManual = () => {
  const navigate = useNavigate();
  const [foundConv, setFoundConv] = useState([]);
  const [maxPage, setMaxPage] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio: "",
    nombre_convenio: "",
    tags: "",
    estado: true
  });

  const searchConvenios = useDelayedCallback(
    useCallback(() => {
      fetchData(`${urlConvenios}/convenios-pdp/administrar`, "GET", {
        ...pageData,
        ...Object.fromEntries(
          Object.entries(searchFilters)
            .filter(([_, val]) => val)
            .map(([key, val]) => [key, key === "tags" ? val.split(",") : val])
        ),
      })
        .then((res) => {
          if (res?.status) {
            setFoundConv(res?.obj?.results);
            setMaxPage(res?.obj?.max_pages);
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    }, [pageData, searchFilters]),
    300
  );

  useEffect(() => {
    searchConvenios();
  }, [searchConvenios]);

  return (
    <Fragment>
      <TableEnterprise
        title="Convenios de recaudo PDP"
        headers={["Codigo de convenio", "Nombre de convenio"]}
        data={foundConv.map(({ pk_id_convenio, nombre_convenio }) => ({
          pk_id_convenio,
          nombre_convenio,
        }))}
        maxPage={maxPage}
        onSetPageData={setPageData}
        onSelectRow={(_, i) =>
          navigate(
            `/recaudo/trx?id_convenio=${foundConv[i]?.pk_id_convenio}`
          )
        }
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        <Input
          id={"pk_id_convenio"}
          label={"Código de convenio"}
          name={"pk_id_convenio"}
          type="tel"
          autoComplete="off"
          maxLength={"10"}
          onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
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
        <Input
          id={"tags"}
          label={"Tags"}
          name={"tags"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
          required
        />
      </TableEnterprise>
    </Fragment>
  );
};

export default RecaudoManual;
