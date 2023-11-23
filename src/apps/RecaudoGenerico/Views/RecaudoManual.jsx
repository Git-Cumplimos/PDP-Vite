import { useCallback, useEffect, useState } from "react";

import TableEnterprise from "../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../components/Base/Input";
import fetchData from "../../../utils/fetchData";
import useDelayedCallback from "../../../hooks/useDelayedCallback";
import { useAuth } from "../../../hooks/AuthHooks";
 
const url = process.env.REACT_APP_URL_RECAUDO_GENERICO;

const RecaudoManual = () => {
  const { pdpUser, roleInfo } = useAuth();
  const [conv, setConv] = useState([]);
  const [maxPage, setMaxPage] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    id_convenio_autorizador: "",
    nombre_convenio: "",
    ean_convenio: "",
    estado: true
  });

  const searchConvenios = useDelayedCallback(
    useCallback(() => {
      const data = {
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_usuario: roleInfo.id_usuario,
          id_terminal: roleInfo.id_dispositivo,
          nombre_comercio: roleInfo?.["nombre comercio"],
          nombre_usuario:pdpUser?.uname
        },
        ubicacion:{
          address: roleInfo.direccion,
          dane_code: roleInfo.codigo_dane,
          city:roleInfo.ciudad
        },
        info_transaccion:{
          limit: pageData.limit,
          page: pageData.page,
          ...Object.fromEntries(
            Object.entries(searchFilters)
              .filter(([_, val]) => val)
          ),
        }
      }
      fetchData(`${url}/backend/recaudo-generico/convenios/consultar-convenios`, "POST",{},data)
        .then((res) => {
          if (res?.status) {
            
            setConv(res?.obj?.result?.results);
            setMaxPage(res?.obj?.result?.max_pages);
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    },[pageData,searchFilters]),300);

  useEffect(() => {
    searchConvenios();
  }, [searchConvenios]);

  return (
    <div className="py-10 flex items-center flex-col">
      <TableEnterprise
        title="Recaudo Servicios Públicos y Privados Manual"
        headers={["Código de convenio", "Nombre de convenio", "EAN"]}
        data={conv.map(({id_convenio_autorizador,nombre_convenio,ean_convenio}) => ({
          id_convenio_autorizador,
          nombre_convenio,
          ean_convenio,
        }))}
        maxPage={maxPage}
        onSetPageData={setPageData}
        onSelectRow={() => {}}
        onChange={(ev) => setSearchFilters((old) => ({
          ...old,
          [ev.target.name]: ev.target.value,
        }))}
      >
      <Input
        id={"id_convenio"}
        label={"Código convenio - Nura"}
        type="tel"
        maxLength={20}
        value={searchFilters.id_convenio_autorizador}
        onChange={(e) => {
          if (!isNaN(e.target.value)) {
            setSearchFilters((old) => {
              return { ...old, id_convenio_autorizador: e.target.value };
            });
          }
        }}
      />
      <Input
        id={"nombre_convenio"}
        label={"Nombre convenio"}
        type="text"
        maxLength={30}
        value={searchFilters.nombre_convenio}
        onChange={(e) => {
            setSearchFilters((old) => {
              return { ...old, nombre_convenio: e.target.value };
            });
        }}
      />
      <Input
        id={"ean"}
        label={"EAN"}
        type="text"
        maxLength={13}
        value={searchFilters.ean_convenio}
        onChange={(e) => {
          if (!isNaN(e.target.value)) {
            setSearchFilters((old) => {
              return { ...old, ean_convenio: e.target.value };
            });
          }
        }}
      />
      </TableEnterprise>
    </div>
  );
};

export default RecaudoManual;
