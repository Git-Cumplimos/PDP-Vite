import { Fragment, useCallback, useState } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import { notifyPending } from "../../../utils/notify";

import { downloadReport } from "../utils/fetchReportesComisiones";

const ReporteComercios = () => {
  const [disableBtn, setDisableBtn] = useState(false)

  const { roleInfo } = useAuth();
  
  const getReportCsv = 
    useCallback(async (e) =>{
      e.preventDefault();
      setDisableBtn(true);
      const formData = new FormData(e.currentTarget);
      const timebody = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
      );
      const body = {
        ...timebody,
        id_comercio : roleInfo?.id_comercio
      }
      notifyPending(
        downloadReport(body),
        {
          render() { return "Procesando" },
        },
        {
          render({ data: res }) {
            window.open(res?.obj?.url, "_self")
            setDisableBtn(false)
            return res?.msg !== "" ? res?.msg : "Archivo generado exitosamente";
          },
        },
        {
          render({ data: err }) {
            console.error(err)
            setDisableBtn(false)
            return err !== "" ? err : "Error en la generacion del archivo";
          },
        }
      );
    },[roleInfo])

  return (
    <Fragment>
      <h1 className="text-3xl ">Reportes transacciones por comercio</h1>
      <Form onSubmit={getReportCsv}>
        <Input
          type="tel"
          autoComplete="off"
          name={"id_comercio"}
          label={"Id comercio"}
          value={roleInfo?.id_comercio ?? ""}
          disabled
        />
        <Input
          type="date"
          autoComplete="off"
          name={"fecha"}
          label={"Fecha"}
          required
        />
        <ButtonBar>
          <Button type='submit' disabled={disableBtn}>
            Generar reporte
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default ReporteComercios