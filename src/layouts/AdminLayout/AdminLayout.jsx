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
import ModalAlert from "./ModalAlert";

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
    diasSobregiro,
    diasSobregiroD,
    cargar,
  } = classes;
  const urlAssets = process.env.REACT_APP_ASSETS_URL;

  const { quotaInfo, roleInfo, signOut, userPermissions, userInfo } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { urlsPrivate: urls } = useUrls();

  const [showModal, setShowModal] = useState(false);
  const [showModalPublicidad, setShowModalPublicidad] = useState(true);
  const [cajaState, setCajaState] = useState("");

  const saldoDisponible = useMemo(() => {
    return formatMoney.format(quotaInfo?.quota ?? 0);
  }, [quotaInfo?.quota]);

  const comisionTotal = useMemo(() => {
    return formatMoney.format(quotaInfo?.comision ?? 0);
  }, [quotaInfo?.comision]);

  const sobregiro = useMemo(() => {
    return quotaInfo?.sobregiro ?? 0;
  }, [quotaInfo?.sobregiro]);

  const nombreComercio = useMemo(
    () => roleInfo?.["nombre comercio"],
    [roleInfo]
  );

  const [clientWidth] = useWindowSize();

  const closeCash = useCallback(() => {
    navigate(`/gestion/arqueo/arqueo-cierre/reporte`);
  }, [navigate]);
  const navigateCommission = useCallback(() => {
    navigate(`/billetera-comisiones`);
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
      roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO",
      roleInfo?.id_usuario !== undefined,
      roleInfo?.id_comercio !== undefined,
      roleInfo?.id_dispositivo !== undefined,
      roleInfo?.direccion !== undefined,
      nombreComercio !== undefined,
      userPermissions?.map(({ id_permission }) => id_permission).includes(6101),
      // false,
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
          setCajaState(res?.obj);
          // if (res?.obj !== 3 && res?.obj !== 2) {
          // }
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
          }
          console.error(error?.message);
          // notifyError("Busqueda fallida");
        });
    }
  }, [
    pathname,
    roleInfo,
    nombreComercio,
    userPermissions,
    userInfo?.attributes?.name,
  ]);

  const infoCaja = useMemo(() => {
    return (
      (cajaState === 1 &&
        !pathname.startsWith("/gestion/arqueo/arqueo-cierre")) ||
      cajaState === 4
    );
  }, [cajaState, pathname]);

  const handleClose = useCallback(() => {
    setShowModalPublicidad(false);
  }, []);

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
              Cupo disponible {saldoDisponible || "$0.00"}
            </div>
          </div>
          <div className={usrData}>
            <div className={diasSobregiro}>
              Dias sobregiro {sobregiro || "0"}
            </div>
          </div>
          <div className={usrData}>
            <div className={comision} onClick={navigateCommission}>
              Comisiones {comisionTotal || "$0.00"}
            </div>
          </div>
        </div>
        <ModalAlert/>
        <HNavbar links={urls} isText />
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
                    navigate("/", { replace: true });
                    signOut();
                  }}
                >
                  Cerrar sesión
                </Button>
              </ButtonBar>
            </h1>
          ) : (
            ""
          )}
        </Modal>
        <Modal show={showModalPublicidad} handleClose={handleClose}>
          <img
            src={`${urlAssets}/assets/svg/recaudo/MODAL_PUBLICIDAD/MODAL_PUBLICIDAD.jpg`}
            alt="Proximamente Corresponsal Colpatria"
          ></img>
        </Modal>
      </main>
    </div>
  );
};

export default AdminLayout;
