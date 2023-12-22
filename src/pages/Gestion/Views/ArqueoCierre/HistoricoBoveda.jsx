import { useState, useEffect, useCallback, Fragment } from "react";
import Input from "../../../../components/Base/Input";
import {
  verHistoricoBoveda,
} from "../../utils/fetchCaja";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../hooks/AuthHooks";
import {
  makeDateFormatter,
} from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { makeMoneyFormatter } from "../../../../utils/functions";
import Fieldset from "../../../../components/Base/Fieldset";

const formatMoney = makeMoneyFormatter(2);

const originalStateSarch = {
  fecha_registro_inicial: "",
  fecha_registro_final: "",
  id_comercio: "",
  id_usuario: "",
  id_terminal: "",
  usuario: "",
};

const dateFormatter = makeDateFormatter(true);

const HistoricoBoveda = () => {
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({});
  const [searchInfo, setSearchInfo] = useState(originalStateSarch);
  const [movimiento, setMovimiento] = useState([]);
  const [boveda, setBoveda] = useState([]);
  const { userPermissions,roleInfo} = useAuth();
  const [verAnalista, setVerAnalista] = useState();

  const searchValidaciones = useCallback(() => {
    setVerAnalista(true)
    verHistoricoBoveda({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
      ),
      ...pageData,
    })
      .then((res) => {
        setMovimiento(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [searchInfo, pageData]);

  const searchValidacionesCajero = useCallback(() => {
    setVerAnalista(false)
    searchInfo["usuario"] = "cajero"
    searchInfo["id_comercio"] = roleInfo?.id_comercio
    searchInfo["id_usuario"] = roleInfo?.id_usuario
    searchInfo["id_terminal"] = roleInfo?.id_dispositivo
    verHistoricoBoveda({
      ...Object.fromEntries(
        Object.entries(searchInfo).filter(([, val]) => val)
      ),
      ...pageData,
    })
      .then((res) => {
        setBoveda(res?.obj?.boveda[0]?.valor_boveda)
        setMovimiento(res?.obj?.results);
        setMaxPages(res?.obj?.maxPages);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [searchInfo, pageData,roleInfo]);

  useEffect(() => {
    const id_permission = []
    userPermissions.forEach(function(val) {
      id_permission.push(val.id_permission)
    })
    id_permission.includes(6213)? 
      searchValidaciones():
      searchValidacionesCajero()
  }, [searchValidaciones,userPermissions,searchValidacionesCajero]);

  const handleChangeNum = (e) => {
    var value = e.target.value;
    if (e.target.name==='id_comercio') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 15) {
        value = value.slice(0, 15);
      }
      setSearchInfo((old) => {return {...old,id_comercio:value}})
    }
    if (e.target.name==='id_usuario') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 15) {
        value = value.slice(0, 15);
      }
      setSearchInfo((old) => {return {...old,id_usuario:value}})
    }
  };

  return (
    <>
      <Fragment>
        <h1 className="text-3xl mt-6">Histórico Movimiento Bóveda</h1>
        {verAnalista === false ? 
        <Fieldset
          legend={"Totales"}>
          <Input
            id='total_valor'
            name='total_valor'
            label={"Total Valor Bóveda"}
            value={formatMoney.format(boveda === undefined?0:boveda)}
            autoComplete='off'
            disabled
          />
        </Fieldset>
        :null}
        <TableEnterprise
          title="Histórico Bóveda"
          headers={[
            "Id comercio",
            "Id Cajero",
            "Tipo de movimiento",
            "Valor del movimiento",
            "Fecha del movimiento",
            "Observaciones",
          ]}
          maxPage={maxPages}
          data={movimiento.map(
            ({
              id_comercio,
              id_usuario,
              tipo_movimiento,
              valor_movimiento,
              created,
              observaciones,
            }) => ({
              id_comercio,
              id_usuario,
              tipo_movimiento,
              valor_movimiento: formatMoney.format(valor_movimiento),
              created: dateFormatter.format(new Date(created)),
              observaciones,
            })
          )}
          onSetPageData={setPageData}
        >
          <Input id="fecha_registro_inicial" label="Fecha Inicial" name="fecha_registro_inicial" type="date"
            onInput={(ev) =>
              setSearchInfo((old) => ({
                ...old,
                [ev.target.name]: ev.target.value,
              }))
            } 
          />
          <Input id="fecha_registro_final" label="Fecha Final" name="fecha_registro_final" type="date" 
            onInput={(ev) =>
              setSearchInfo((old) => ({
                ...old,
                [ev.target.name]: ev.target.value,
              }))
            } 
          />
          {verAnalista === true ?
          <>
            <Input 
              id="id_comercio" 
              label="Id Comercio" 
              name="id_comercio" 
              type="tel"
              value={searchInfo.id_comercio}
              onInput={(ev) =>handleChangeNum(ev)}
              autoComplete="off"
            />
            <Input 
              id="id_usuario" 
              label="Id Cajero" 
              name="id_usuario" 
              type="tel" 
              value={searchInfo.id_usuario}
              autoComplete="off"
              onInput={(ev) =>handleChangeNum(ev)}
            />
          </> :null}
        </TableEnterprise>
      </Fragment>
    </>
  );
};

export default HistoricoBoveda;
