import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import CargueArchivoRecaudoMultiple from "../components/CargueArchivoRecaudoMultiple";
import MostrarRecaudosPagar from "../components/MostrarRecaudosPagar";

const RecaudoMultiple = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [estadoTrx, setEstadoTrx] = useState(0);
  const [fileName, setFileName] = useState("");
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    }
  }, []);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>Recaudo multiple</h1>
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
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default RecaudoMultiple;
