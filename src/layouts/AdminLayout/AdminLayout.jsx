import { useUrls } from "../../utils/UrlsHooks";

import classes from "./AdminLayout.module.css";
import LogoPDP from "../../components/Base/LogoPDP/LogoPDP";
import BarIcon from "../../components/Base/BarIcon/BarIcon";
import UserInfo from "../../components/Compound/UserInfo/UserInfo";
import RightArrow from "../../components/Base/RightArrow/RightArrow";
import { useAuth } from "../../utils/AuthHooks";
import { useMemo, useState } from "react";
import HNavbar from "../../components/Base/HNavbar/HNavbar";
import Modal from "../../components/Base/Modal/Modal";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const AdminLayout = ({ children }) => {
  const {
    adminLayout,
    headerPDP,
    topHeader,
    usrData,
    saldoCupo,
    comision,
    cargar,
  } = classes;

  const { quotaInfo } = useAuth();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);

  const saldoDisponible = useMemo(() => {
    return formatMoney.format(quotaInfo?.quota);
  }, [quotaInfo?.quota]);

  const comisionTotal = useMemo(() => {
    return formatMoney.format(quotaInfo?.comision);
  }, [quotaInfo?.comision]);

  return (
    <div className={adminLayout}>
      <header className={headerPDP}>
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
      </header>
      <main className="container">{children}</main>
    </div>
  );
};

export default AdminLayout;
