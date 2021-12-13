import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/AuthHooks";
import { useUrls } from "../../../utils/UrlsHooks";
import BarIcon from "../../Base/BarIcon/BarIcon";
import LogoPDP from "../../Base/LogoPDP/LogoPDP";
import RightArrow from "../../Base/RightArrow/RightArrow";
import UserInfo from "../UserInfo/UserInfo";
import HNavbar from "../../Base/HNavbar/HNavbar";
import classes from "./Header.module.css";
import Modal from "../../Base/Modal/Modal";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const Header = () => {
  const { isSignedIn, quotaInfo } = useAuth();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);
  const [saldoDisponible, setSaldoDisponible] = useState();
  const [comisionTotal, setComisionTotal]= useState();

  useEffect(() => {
    if (quotaInfo?.comision && quotaInfo?.quota) {
      setSaldoDisponible(formatMoney.format(quotaInfo?.quota));
      setComisionTotal(formatMoney.format(quotaInfo?.comision))
    }
  }, [quotaInfo?.comision, quotaInfo?.quota]);

  const { headerPDP, saldoCupo, comision, cargar, usrData, topHeader } =
    classes;
  return (
    <header className={headerPDP}>
      {!isSignedIn ? (
        /* !cognitoUser */ true ? (
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
              <div className={saldoCupo}>
                Saldo cupo {saldoDisponible || "$0.00"}
              </div>
              <div className={comision}>Comisión {comisionTotal || "$0.00"}</div>
              <button className={cargar} onClick={() => setShowModal(true)}>
                Carga tu billetera
              </button>
            </div>
          </div>
          <HNavbar links={urls} isText />
          <Modal show={showModal} handleClose={() => setShowModal(false)}>
            <div>
              <h1>Carga tu billetera</h1>
            </div>
          </Modal>
        </>
      )}
    </header>
  );
};

export default Header;
