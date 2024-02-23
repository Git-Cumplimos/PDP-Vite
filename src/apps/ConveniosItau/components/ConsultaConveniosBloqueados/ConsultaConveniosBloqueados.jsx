import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCustom } from "../../utils/fetchConveniosItau";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../components/Base/Input/Input";
import { useFetch } from "../../../../hooks/useFetch";


// const URL_CORRESPONSALIA_ITAU = `${process.env.REACT_APP_URL_CORRESPONSALIA_ITAU}/convenios_itau/consulta_bloqueos`;
const URL_CORRESPONSALIA_ITAU = `http://127.0.0.1:5000/convenios_itau/consulta_bloqueos`;

const ConsultaConveniosBloqueados = ({
  navigate,
}) => {
  const [dataConvenios, setDataConvenios] = useState({
    id_convenio: "",
  });
  const [Convenios, setConvenios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableConvenios = useMemo(() => {
    return [
      ...Convenios.map(
        ({
          id_convenio,
          descripcion,
        }) => {
          return {
            id_convenio: id_convenio,
            descripcion: descripcion ?? "",
          };  
        }
      ),
    ];
  }, [Convenios]);

  const [loadingPeticionConsultaConvenios, peticionConsultaConvenios] = useFetch(
    fetchCustom(URL_CORRESPONSALIA_ITAU, "POST", "Consultar convenios bloqueados")
  );

  const fetchConveniosFunc = useCallback(() => {
      let obj = {};
      if (dataConvenios.id_convenio) obj["id_convenio"] = dataConvenios.id_convenio;
      peticionConsultaConvenios({},{
        ...obj,
        page,
        limit,
        sortBy: "id_convenio",
        sortDir: "DESC",
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.obj?.maxPages);
          setConvenios(autoArr?.obj?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [page, limit, dataConvenios]);

  useEffect(() => {
    fetchConveniosFunc();
  }, [dataConvenios,page,limit]);

  const selectConvenio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      navigate(`editar/${Convenios[i]?.id_convenio}`);
    },
    [
      Convenios,
      navigate
    ]
  );

  return (
    <>
      <TableEnterprise
        title={'Bloqueo Convenios Itaú'}
        maxPage={maxPages}
        headers={['Número Convenio Itaú','Descripción Convenio']}
        data={tableConvenios}
        onSelectRow={selectConvenio}
        onSetPageData={setPageData}>
        <Input
          id='id_convenio'
          label='Número Convenio Itaú'
          type='text'
          name='id_convenio'
          minLength='1'
          maxLength='4'
          value={dataConvenios.id_convenio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const valor = e.target.value;
              const num = valor.replace(/[\s\.-]/g, "");
              setDataConvenios((old) => {
                return { ...old, id_convenio: num };
              });
            }
          }}
        ></Input>
      </TableEnterprise>
    </>
  );
};

export default ConsultaConveniosBloqueados;
