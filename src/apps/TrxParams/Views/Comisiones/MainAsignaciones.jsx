import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { reportGenerationGeneralComisions } from "../../utils/fetchGeneracionReportesComisiones";
import { notify, notifyError } from "../../../../utils/notify";

const MainAsignaciones = () => {
  const [{ id_comision_pagada }] = useQuery();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const generateReport = () => {
    setIsUploading(true);
    reportGenerationGeneralComisions({ type: "ComisionesPagar" })
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
      .catch((err) => console.error(err));
  };
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      {!id_comision_pagada ? (
        <Fragment>
          <ButtonBar>
            <Button onClick={() => navigate("crear")} type='submit'>
              Crear asignación de comisión
            </Button>
            {/* <Button onClick={generateReport}>
              Generar reporte de comisiones
            </Button> */}
          </ButtonBar>
          <SearchComissions comissionFace='assigns' />
        </Fragment>
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default MainAsignaciones;
