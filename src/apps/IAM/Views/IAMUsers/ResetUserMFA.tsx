import React, { Fragment, useCallback, useMemo, useState } from "react";
import Fieldset from "../../../../components/Base/Fieldset";
import ToggleInput from "../../../../components/Base/ToggleInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Button from "../../../../components/Base/Button";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { useNavigate } from "react-router-dom";

import { PermissionsIAM } from "../../permissions";
import { useAuth } from "../../../../hooks/AuthHooks";

type Props = {
  userInfo: {
    id: number;
    email: string;
    nombre: string;
  };
};

const url = process.env.REACT_APP_URL_IAM_PDP;
// const url = `http://localhost:5000`;

const ResetUserMFA = ({ userInfo }: Props) => {
  const navigate = useNavigate();
  const { userPermissions } = useAuth();

  const [allowResetUser, setAllowResetUser] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const listaPermisos = useMemo(
    () =>
      userPermissions
        .map(({ id_permission }) => id_permission)
        .filter((id_permission) => id_permission === PermissionsIAM.reset_mfa),
    [userPermissions]
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setAllowResetUser(false);
  }, []);

  const [resetUser, loadingResetUser] = useFetchDebounce(
    {
      url: `${url}/user-reset`,
      options: useMemo(
        () => ({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userInfo.email }),
        }),
        [userInfo.email]
      ),
      autoDispatch: false,
    },
    {
      onPending: useCallback(
        () => "Recuperando QR y contraseña de usuario",
        []
      ),
      onSuccess: useCallback(
        (_res) => {
          handleClose();
          navigate("/iam/users");
          return "Reinicio satisfactorio";
        },
        [handleClose, navigate]
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          return error.message;
        } else if (error?.cause === "not-ok") {
          return error.message;
        } else {
          console.error(error);
          return "Error reiniciando el usuario";
        }
      }, []),
    },
    { notify: true }
  );

  if (!listaPermisos.length) {
    return <Fragment />;
  }

  return (
    <Fragment>
      <Fieldset
        legend={"Recuperar QR y contraseña usuario (Danger zone)"}
        className={"lg:col-span-2"}
      >
        <ToggleInput
          id={`is_comercio_padre_edit`}
          name={`is_comercio_padre`}
          label={"Permitir reset de usuario"}
          checked={allowResetUser}
          onChange={() => setAllowResetUser((old) => !old)}
          title={"Activar / desactivar permiso reset OTP y contraseña usuario"}
        />
        <ButtonBar>
          <Button
            type="button"
            design="danger"
            disabled={!allowResetUser}
            onClick={() => setShowModal(true)}
          >
            Recuperar QR y contraseña usuario
          </Button>
        </ButtonBar>
      </Fieldset>
      <Modal show={showModal} handleClose={handleClose}>
        <PaymentSummary
          title="¿Está seguro de recuperar QR y contraseña del usuario?"
          subtitle="Informacion de usuario"
          summaryTrx={{
            "Id de usuario": userInfo.id,
            Correo: userInfo.email,
            "Nombre usuario": userInfo.nombre,
          }}
        >
          <ButtonBar>
            <Button
              type="button"
              design="danger"
              onClick={resetUser}
              disabled={loadingResetUser}
            >
              Aceptar
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              disabled={loadingResetUser}
            >
              Cancelar
            </Button>
          </ButtonBar>
        </PaymentSummary>
      </Modal>
    </Fragment>
  );
};

export default ResetUserMFA;
