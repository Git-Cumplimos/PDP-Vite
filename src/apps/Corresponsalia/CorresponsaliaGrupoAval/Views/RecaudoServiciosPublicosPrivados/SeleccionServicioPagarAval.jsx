import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../../utils/notify";
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import useDelayedCallback from "../../../../../hooks/useDelayedCallback";

const SeleccionServicioPagarAval = () => {
  const navigate = useNavigate();
  // const [{ searchConvenio = "" }, setQuery] = useQuery();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    convenio: "",
    idConvenio: "",
    idEAN: "",
    nit: "",
  });
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({ pk_convenios_recaudo_aval, nura, convenio, ean, nit }) => {
          return {
            "Id convenio": nura,
            Convenio: convenio !== "" ? convenio : "N/A",
            NIT: nit !== "" ? nit : "N/A",
            EAN: ean !== "" ? ean : "N/A",
          };
        }
      ),
    ];
  }, [convenios]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate(
        "../corresponsalia/corresponsaliaGrupoAval/recaudoServiciosPublicosPrivados/manual",
        {
          state: {
            id: convenios[i]["pk_convenios_recaudo_aval"],
          },
        }
      );
    },
    [navigate, convenios]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = useDelayedCallback(
    useCallback(() => {
      postConsultaTablaConveniosPaginado({
        convenio: datosTrans.convenio,
        nura: datosTrans.idConvenio,
        ean: datosTrans.ean,
        nit: datosTrans.nit,
        page,
        limit,
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.maxPages);
          setConvenios(autoArr?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [datosTrans, page, limit]),
    500
  );
  return (
    <>
      <h1 className='text-3xl text-center'>
        Recaudo servicios públicos y privados
      </h1>
      <TableEnterprise
        title='Tabla convenios AVAL corresponsal bancario'
        maxPage={maxPages}
        headers={["Id", "Convenio", "NIT", "EAN"]}
        data={tableConvenios}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Nombre convenio"}
          minLength='1'
          maxLength='30'
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
          label='Código convenio'
          type='text'
          name='idConvenio'
          minLength='1'
          maxLength='13'
          required
          value={datosTrans.idConvenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.-]/g, "");
              setDatosTrans((old) => {
                return { ...old, idConvenio: num };
              });
            }
          }}></Input>
        <Input
          id='nit'
          label='NIT'
          type='text'
          name='nit'
          minLength='1'
          maxLength='13'
          required
          value={datosTrans.nit}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.-]/g, "");
              setDatosTrans((old) => {
                return { ...old, nit: num };
              });
            }
          }}></Input>
        <Input
          id='ean'
          label='EAN'
          type='text'
          name='ean'
          minLength='1'
          maxLength='13'
          required
          value={datosTrans.ean}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              // const num = e.target.value;
              const num = e.target.value.replace(/[\s\.-]/g, "");
              setDatosTrans((old) => {
                return { ...old, ean: num };
              });
            }
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SeleccionServicioPagarAval;
