import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";

const usePermissionTrx = (msg = "") => {
  const { roleInfo } = useAuth();
  const navigate = useNavigate();
  const [statePermissionTrx, setStatePermissionTrx] = useState(true);

  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    } else {
      const keys = [
        "id_comercio",
        "id_usuario",
        "tipo_comercio",
        "id_dispositivo",
        "ciudad",
        "direccion",
        "nombre comercio",
      ];
      for (const key of keys) {
        if (!(key in roleInfo)) {
          setStatePermissionTrx(false);
          break;
        }
      }
    }
  }, [roleInfo, navigate, statePermissionTrx, msg]);
  return statePermissionTrx;
};

export default usePermissionTrx;
