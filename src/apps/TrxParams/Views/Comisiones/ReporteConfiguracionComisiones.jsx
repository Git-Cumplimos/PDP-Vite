import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import {
  reporteConfiguracionComision,
  reportGenerationGeneralComisions,
} from "../../utils/fetchGeneracionReportesComisiones";
import { notify, notifyError } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchAsignacionesComisiones } from "../../utils/fetchAssignComission";

const ReporteConfiguracionComisiones = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const generateReport = () => {
    setIsUploading(true);
    reporteConfiguracionComision({ pk_reporte: "RepoCom12" })
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
        notifyError(err);
        setIsUploading(false);
        console.error(err);
      });
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        Reporte de configuración de comisiones
      </h1>
      <ButtonBar>
        <Button onClick={generateReport} type='submit'>
          Generar reporte de comisiones
        </Button>
      </ButtonBar>
    </>
  );
};

export default ReporteConfiguracionComisiones;
