import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const SeleccionServicioPagar = () => {
  const navigate = useNavigate();
  const [{ searchConvenio = "" }, setQuery] = useQuery();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const [convenios, setConvenios] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({
          pk_tbl_transaccional_convenios_davivienda_cb,
          nom_convenio_cnb,
        }) => {
          return {
            "Id convenio": pk_tbl_transaccional_convenios_davivienda_cb,
            Convenio: nom_convenio_cnb,
          };
        }
      ),
    ];
  }, [convenios]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate("../corresponsaliaDavivienda/recaudoServiciosPublicosPrivados", {
        state: {
          id: tableConvenios[i]["Id convenio"],
        },
      });
      console.log(tableConvenios[i]["Id convenio"]);
    },
    [tableConvenios, navigate]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameAuto = formData.get("searchConvenio");
      setQuery({ searchConvenio: nameAuto }, { replace: true });
    },
    [setQuery]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [searchConvenio, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginado({
      nom_convenio_cnb: searchConvenio,
      page,
      limit,
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConvenios(autoArr?.results);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <TableEnterprise
        title='Tabla convenios Davivienda corresponsal bancario'
        maxPage={maxPages}
        headers={["Id", "Convenio"]}
        data={tableConvenios}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Buscar convenio"}
          type='text'
          autoComplete='off'
          defaultValue={searchConvenio}
        />
      </TableEnterprise>
    </>
  );
};

export default SeleccionServicioPagar;
