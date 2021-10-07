import { useState } from "react";
import { useAuth } from "../../../utils/AuthHooks";
import { useUrls } from "../../../utils/UrlsHooks";
import BarIcon from "../../Base/BarIcon/BarIcon";
import LogoPDP from "../../Base/LogoPDP/LogoPDP";
import RightArrow from "../../Base/RightArrow/RightArrow";
import UserInfo from "../UserInfo/UserInfo";
import HNavbar from "../../Base/HNavbar/HNavbar";
import classes from "./Header.module.css";
import Modal from "../../Base/Modal/Modal";

const Header = () => {
  const auth = useAuth();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);

  const { headerPDP, saldoCupo, comision, cargar, usrData, topHeader } =
    classes;
  return (
    <header className={headerPDP}>
      {!auth.isSignedIn ? (
        /* !auth.cognitoUser */ true ? (
          <>
            <div className={usrData}>
              <LogoPDP large />
              <RightArrow large />
            </div>
            <h1 className="text-3xl mb-6">¡Bienvenido!</h1>
          </>
        ) : (
          <div className={usrData}>
            <LogoPDP small />
            <BarIcon />
            <UserInfo />
            <RightArrow small />
          </div>
        )
      ) : (
        <>
          <div className={topHeader}>
            <div className={usrData}>
              <LogoPDP xsmall />
              <BarIcon />
              <UserInfo />
              <RightArrow small />
            </div>
            <div className={usrData}>
              <div className={saldoCupo}>Saldo cupo $1.000.000</div>
              <div className={comision}>Comisión $200.000</div>
              <button className={cargar} onClick={() => setShowModal(true)}>
                Carga tu billetera
              </button>
            </div>
          </div>
          <HNavbar links={urls} isText />
          <Modal show={showModal} handleClose={() => setShowModal(false)}>
            <div>
              <h1>Hola</h1>
              <button>El modal</button>
            </div>
          </Modal>
        </>
      )}
    </header>
  );
};

export default Header;
