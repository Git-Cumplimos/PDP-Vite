import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postConsultaOperadores } from "../../utils/fetchServicioRecargas";

const RecargasPaquetes = ({ subRoutes }) => {

  const navigate = useNavigate();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    operador: "",
    isPack: "",
  });
  const [operadores, setOperadores] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const {roleInfo} = useAuth();

  const tableOperadores = useMemo(() => {
    return [
      ...operadores.map(({desc,isPack,op}) => {
        return {
          "Descripcion": desc,
          "Servicio": isPack, 
        };
      }),
    ];
  }, [operadores]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      if (operadores[i]["desc"] === "Movistar"){
        navigate ("../movistar/recargas-movistar")
      }
      else if (operadores[i]["desc"] === "Paquetes Movistar"){
        navigate ("../movistar/paquetes-movistar")
      }      
      else {
        (operadores[i]["isPack"] === "Recarga")
        ? navigate(
          "../recargas-paquetes/Recargar",
          {
            state: {
              operador_recargar: operadores[i]["desc"],
              producto: operadores[i]["op"],
            },
          }         
        )
        : navigate(
          "../recargas-paquetes/Venta-paquetes",
          {
            state: {
              operador_recargar: operadores[i]["desc"],
              producto: operadores[i]["op"],
            },
          }        
        )        
      }
    },
    [navigate, operadores]
  );

  useEffect(() => {
    fecthTablaConveniosPaginadoFunc();
  }, [datosTrans, page, limit]);

  const fecthTablaConveniosPaginadoFunc = () => {
    postConsultaOperadores({
      idcomercio : roleInfo?.["id_comercio"],
      page,
      limit,
      operador: datosTrans.operador,
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setOperadores(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  };
  
  return (
    <>
      <h1 className='text-3xl text-center'>
        Servicios de recargas y venta de paquetes
      </h1>
      <TableEnterprise
        title='Tabla servicio de recargas'
        maxPage={maxPages}
        headers={["Descripción","Servicio"]}
        data={tableOperadores}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
      >
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Nombre operador"}
          minLength='1'
          maxLength='30'
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, operador: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default RecargasPaquetes;
