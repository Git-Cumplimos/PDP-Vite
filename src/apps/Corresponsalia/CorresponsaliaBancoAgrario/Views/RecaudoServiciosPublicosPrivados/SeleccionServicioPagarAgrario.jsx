import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { notify, notifyError } from "../../../../../utils/notify";
import { postConsultaTablaConveniosPaginado } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const SeleccionServicioPagarAgrario = () => {
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
  });
  const [convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const tableConvenios = useMemo(() => {
    return [
      ...convenios.map(
        ({ pk_convenios_recaudo_aval, codigo, nombre_convenio }) => {
          return {
            "Id convenio": codigo,
            Convenio: nombre_convenio !== "" ? nombre_convenio : "N/A",
          };
        }
      ),
    ];
  }, [convenios]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate(
        "../corresponsalia/corresponsalia-banco-agrario/recaudoServiciosPublicosPrivados/manual",
        {
          state: {
            id: convenios[i]["pk_tbl_convenios_banco_agrario"],
          },
        }
      );
    },
    [navigate, convenios]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaTablaConveniosPaginado({
      nombre_convenio: datosTrans.convenio,
      codigo: datosTrans.idConvenio,
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
        Recaudo servicios públicos y privados
      </h1>
      <TableEnterprise
        title='Tabla convenios Agrario corresponsal bancario'
        maxPage={maxPages}
        headers={["Código", "Convenio"]}
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
              const num = e.target.value;
              setDatosTrans((old) => {
                return { ...old, idConvenio: num };
              });
            }
          }}></Input>
      </TableEnterprise>
    </>
  );
};

export default SeleccionServicioPagarAgrario;
