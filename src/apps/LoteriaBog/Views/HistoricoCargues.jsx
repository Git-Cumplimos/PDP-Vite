import { useState, useEffect} from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import Input from "../../../components/Base/Input";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notifyError } from "../../../utils/notify";
import Select from "../../../components/Base/Select"

const HistoricoCargues = ({ route }) => {
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

  const opcionesdisponibles = ([
    { value: "", label: "" },
    { value: "Plan de premios", label: "Plan de premios" },
    { value: "Asignación", label: "Asignación" },
    { value: "Resultados", label: "Resultados" },
  ]);

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

  return (
    <>
      <h1 class="text-3xl">Histórico cargues de archivos</h1>
      <TableEnterprise
        title='Registros de cargues de archivos'
        maxPage={maxPages}
        headers={["Nombre Lotería","Archivo","Nombre Archivo","Estado","Detalle Cargue","Registros cargados","Usuario","Fecha y hora"]}
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
        <Select
          id="searchBySorteo"
          label="Tipo de archivo"
          options={opcionesdisponibles}
          value={datosTrans?.archivo}
          onInput={(e) => {
            setDatosTrans((old) => {
              return {
                ...old,
                archivo: e.target.value,
              };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default HistoricoCargues;