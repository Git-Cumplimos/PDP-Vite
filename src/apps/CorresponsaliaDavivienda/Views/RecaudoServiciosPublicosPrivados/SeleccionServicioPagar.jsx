import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../utils/notify";
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const SeleccionServicioPagar = () => {
  const navigate = useNavigate();
  // const [{ searchConvenio = "" }, setQuery] = useQuery();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    convenio: "",
    idConvenio: "",
    idIAC: "",
  });
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({
          pk_tbl_transaccional_convenios_davivienda_cb,
          nom_convenio_cnb,
          cod_convenio_cnb,
          cod_iac_cnb,
        }) => {
          return {
            "Id convenio": cod_convenio_cnb,
            Convenio: nom_convenio_cnb,
            "Id IAC": cod_iac_cnb,
          };
        }
      ),
    ];
  }, [convenios]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate(
        "../corresponsaliaDavivienda/recaudoServiciosPublicosPrivados/manual",
        {
          state: {
            id: convenios[i]["pk_tbl_transaccional_convenios_davivienda_cb"],
          },
        }
      );
      console.log(convenios[i]["pk_tbl_transaccional_convenios_davivienda_cb"]);
    },
    [tableConvenios, navigate]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginado({
      nom_convenio_cnb: datosTrans.convenio,
      cod_convenio_cnb: datosTrans.idConvenio,
      cod_iac_cnb: datosTrans.idIAC,
      page,
      limit,
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };
  return (
    <>
      <h1 className='text-3xl text-center'>
        Recaudo servicios publicos y privados
      </h1>
      <TableEnterprise
        title='Tabla convenios Davivienda corresponsal bancario'
        maxPage={maxPages}
        headers={["Id", "Convenio", "Id IAC"]}
        data={tableConvenios}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Buscar convenio"}
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, convenio: e.target.value };
            });
          }}
        />
        <Input
          id='idConvenio'
          label='Id convenio'
          type='text'
          name='idConvenio'
          minLength='1'
          maxLength='13'
          required
          value={datosTrans.idConvenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, idConvenio: num };
              });
            }
          }}></Input>
        <Input
          id='idIAC'
          label='Id IAC'
          type='text'
          name='idIAC'
          minLength='1'
          maxLength='13'
          required
          value={datosTrans.idIAC}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, idIAC: num };
              });
            }
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SeleccionServicioPagar;
