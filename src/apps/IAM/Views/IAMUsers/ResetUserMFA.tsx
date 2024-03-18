import React, { Fragment, useCallback, useMemo, useState } from "react";
import Fieldset from "../../../../components/Base/Fieldset";
import ToggleInput from "../../../../components/Base/ToggleInput";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Button from "../../../../components/Base/Button";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import { useNavigate } from "react-router-dom";

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
  const [allowResetUser, setAllowResetUser] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ email: userInfo.email }),
        }),
        [userInfo.email]
      ),
      autoDispatch: false,
    },
    {
      onPending: useCallback(
        () => "Reiniciando OTP y contraseña de usuario",
        []
      ),
      onSuccess: useCallback((res) => {
        // const commerce = res?.obj;
        handleClose();
        navigate("/iam/users");
        return "Reinicio satisfactorio";
      }, [handleClose, navigate]),
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

  return (
    <Fragment>
      <Fieldset
        legend={"Reset OTP y contraseña usuario (Danger zone)"}
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
          <button
            className={`px-4 py-2 bg-red-600 text-white rounded-full transition-opacity duration-300 ${
              !allowResetUser && "opacity-40 cursor-default"
            }`}
            type="button"
            disabled={!allowResetUser}
            onClick={() => setShowModal(true)}
          >
            Reset OTP y contraseña usuario
          </button>
        </ButtonBar>
      </Fieldset>
      <Modal show={showModal} handleClose={handleClose}>
        <PaymentSummary
          title="¿Está seguro de realizar el reinicio del usuario?"
          subtitle="Informacion de usuario"
          summaryTrx={{
            "Id de usuario": userInfo.id,
            Correo: userInfo.email,
            "Nombre usuario": userInfo.nombre,
          }}
        >
          <ButtonBar>
            <button
              type="button"
              className={`px-4 py-2 bg-red-600 text-white rounded-full transition-opacity duration-300 ${
                loadingResetUser && "opacity-40 cursor-default"
              } m-4`}
              onClick={resetUser}
              disabled={loadingResetUser}
            >
              Aceptar
            </button>
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
