import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate,useLocation } from "react-router-dom";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postConsultaPaquetes } from "../../utils/fetchServicioRecargas";

const SubPaquetesMoviles = ({ subRoutes }) => {
  
  const navigate = useNavigate();
  const { state } = useLocation();
console.log("ESTO ES STATE",state)
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    valor: "",
  });
  const [paquetes, setPaquetes] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const {roleInfo} = useAuth();

  const tablePaquetes = useMemo(() => {
    return [
      ...paquetes.map(({productDesc,sell}) => {
        return {
          "Descripcion": productDesc,
          "Valor_p": sell, 
        };
      }),
    ];
  }, [paquetes]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      navigate(
        "../recargas-paquetes/Recargar-paquete",
        {
          state: {
            valor_paquete: paquetes[i]["sell"],
            codigo_paq: paquetes[i]["practiCode"],
            descripcion: paquetes[i]["productDesc"],
            operador: state?.producto,
            operador_recargar: state?.operador_recargar,
            operadorPaquete: state?.operadorPaquete,
          },
        }        
      )
    },
    [navigate, paquetes]
  );
    
  useEffect(() => {
    fecthTablaPaquetesFunc();
  }, [datosTrans, page, limit]);

  useEffect(() => {
    if (state?.producto) {
      fecthTablaPaquetesFunc();
    } else {
      navigate("../");
    }
  }, [state?.producto]);
  
  const fecthTablaPaquetesFunc = () => {
    console.log("LLEGO A ESTE PUNTO",state?.producto)
    postConsultaPaquetes({
      idcomercio : roleInfo?.["id_comercio"],
      producto : state?.producto,
      page,
      limit,
      valor:datosTrans.valor,
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setPaquetes(autoArr?.response ?? []);
      })
      .catch((err) => console.error(err));
  };
  
  return (
    <>
      <h1 className='text-3xl text-center'>
        Servicios de recargas y venta de paquetes
      </h1>
      <TableEnterprise
        title='Tabla servicio de venta de paquetes'
        maxPage={maxPages}
        headers={["Descripción","Valor del paquete"]}
        data={tablePaquetes}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
      >
        <Input
          id='valor_p'
          name='valor_p'
          label='Valor'
          minLength='1'
          maxLength='13'
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, valor: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default SubPaquetesMoviles;