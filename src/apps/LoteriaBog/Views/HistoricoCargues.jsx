import { useState, useCallback, useEffect} from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notifyError } from "../../../utils/notify";

const HistoricoCargues = ({ route }) => {
  const [urls, setUrls] = useState(false);
  const { historicoCargues } = useLoteria();
  const [resp_con_sort, setResp_con_sort] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit}, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    fecha_ini: "",
    fecha_fin: "",
    archivo: "",
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
    fetchTablaCargues();
  }, [datosTrans,page, limit])
  
  const fetchTablaCargues = () => {
    historicoCargues({ 
      fecha_ini: datosTrans.fecha_ini,
      fecha_fin: datosTrans.fecha_fin,
      archivo: datosTrans.archivo,
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

  const onArchivoChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setDatosTrans((old) => {
      return { ...old, archivo: valueInput };
    });
  };

  return (
    <>
      <h1 class="text-3xl">Histórico cargues de archivos</h1>
      <TableEnterprise
        title='Registros de cargues de archivos'
        maxPage={maxPages}
        headers={["Lotería","Archivo","Nombre","Estado","Detalle","Registros cargados","Usuario","Fecha y hora"]}
        onSetPageData={setPageData}
        data={resp_con_sort.map(({ nom_loteria,archivo,nombrearchivo,estado,motivo,numregistros,usuario,fecha_cargue }) => {
          return {nom_loteria,archivo,nombrearchivo,estado,motivo,numregistros,usuario,fecha_cargue};
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
        <select
          id="num_sorteo"
          label="Tipo de archivo"
          type="tel"
          minLength="1"
          maxLength="6"
          autoComplete="off"
          value={datosTrans?.archivo}
          onChange={onArchivoChange}
        />
      </TableEnterprise>
    </>
  );
};

export default HistoricoCargues;