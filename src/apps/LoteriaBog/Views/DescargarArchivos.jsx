import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import { useLoteria } from "../utils/LoteriaHooks";

const DescargarArchivos = () => {
  const [downloadRef, setDownloadRef] = useState("");

  const { getReportesVentas } = useLoteria();

  useEffect(() => {
    getReportesVentas("2613").then((res) => {
      setDownloadRef(res);
    });
  }, [getReportesVentas]);

  return (
    <div>
      <ButtonBar>
        <Button>
          <a
            href={downloadRef}
            download={`Reporte_ventas-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.txt`}
            target="_blank"
            rel="noreferrer"
          >
            Descargar archivo
          </a>
        </Button>
      </ButtonBar>
    </div>
  );
};

export default DescargarArchivos;
