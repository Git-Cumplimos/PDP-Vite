import { Fragment, useCallback, useEffect, useState } from "react";
import useFetchDispatchDebounce,{ErrorPDPFetch} from "../../../hooks/useFetchDispatchDebounce";
import { useAuth } from "../../../hooks/AuthHooks";
// import useMap from "../../../hooks/useMap";
// import Modal from "../../../components/Base/Modal";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
// import DataTable from "../../../components/Base/DataTable";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import { notify, notifyError, notifyPending } from "../../../utils/notify";
// import { onChangeNumber } from "../../../utils/functions";

// const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;
const url = "http://127.0.0.1:5000";

const ReporteComercios = () => {
  const { roleInfo } = useAuth();
  
  const [downloadReport] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      notify(data?.msg)
      window.open(data?.obj?.url, "_self")
    }, []),
    onError: useCallback((error) => {
      if (error instanceof ErrorPDPFetch) {
        notifyError(error.message);
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  });
  
  const getReportCsv = 
    useCallback(async (e) =>{
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const timebody = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
      );
      const body = {
        ...timebody,
        id_comercio : roleInfo?.id_comercio
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      };
      downloadReport(`${url}/download-report-commerce`, options)

    },[roleInfo,downloadReport])

  return (
    <Fragment>
      <h1 className="text-3xl ">Reportes comercio</h1>
      <Form onSubmit={getReportCsv}>
        <Input
          type="tel"
          autoComplete="off"
          name={"comercio"}
          label={"Comercio"}
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
          <Button
            type='submit'
            onClick={() => {
              // setShowModal(true);
              // setSelectedOpt("operacion");
            }}>
            Generar reporte
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default ReporteComercios