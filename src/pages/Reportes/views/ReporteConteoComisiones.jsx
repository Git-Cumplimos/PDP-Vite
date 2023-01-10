import { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../utils/notify";
import {
  postObtenerReporteConteoComisionesAplicadas,
  postObtenerReporteHistoricoConteoComisionesAplicadas,
} from "../utils/fetchReportesComisiones";

const ReporteConteoComisiones = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState({
    date_ini: "",
    date_end: "",
    // .replace("/", "-"),
  });
  const onSubmitReporteComisionHistoricaConteo = useCallback(
    (ev) => {
      ev.preventDefault();
      if (new Date(report["date_end"]) > new Date()) {
        notifyError("La fecha final no puede ser mayor al dia de hoy");
        return;
      }

      if (report["date_end"] !== "") {
        if (report["date_ini"] !== "") {
          if (new Date(report["date_end"]) <= new Date(report["date_ini"])) {
            notifyError("La fecha final debe ser mayor a la inicial");
            return;
          }
        } else {
          notifyError("Debe existir una fecha inicial");
          return;
        }
      } else {
        notifyError("Debe existir una fecha inicial");
        return;
      }
      let obj = {
        pk_reporte: "RepoCom12",
      };
      if (report["date_ini"] !== "") {
        obj["date_ini"] = report["date_ini"];
      }
      if (report["date_end"] !== "") {
        obj["date_end"] = report["date_end"];
      }
      setIsUploading(true);
      postObtenerReporteHistoricoConteoComisionesAplicadas(obj)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            window.open(res?.obj?.url);
            setIsUploading(false);
          } else {
            notifyError(res?.msg);
            setIsUploading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          notifyError("No se pudo conectar al servidor");
          setIsUploading(false);
        });
    },
    [report]
  );
  const onSubmitReporteComisionConteo = useCallback((ev) => {
    ev.preventDefault();
    let obj = {
      pk_reporte: "RepoCom12",
    };
    setIsUploading(true);
    postObtenerReporteConteoComisionesAplicadas(obj)
      .then((res) => {
        if (res?.status) {
          notify(res?.msg);
          window.open(res?.obj?.url);
          setIsUploading(false);
        } else {
          notifyError(res?.msg);
          setIsUploading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        notifyError("No se pudo conectar al servidor");
        setIsUploading(false);
      });
  }, []);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>Reporte conteo aplicación comisiones:</h1>
      <Form onSubmit={onSubmitReporteComisionConteo} grid>
        <Fieldset
          legend={"Reporte actual conteo aplicaciones comisión"}
          className='lg:col-span-2'>
          <ButtonBar>
            <Button type='submit'>Generar reporte</Button>
          </ButtonBar>
        </Fieldset>
      </Form>
      <Form onSubmit={onSubmitReporteComisionHistoricaConteo} grid>
        <Fieldset
          legend={"Reporte historico conteo aplicaciones comisión"}
          className='lg:col-span-2'>
          <Input
            id='date_ini'
            name='date_ini'
            label={"Fecha inicio"}
            type='datetime-local'
            autoComplete='off'
            value={report?.["date_ini"]}
            onChange={(e) => {
              setReport((old) => {
                return { ...old, date_ini: e.target.value };
              });
            }}
            required
          />
          <Input
            id='date_end'
            name='date_end'
            label={"Fecha fin"}
            type='datetime-local'
            autoComplete='off'
            value={report?.["date_end"]}
            onChange={(e) => {
              setReport((old) => {
                return { ...old, date_end: e.target.value };
              });
            }}
            required
          />
          <ButtonBar className='lg:col-span-2'>
            <Button type='submit'>Generar reporte</Button>
          </ButtonBar>
        </Fieldset>
      </Form>
    </>
  );
};

export default ReporteConteoComisiones;
