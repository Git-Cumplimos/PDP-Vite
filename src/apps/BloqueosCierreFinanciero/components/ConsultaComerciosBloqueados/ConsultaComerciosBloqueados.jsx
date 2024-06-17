import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCustom } from "../../utils/fetchComerciosCierreFinanciero";
import TableEnterprise from "../../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../../components/Base/Input/Input";
import { useFetch } from "../../../../hooks/useFetch";


// const URL_COMERCIOS = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/bloqueo_cierre_financiero/consulta_bloqueos`;
const URL_COMERCIOS = `http://127.0.0.1:5000/bloqueo_cierre_financiero/consulta_bloqueos`;

const ConsultaComerciosBloqueados = ({
  navigate,
}) => {
  const [dataComercio, setDataComercio] = useState({
    id_comercio: "",
    descripcion: "",
  });
  const [Comercio, setComercio] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const tableComercio = useMemo(() => {
    return [
      ...Comercio.map(
        ({
          id_comercio,
          descripcion,
        }) => {
          return {
            id_comercio: id_comercio,
            descripcion: descripcion ?? "",
          };  
        }
      ),
    ];
  }, [Comercio]);

  const [loadingPeticionConsultaComercios, peticionConsultaComercios] = useFetch(
    fetchCustom(URL_COMERCIOS, "POST", "Consultar Comercio bloqueados")
  );

  const fetchComerciosFunc = useCallback(() => {
      let obj = {};
      if (dataComercio.id_comercio) obj["id_comercio"] = dataComercio.id_comercio;
      if (dataComercio.descripcion) obj["descripcion"] = dataComercio.descripcion;
      peticionConsultaComercios({},{
        ...obj,
        page,
        limit,
        sortBy: "id_comercio",
        sortDir: "DESC",
      })
        .then((autoArr) => {
          setMaxPages(autoArr?.obj?.maxPages);
          setComercio(autoArr?.obj?.results ?? []);
        })
        .catch((err) => console.error(err));
    }, [page, limit, dataComercio]);

  useEffect(() => {
    fetchComerciosFunc();
  }, [dataComercio,page,limit]);

  const selectComercio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      navigate(`${Comercio[i]?.id_comercio}`);
    },
    [
      Comercio,
      navigate
    ]
  );

  return (
    <>
      <TableEnterprise
        title={'Comercios Bloqueados'}
        maxPage={maxPages}
        headers={['Id Comercio','Nombre Comercio']}
        data={tableComercio}
        onSelectRow={selectComercio}
        onSetPageData={setPageData}>
        <Input
          id='id_comercio'
          label='Id Comercio'
          type='text'
          name='id_comercio'
          // minLength='1'
          maxLength='15'
          value={dataComercio.id_comercio}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const valor = e.target.value;
              const num = valor.replace(/[\s\.-]/g, "");
              setDataComercio((old) => {
                return { ...old, id_comercio: num };
              });
            }
          }}
        ></Input>
        <Input
          id='descripcion'
          label='Nombre Comercio'
          type='text'
          name='descripcion'
          // minLength='1'
          maxLength='30'
          value={dataComercio.descripcion}
          onInput={(e) => {
            setDataComercio((old) => {
              return { ...old, descripcion: e.target.value };
            });
          }}
        ></Input>
      </TableEnterprise>
    </>
  );
};

export default ConsultaComerciosBloqueados;
