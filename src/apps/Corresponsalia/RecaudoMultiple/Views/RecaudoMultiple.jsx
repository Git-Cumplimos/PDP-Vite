import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../../components/Base/SimpleLoading/SimpleLoading";
import CargueArchivoRecaudoMultiple from "../components/CargueArchivoRecaudoMultiple";

const RecaudoMultiple = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [estadoTrx, setEstadoTrx] = useState(0);
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    }
  }, []);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl text-center mb-10 mt-5">Recaudo multiple</h1>
      {estadoTrx === 0 ? (
        <CargueArchivoRecaudoMultiple
          setIsUploading={setIsUploading}
          setEstadoTrx={setEstadoTrx}
          roleInfo={roleInfo}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default RecaudoMultiple;
