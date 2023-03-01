import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import CargueArchivoRecaudoMultiple from "../components/CargueArchivoRecaudoMultiple";
import MostrarRecaudosPagar from "../components/MostrarRecaudosPagar";
import ConsultarRecaudosMultiples from "../components/ConsultarRecaudosMultiples";

const RecaudoMultiple = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [estadoTrx, setEstadoTrx] = useState(0);
  const [fileName, setFileName] = useState("");
  const [uuid, setUuid] = useState("");
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    }
  }, []);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>Recaudo Múltiple</h1>
      {estadoTrx === 0 ? (
        <CargueArchivoRecaudoMultiple
          setIsUploading={setIsUploading}
          setEstadoTrx={setEstadoTrx}
          roleInfo={roleInfo}
          setFileName={setFileName}
          pdpUser={pdpUser}
        />
      ) : estadoTrx === 1 ? (
        <MostrarRecaudosPagar
          setIsUploading={setIsUploading}
          setEstadoTrx={setEstadoTrx}
          roleInfo={roleInfo}
          fileName={fileName}
          pdpUser={pdpUser}
          setUuid={setUuid}
        />
      ) : estadoTrx === 2 ? (
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          <h1 className='text-2xl text-center mb-5'>
            {`El código del proceso es:`}
          </h1>
          <h1 className='text-2xl text-center mb-5 font-semibold'>
            {`${uuid}`}
          </h1>
          <ConsultarRecaudosMultiples
            uuid={uuid}
            roleInfo={roleInfo}
            pdpUser={pdpUser}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default RecaudoMultiple;
