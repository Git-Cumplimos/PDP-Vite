import { useState } from "react";

import { useAuth } from "../../../hooks/AuthHooks";
import RightArrow from "../../Base/RightArrow/RightArrow";
import classes from "./LoginForm.module.css";
import QRCode from "qrcode.react";
import { notify, notifyError, notifyPending } from "../../../utils/notify";

const LoginForm = () => {
  const { contain, card, field } = classes;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setCell] = useState("");
  const [totp, setTotp] = useState("");
  const [names, setNames] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [forgotPass, setForgotPass] = useState(false);
  const [forgotPassSubmit, setForgotPassSubmit] = useState(false);
  const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);

  const auth = useAuth();

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
          setPassword("");
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
  const handleForgotPassword = (event) => {
    event.preventDefault();
    auth
      .validateUser(username)
      .then((res) => {
        notify("Validando usuario en base de datos");
        setDisabled(true);
        if (res?.Status === true) {
          notify(
            "Recibira un correo con un número de 6 dígitos que deberá ingresar en el campo 'CÓDIGO'"
          );
          setDisabled(false);
          setPassword("");
          setForgotPass(false);
          setForgotPassSubmit(true);
          auth
            .forgotPassword(username)
            .then()
            .catch(() => {});
        } else {
          notifyError("El usuario no existe");
          setDisabled(false);
        }
      })
      .catch((err) => {});
  };

  const handleForgotPasswordSubmit = (event) => {
    event.preventDefault();
    if (newPass === confirmPass) {
      auth
        .forgotPasswordSubmit(username, code, confirmPass)
        .then((res) => {
          notify("Contraseña modificada correctamente");
          setNewPass("");
          setConfirmPass("");
          setForgotPassSubmit(false);
        })
        .catch((err) => {
          if (err.code === "CodeMismatchException") {
            notifyError("El código proporcionado no es valido");
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
        console.log(err);
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
              <label htmlFor="totp">Código de seguridad:</label>
              <input
                id="totp"
                type="text"
                maxLength="6"
                autoFocus
                autoComplete="off"
                value={totp}
                onChange={(e) => {
                  if (!isNaN(e.target.value)) {
                    setTotp(e.target.value);
                  }
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
                <label htmlFor="newPassword">Nueva contraseña:</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="off"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="confirmNewPassword">
                  Confirmar contraseña:
                </label>
                <input
                  id="confirmNewPassword"
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
                <label htmlFor="names">Nombres:</label>
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
                <label htmlFor="lastName">Apellidos:</label>
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
                <label htmlFor="address">Direccion:</label>
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
                <label htmlFor="ciudad">Ciudad:</label>
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
                <label htmlFor="newPassword">Nueva contraseña:</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="off"
                  value={newPass}
                  onChange={(e) => {
                    setNewPass(e.target.value);
                  }}
                />
              </div>
              <div className={field}>
                <label htmlFor="confirmNewPassword">
                  Confirmar contraseña:
                </label>
                <input
                  id="confirmNewPassword"
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
              <label htmlFor="validateToken">Validar Token:</label>
              <input
                required
                id="validateToken"
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
  ) : forgotPassSubmit ? (
    <>
      <div className="container flex flex-row justify-center items-center">
        <RightArrow xlarge />
        <div className={card}>
          <h1 className="uppercase text-2xl font-medium text-center">
            Modificación de contraseña
          </h1>
          <hr />
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className={field}>
              <label htmlFor="names">Correo:</label>
              <input
                id="email"
                type="email"
                autoFocus
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <label htmlFor="names">Código:</label>
              <input
                id="email"
                type="text"
                autoFocus
                maxLength="6"
                autoComplete="off"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <label htmlFor="names">Contraseña:</label>
              <input
                id="newpass"
                type="password"
                autoFocus
                autoComplete="off"
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <label htmlFor="names">Confirmar contraseña:</label>
              <input
                id="confirmpass"
                type="password"
                autoFocus
                autoComplete="off"
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <button type="submit">Modificar contraseña</button>
            </div>
          </form>
        </div>
      </div>
    </>
  ) : forgotPass ? (
    <>
      <div className="container flex flex-row justify-center items-center">
        <RightArrow xlarge />
        <div className={card}>
          <h1 className="uppercase text-2xl font-medium text-center">
            ¿Olvido su contraseña?
          </h1>
          <hr />
          <form onSubmit={handleForgotPassword}>
            <div className={field}>
              <label htmlFor="names">Correo:</label>
              <input
                id="email"
                type="email"
                autoFocus
                autoComplete="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className={field}>
              <button type="submit" disabled={disabled}>
                Solicitar código
              </button>
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
            id="password"
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
        <div className={field}>
          <button
            type="button"
            onClick={() => {
              setForgotPass(true);
            }}
          >
            ¿Olvido contraseña?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
