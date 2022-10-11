import { useUrls } from "../../hooks/UrlsHooks";
import { useNavigate, useLocation } from "react-router-dom";

import classes from "./AdminLayout.module.css";
import LogoPDP from "../../components/Base/LogoPDP";
import BarIcon from "../../components/Base/BarIcon";
import UserInfo from "../../components/Compound/UserInfo";
import RightArrow from "../../components/Base/RightArrow";
import { useAuth } from "../../hooks/AuthHooks";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import HNavbar from "../../components/Base/HNavbar";
import Modal from "../../components/Base/Modal";
import Button from "../../components/Base/Button";
import { useImgs } from "../../hooks/ImgsHooks";
import { useWindowSize } from "../../hooks/WindowSizeHooks";
import { Outlet } from "react-router-dom";
import ContentBox from "../../components/Base/SkeletonLoading/ContentBox";
import { searchCierre } from "../../pages/Gestion/utils/fetchCaja";
import { notifyError } from "../../utils/notify";
import ButtonBar from "../../components/Base/ButtonBar";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const AdminLayout = () => {
  const {
    adminLayout,
    headerPDP,
    topHeader,
    usrData,
    saldoCupo,
    comision,
    cargar,
  } = classes;

  const { quotaInfo, roleInfo, signOut, userPermissions, userInfo } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);
  const [infoCaja, setInfoCaja] = useState(false);
  const [cajaState, setCajaState] = useState("");

  const saldoDisponible = useMemo(() => {
    return formatMoney.format(quotaInfo?.quota ?? 0);
  }, [quotaInfo?.quota]);

  const comisionTotal = useMemo(() => {
    return formatMoney.format(quotaInfo?.comision ?? 0);
  }, [quotaInfo?.comision]);

  const nombreComercio = useMemo(
    () => roleInfo?.["nombre comercio"],
    [roleInfo]
  );

  const [clientWidth] = useWindowSize();

  const closeCash = useCallback(() => {
    navigate(`/gestion/arqueo/arqueo-cierre/reporte`);
    setInfoCaja(false);
  }, [navigate]);

  const {
    svgs: { backIcon2 },
  } = useImgs();

  useEffect(() => {
    if (clientWidth > 768) {
      document.body.style.backgroundImage = `url("${backIcon2}")`;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundSize = "cover";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [backIcon2, clientWidth]);

  useEffect(() => {
    const conditions = [
      roleInfo?.tipo_comercio === "OFICINAS PROPIAS",
      roleInfo?.id_usuario !== undefined,
      roleInfo?.id_comercio !== undefined,
      roleInfo?.id_dispositivo !== undefined,
      roleInfo?.direccion !== undefined,
      nombreComercio !== undefined,
      !pathname.startsWith("/gestion/arqueo/arqueo-cierre"),
      userPermissions?.map(({id_permission}) => id_permission).includes(74)
    ];
    if (conditions.every((val) => val)) {
      searchCierre({
        id_usuario: roleInfo?.id_usuario,
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: nombreComercio,
        nombre_usuario: userInfo?.attributes?.name,
        direccion_comercio: roleInfo?.direccion,
      })
        .then((res) => {
          if (res?.obj !== 3 && res?.obj !== 2) {
            setInfoCaja(true);
            setCajaState(res?.obj);
          }
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
          }
          console.error(error?.message);
          notifyError("Busqueda fallida");
        });
    }
  }, [
    pathname,
    roleInfo,
    nombreComercio,
    userPermissions,
    userInfo?.attributes?.name,
  ]);

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
      <main className="container">
        <Suspense fallback={<ContentBox />}>{!infoCaja && <Outlet />}</Suspense>
        <Modal show={infoCaja}>
          {cajaState === 1 ? (
            <div className="items-center text-center">
              <h1>
                Señor usuario, la caja presenta cierre tardío, no se pueden
                realizar transacciones hasta que la cierre.
                <ButtonBar>
                  <Button
                    className="btn mx-auto d-block"
                    type="submit"
                    onClick={() => closeCash()}
                  >
                    Cerrar caja
                  </Button>
                </ButtonBar>
              </h1>
            </div>
          ) : cajaState === 4 ? (
            <h1 className="text-center">
              Señor usuario, la caja ha sido cerrada, no se pueden realizar mas
              transacciones
              <ButtonBar>
                <Button
                  type="submit"
                  onClick={() => {
                    signOut();
                    navigate("/login", { replace: true });
                  }}
                >
                  Cerrar sesión
                </Button>
              </ButtonBar>
            </h1>
          ) : (
            <></>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default AdminLayout;
