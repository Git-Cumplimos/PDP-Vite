import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import Button from "../../Base/Button";
import ButtonBar from "../../Base/ButtonBar";
import Modal from "../../Base/Modal";

const timeIdleTimeOut = `${process.env.REACT_APP_TIEMPO_INACTIVIDAD_ADVERTENCIA}`;
const timeLogOutTimeOut = `${process.env.REACT_APP_TIEMPO_INACTIVIDAD_LOGOUT}`;

const IdleTimeOut = () => {
  const [idleModal, setIdleModal] = useState(false);
  const { roleInfo, signOut } = useAuth();
  const refModal = useRef(false);

  //   let idleTimeout = 1000 * parseInt(timeIdleTimeOut);
  //   let idleLogout = 1000 * parseInt(timeLogOutTimeOut);
  let idleTimeout = 1000 * 10;
  let idleLogout = 1000 * 20;
  let idleEvent = useRef();
  let idleLogoutEvent = useRef();

  const events = ["click", "keypress"];

  const sessionTimeout = () => {
    // console.log("aaaa", idleEvent.current);
    // console.log("ddd", idleLogoutEvent.current);
    // console.log("fff", idleModal);
    // console.log("fff", refModal.current);
    if (!!idleEvent.current) clearTimeout(idleEvent.current);
    // if (!refModal.current) {
    if (!!idleLogoutEvent.current) clearTimeout(idleLogoutEvent.current);
    idleLogoutEvent.current = setTimeout(() => {
      logOut();
    }, idleLogout);
    // }

    // idleEvent.current = setTimeout(() => {
    //   console.log("tiemeee");
    //   setIdleModal(true);
    //   refModal.current = true;
    // }, idleTimeout);
  };

  const extendSession = () => {
    // console.log("user wants to stay logged in");
    setIdleModal(false);
    refModal.current = false;
  };

  const logOut = () => {
    signOut();
    notifyError("La sesión se cerro por inactividad", false);
    // setIdleModal(false);
    // refModal.current = false;
    // console.log("logging out");
  };

  useEffect(() => {
    if (roleInfo) {
      for (let e in events) {
        // console.log("mounted", e);
        window.addEventListener(events[e], sessionTimeout);
      }
      sessionTimeout();

      return () => {
        for (let e in events) {
          window.removeEventListener(events[e], sessionTimeout);
        }
      };
    }
  }, [roleInfo]);
  const handleCloseModal = () => {
    setIdleModal(false);
  };
  return (
    <>
      {/* <Modal show={idleModal} handleClose={handleCloseModal}>
      <h1 className='text-3xl text-center mb-10'>
        La sesión se cerrará por inactividad
      </h1>
      <ButtonBar>
        <Button type='button' onClick={logOut}>
          Cerrar sesión
        </Button>
        <Button type='submit' onClick={extendSession}>
          Extender sesión
        </Button>
      </ButtonBar>
    </Modal> */}
    </>
  );
};

export default IdleTimeOut;
