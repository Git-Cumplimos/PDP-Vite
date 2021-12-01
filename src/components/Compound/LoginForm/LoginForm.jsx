import { useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../../utils/AuthHooks";
import RightArrow from "../../Base/RightArrow/RightArrow";
import classes from "./LoginForm.module.css";
import QRCode from "qrcode.react";

const LoginForm = () => {
  const { contain, card, field } = classes;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cell, setCell] = useState("");
  const [totp, setTotp] = useState("");
  const [names, setNames] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const auth = useAuth();

  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notify = (msg) => {
    toast(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleCognito = (event) => {
    event.preventDefault();

    auth
      .signIn(username, password)
      .then(() => {})

      .catch((err) => {
        if (err.code === "NotAuthorizedException") {
          notifyError("Usuario o contraseña incorrectos.");
        } else {
          notifyError(err.message);
        }
      });
  };

  const handleTOTP = (event) => {
    event.preventDefault();
    auth
      .confirmSignIn(totp)
      .then()
      .catch((err) => {
        if (err.code === "CodeMismatchException") {
          notifyError("Codigo TOTP invalido");
        } else if (err.code === "NotAuthorizedException") {
          notifyError("La sesion ha expirado");
        } else {
          notifyError(err.message);
        }
      });
  };

  const handleChangePW = (event) => {
    event.preventDefault();
    if (newPass === confirmPass) {
      auth
        .handleChangePass(
          names,
          lastName,
          auth.cognitoUser,
          address,
          city,
          newPass
        )
        .then()
        .catch((err) => {
          if (err.code === "NotAuthorizedException") {
            notifyError("La sesion ha expirado");
          } else if (err.code === "InvalidPasswordException") {
            notifyError(
              <h6>
                Politica de contraseñas:
                <br />
                1. Debe contener minimo 8 carácteres
                <br />
                2. Contiene al menos una cáracter especial
                <br />
                Contiene al menos una letra mayúscula
                <br />
                4. Contiene al menos una letra minúscula
              </h6>
            );
          } else if (err.code === "InvalidParameterException") {
            notifyError("Complete los campos");
          } else {
            notifyError("Por favor valide todos los campos");
          }
        });
    } else {
      notifyError("Las contraseñas no coinciden");
    }
  };

  const handleChangeExisting = (event) => {
    event.preventDefault();
    if (newPass === confirmPass) {
      auth
        .handleChangePass(
          auth.parameters.name,
          auth.parameters.family_name,
          auth.cognitoUser,
          auth.parameters.address,
          auth.parameters.locale,
          newPass
        )
        .then()
        .catch((err) => {
          if (err.code === "NotAuthorizedException") {
            notifyError("La sesion ha expirado");
          } else if (err.code === "InvalidPasswordException") {
            notifyError(
              <h6>
                Politica de contraseñas:
                <br />
                1. Debe contener minimo 8 carácteres
                <br />
                2. Contiene al menos una cáracter especial
                <br />
                Contiene al menos una letra mayúscula
                <br />
                4. Contiene al menos una letra minúscula
              </h6>
            );
          } else if (err.code === "InvalidParameterException") {
            notifyError("Complete los campos");
          } else {
            notifyError("Por favor valide todos los campos");
          }
        });
    } else {
      notifyError("Las contraseñas no coinciden");
    }
  };

  const handleTOTPconfirm = (event) => {
    event.preventDefault();

    auth
      .handleverifyTotpToken(totp)
      .then()
      .catch((err) => {
        if (err.code === "EnableSoftwareTokenMFAException") {
          notifyError(
            "Ha ingresado un código antiguo, escanee el QR e intente de nuevo"
          );
        } else {
          if (auth.timer) {
            clearTimeout(auth.timer);
          }
          notify("Token y contraseña reestablecidos correctamente");
        }
      });

    setNames("");
    setLastName("");
    setTotp("");
    setCell("");
    setNewPass("");
  };

  return auth.cognitoUser?.challengeName === "SOFTWARE_TOKEN_MFA" ? (
    <>
      <div className="container flex flex-row justify-center items-center">
        <RightArrow xlarge />
        <div className={card}>
          <h1 className="uppercase text-2xl font-medium text-center">
            Validación usuario
          </h1>
          <hr />
          <form onSubmit={handleTOTP}>
            <div className={field}>
              <label htmlFor="id">Código de seguridad:</label>
              <input
                id="totp"
                type="text"
                maxLength="6"
                autoFocus
                autoComplete="off"
                value={totp}
                onChange={(e) => {
                  setTotp(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <button type="submit">Validar codigo</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : auth.cognitoUser?.challengeName === "NEW_PASSWORD_REQUIRED" ? (
    auth.parameters.name !== "" ? (
      <>
        <div className="container flex flex-row justify-center items-center">
          <RightArrow xlarge />
          <div className={card}>
            <h1 className="uppercase text-2xl font-medium text-center">
              Cambio de contraseña nuevo usuario
            </h1>
            <hr />
            <form onSubmit={handleChangeExisting}>
              <div className={field}>
                <label htmlFor="id">Nueva contraseña:</label>
                <input
                  id="totp"
                  type="password"
                  autoComplete="off"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Confirmar contraseña:</label>
                <input
                  id="totp"
                  type="password"
                  autoComplete="off"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <button type="submit">Actualizar contraseña</button>
              </div>
            </form>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="container flex flex-row justify-center items-center">
          <RightArrow xlarge />
          <div className={card}>
            <h1 className="uppercase text-2xl font-medium text-center">
              Cambio de contraseña nuevo usuario
            </h1>
            <hr />
            <form onSubmit={handleChangePW}>
              <div className={field}>
                <label htmlFor="id">Nombres:</label>
                <input
                  id="names"
                  type="text"
                  maxLength="255"
                  autoFocus
                  autoComplete="off"
                  value={names}
                  onChange={(e) => {
                    setNames(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Apellidos:</label>
                <input
                  id="lastName"
                  type="text"
                  maxLength="255"
                  autoComplete="off"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Direccion:</label>
                <input
                  id="address"
                  type="text"
                  maxLength="255"
                  autoComplete="off"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Ciudad:</label>
                <input
                  id="ciudad"
                  type="text"
                  maxLength="255"
                  autoComplete="off"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Nueva contraseña:</label>
                <input
                  id="totp"
                  type="password"
                  autoComplete="off"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="id">Confirmar contraseña:</label>
                <input
                  id="totp"
                  type="password"
                  autoComplete="off"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <button type="submit">Actualizar contraseña</button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  ) : auth.cognitoUser?.challengeName === "MFA_SETUP" ? (
    <>
      <div className="container flex flex-row justify-center items-center">
        <RightArrow xlarge />
        <div className={card}>
          <h1 className="uppercase text-2xl font-medium text-center">
            TOKEN DE SEGURIDAD
          </h1>
          <hr />
          <form onSubmit={handleTOTPconfirm}>
            <h2>Escanee el siguiente código QR con Google Authenticator</h2>
            <div className={field}>
              <QRCode value={auth.qr}></QRCode>
            </div>
            <div className={field}>
              <label htmlFor="id">Validar Token:</label>
              <input
                id="lastName"
                type="text"
                maxLength="255"
                autoFocus
                autoComplete="off"
                value={totp}
                onChange={(e) => {
                  setTotp(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <button type="submit">Finalizar</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : (
    <div className={contain}>
      <form onSubmit={handleCognito}>
        <div className={field}>
          <label htmlFor="email">Usuario:</label>
          <input
            id="email"
            type="email"
            value={username}
            // autoFocus
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </div>
        <div className={field}>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <div className={field}>
          <button type="submit">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
