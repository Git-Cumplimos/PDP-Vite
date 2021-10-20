import { useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../../utils/AuthHooks";
import RightArrow from "../../Base/RightArrow/RightArrow";
import classes from "./LoginForm.module.css";

const LoginForm = () => {
  const { contain, card, field } = classes;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");

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

  const handleCognito = (event) => {
    event.preventDefault();

    auth
      .signIn(username, password)
      .then(() => {
        console.log("user exist");
      })
      .catch((err) => {
        if (err.code === "NotAuthorizedException") {
          notifyError("Usuario o contraseña incorrectos.");
        } else {
          notifyError(err.message);
        }
        console.error(err);
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
          console.error(err);
        }
      });
  };

  return auth.cognitoUser ? (
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
          <label htmlFor="password">Contaseña:</label>
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
