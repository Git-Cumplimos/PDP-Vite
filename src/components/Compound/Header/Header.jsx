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
import fetchData from "../../../utils/fetchData";

const url = "http://logconsulta.us-east-2.elasticbeanstalk.com/cupo";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const Header = () => {
  const { isSignedIn, roleInfo } = useAuth();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);
  const [saldoDisponible, setSaldoDisponible] = useState();

  useEffect(() => {
    if (roleInfo) {
      fetchData(
        url,
        "GET",
        {
          id_comercio: roleInfo.id_comercio,
          id_dispositivo: roleInfo.id_dispositivo,
        },
        {}
      )
        .then((res) => {
          setSaldoDisponible(formatMoney.format(res["Cupo Disponible"]));
        })
        .catch((err) => console.error(err));
    }
  });

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
