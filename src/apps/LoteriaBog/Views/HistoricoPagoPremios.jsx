import { useState, useEffect} from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notifyError } from "../../../utils/notify";
import Select from "../../../components/Base/Select"

const HistoricoPagoPremios = ({ route }) => {
  const { historicoPagoPremios } = useLoteria();
  const [resp_con_sort, setResp_con_sort] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit}, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    fecha_ini: "",
    fecha_fin: "",
    sorteo:"",
    numero:"",
    serie:"",
  });

  const handleChange = (e) => {
    if (e.target.value) {
      setDatosTrans((old) => {
        return { ...old, fecha_ini: e.target.value };
      });
    }
  };

  const handleChange2 = (e) => {
    if (e.target.value) {
      setDatosTrans((old) => {
        return { ...old, fecha_fin: e.target.value };
      });
    }
  };

  useEffect(() => {
    fetchTablaPagos();
  }, [datosTrans,page, limit])
  
  const fetchTablaPagos = () => {
    historicoPagoPremios({ 
      fecha_ini: datosTrans.fecha_ini,
      fecha_fin: datosTrans.fecha_fin,
      sorteo: datosTrans.sorteo,
      numero: datosTrans.numero,
      serie: datosTrans.serie,
      page,
      limit,
    })
      .then((res) => {
        if (res !== undefined) {
          if (!("msg" in res)) {
            setResp_con_sort(res.info ?? []);
            setMaxPages(res.num_datos ?? 1);

          } else {
            notifyError(res.msg);
            setResp_con_sort([]);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1 class="text-3xl">Histórico pago de premios</h1>
      <TableEnterprise
        title='Registros pago de premios'
        maxPage={maxPages}
        headers={["Número sorteo","Número billete","Número serie","Id Comercio","Valor Pagado","Fecha"]}
        onSetPageData={setPageData}
        data={resp_con_sort.map(({num_sorteo,num_billete,serie,id_comercio,valor_neto,fecha_pago}) => {
          return {num_sorteo,num_billete,serie,id_comercio,valor_neto,fecha_pago};
        })}
      >
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          onChange={handleChange}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          onInput={handleChange2}
        />
        <Input
            id="numTicket"
            label="Número de Sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            value={datosTrans.sorteo}
            onInput={(e) => {
                if (!isNaN(e.target.value)) {
                    setDatosTrans((old) => {
                        return { ...old, sorteo: e.target.value };
                    });
                }
            }}
        />
        <Input
            id="numTicket"
            label="Número de billete"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            value={datosTrans.numero}
            onInput={(e) => {
                if (!isNaN(e.target.value)) {
                    setDatosTrans((old) => {
                        return { ...old, numero: e.target.value };
                    });
                }
            }}
        />
        <Input
            id="numSerie"
            label="Número de serie"
            type="search"
            minLength="1"
            maxLength="3"
            autoComplete="off"
            value={datosTrans.serie}
            onInput={(e) => {
                if (!isNaN(e.target.value)) {
                    setDatosTrans((old) => {
                        return { ...old, serie: e.target.value};
                    });
                }
            }}
        />
      </TableEnterprise>
    </>
  );
};

export default HistoricoPagoPremios