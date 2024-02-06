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
import { searchCierre,verValorBoveda } from "../../pages/Gestion/utils/fetchCaja";
import { notifyError } from "../../utils/notify";
import ButtonBar from "../../components/Base/ButtonBar";
import Fieldset from "../../components/Base/Fieldset";
import Input from "../../components/Base/Input";
import Form from "../../components/Base/Form";
import {getConsultaCupoComercio}  from "../../apps/Cupo/utils/fetchFunctions";
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
  } = classes;

  const urlAssets = process.env.REACT_APP_ASSETS_URL;
  const montoMaximoCaja = process.env.REACT_APP_MAX_MONTO_CAJA;
  const porcentajeAlerta1 = process.env.REACT_APP_PORCENTAJE_ALERTA_1;
  const porcentajeAlerta2 = process.env.REACT_APP_PORCENTAJE_ALERTA_2;

  const { quotaInfo, roleInfo, signOut, userPermissions, userInfo } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { urlsPrivate: urls } = useUrls();

  const [showModalPublicidad, setShowModalPublicidad] = useState(true);
  const [showModalCupo, setShowModalCupo] = useState(false);
  const [cupoComercio, setCupoComercio] = useState(false);
  const [ModalAlertBoveda, setModalAlertBoveda] = useState(true);
  const [cajaState, setCajaState] = useState("");
  const [valorBoveda, setValorBoveda] = useState();
  const [valorCaja, setMontoMaximoCaja] = useState(montoMaximoCaja);
  const [conteoAlertaBoveda, setConteoAlertaBoveda] = useState(1);
  
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

  const consultaCupoComercios = useCallback((id_comercio) => {
    if (!showModalCupo && roleInfo?.id_comercio) {
      getConsultaCupoComercio({'pk_id_comercio':id_comercio ?? roleInfo?.id_comercio})
      .then((res) => {
        if (!res?.obj || res?.obj?.length === 0) {
          setShowModalCupo(false)
          notifyError("No se encontraron comercios con ese id");
          return;
        } 
        setShowModalCupo(true)
        setCupoComercio(res?.obj ?? []);
      })
      .catch((reason) => {
        setShowModalCupo(false)
        notifyError("Error al cargar Datos del cupo");
      });
    }
  },[roleInfo?.id_comercio,showModalCupo]);

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

  const handleCloseBoveda = useCallback(() => {
    setModalAlertBoveda(false)
    let valorporcentajeAlerta1 = montoMaximoCaja*porcentajeAlerta1/100
    let valorporcentajeAlerta2 = montoMaximoCaja*porcentajeAlerta2/100
    if (conteoAlertaBoveda === 1) {
      setMontoMaximoCaja(parseInt(montoMaximoCaja) + parseInt(valorporcentajeAlerta1))
      setConteoAlertaBoveda(2)
    }if(conteoAlertaBoveda === 2){
      setMontoMaximoCaja(parseInt(montoMaximoCaja) + parseInt(valorporcentajeAlerta2))
      setConteoAlertaBoveda(3)
    }if(conteoAlertaBoveda === 3){
      navigate(`/gestion/arqueo/carga-comprobante`);
    }
  }, [porcentajeAlerta1,montoMaximoCaja,porcentajeAlerta2,conteoAlertaBoveda,navigate]);

  useEffect(() => {
    const conditions = [
      roleInfo?.id_usuario !== undefined,
      roleInfo?.id_comercio !== undefined,
      roleInfo?.id_dispositivo !== undefined,
      userPermissions?.map(({ id_permission }) => id_permission).includes(7012),
      userPermissions?.map(({ id_permission }) => id_permission).includes(7013),
    ];
    if (conditions.every((val) => val)) {
      verValorBoveda({
        id_usuario: roleInfo?.id_usuario,
        id_comercio: roleInfo?.id_comercio,
        id_terminal: roleInfo?.id_dispositivo,
      })
        .then((res) => {
          setModalAlertBoveda(true)
          setValorBoveda(res?.obj[0]?.valor_boveda === undefined?0:res?.obj[0]?.valor_boveda)
          if (parseInt(quotaInfo?.quota)> 0) {
            if ((parseInt(quotaInfo?.quota) - parseInt(res?.obj[0]?.valor_boveda)) < montoMaximoCaja) {
              setConteoAlertaBoveda(1)
              setMontoMaximoCaja(montoMaximoCaja)
            }
          } 
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
          }
          console.error(error?.message);
        });
    }
  }, [userPermissions,
      roleInfo?.id_usuario,
      roleInfo?.id_comercio,
      roleInfo?.id_dispositivo,
      quotaInfo?.quota,
      pathname,
      montoMaximoCaja]);

  const showModalAlertBoveda = useMemo(() => {
    return (
      (parseInt(quotaInfo?.quota)-parseInt(valorBoveda)) >= valorCaja &&
      !pathname.includes("/gestion/arqueo/carga-comprobante") &&
      ModalAlertBoveda
    );
  }, [valorBoveda, quotaInfo,pathname,valorCaja,ModalAlertBoveda]);

  const infoCaja = useMemo(() => {
    return (
      (cajaState === 1 &&
        !pathname.startsWith("/gestion/arqueo/arqueo-cierre")) ||
      cajaState === 4
    );
  }, [cajaState, pathname]);

  const handleCloseCupo = useCallback(() => {
    setShowModalCupo(false)
  }, []);
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
            <div 
              className={saldoCupo} 
              onClick={()=>{
                consultaCupoComercios(roleInfo?.id_comercio)
              }
            }>
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
        <ModalAlert />
        <HNavbar links={urls} isText />
      </header>
      <main className="container">
        <Suspense fallback={<ContentBox />}>{!infoCaja && <Outlet />}</Suspense>
        <Modal show={showModalAlertBoveda}>
          <div className="items-center text-center">
            <h1>
            Señor usuario, ha superado el valor de efectivo en caja. Por favor realice el movimiento a bóveda
              <ButtonBar>
                <Button
                  className="btn mx-auto d-block"
                  type="submit"
                  onClick={() => handleCloseBoveda()}
                >
                  {conteoAlertaBoveda !== 3 ?"Cerrar":"Movimiento Bóveda"}
                </Button>
              </ButtonBar>
            </h1>
          </div>
        </Modal>
        <Modal show={infoCaja}>
          {cajaState === 1 ? (
            <div className="items-center text-center">
              <h1>
                Señor usuario, la caja presenta cierre tardío, no se pueden
                realizar transacciones hasta que realice el cierre.
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
        <Modal show={showModalCupo} handleClose={handleCloseCupo}>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            grid
          >
            <Fieldset legend={"Detalles"} className={"lg:col-span-2"}>
              <Input
                id="sobregiro"
                name="sobregiro"
                label="Sobregiro"
                autoComplete="off"
                value={`$ ${Math.abs(parseInt(cupoComercio[0]?.sobregiro)).toLocaleString() ?? 0}`}
                disabled={true}
              />
              <Input
                id="deuda"
                name="deuda"
                label={parseInt(cupoComercio[0]?.deuda) >= 1 ? "Deuda al comercio":"Deuda del comercio"}
                autoComplete="off"
                value={`$ ${Math.abs(parseInt(cupoComercio[0]?.deuda)).toLocaleString() ?? 0}`}
                disabled={true}
              />      
              <Input
                id="cupo_en_canje"
                name="cupo_en_canje"
                label="Cupo en canje"
                autoComplete="off"
                value={`$ ${Math.abs(parseInt(cupoComercio[0]?.cupo_en_canje)).toLocaleString() ?? 0}`}
                disabled={true}
              />
              <Input
                id="base_caja"
                name="base_caja"
                label="Base caja"
                autoComplete="off"
                value={`$ ${Math.abs(parseInt(cupoComercio[0]?.base_caja)).toLocaleString() ?? 0}`}
                disabled={true}
              />
              <Input
                id="dias_max_sobregiro"
                name="dias_max_sobregiro"
                label="Días máximos sobregiro"
                autoComplete="off"
                value={cupoComercio[0]?.dias_max_sobregiro ?? 0}
                disabled={true}
              />
            </Fieldset>
          </Form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminLayout;
