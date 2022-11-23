import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";
import { reportGenerationGeneralComisions } from "../../utils/fetchGeneracionReportesComisiones";

const Com2Collect = () => {
  const [{ id_comision_cobrada }] = useQuery();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const generateReport = () => {
    setIsUploading(true);
    reportGenerationGeneralComisions({ type: "ComisionesCobrar" })
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
      {!id_comision_cobrada ? (
        <Fragment>
          <ButtonBar>
            <Button onClick={() => navigate("crear")}>Crear comision</Button>
            <Button onClick={generateReport}>
              Generar reporte de comisiones
            </Button>
          </ButtonBar>
          <SearchComissions comissionFace='collect' />
        </Fragment>
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Collect;
