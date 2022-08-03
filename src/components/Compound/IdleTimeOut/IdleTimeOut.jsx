import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthHooks";
import Button from "../../Base/Button";
import ButtonBar from "../../Base/ButtonBar";
import Modal from "../../Base/Modal";
// import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

const IdleTimeOut = () => {
  //Modal
  const [idleModal, setIdleModal] = useState(false);
  const { roleInfo, signOut } = useAuth();

  let idleTimeout = 1000 * 5 * 1; //1 minute
  let idleLogout = 1000 * 5 * 2; //2 Minutes
  let idleEvent;
  let idleLogoutEvent;

  const events = ["click", "keypress"];

  const sessionTimeout = () => {
    console.log("aaaa", idleEvent);
    console.log("ddd", idleLogoutEvent);
    if (!!idleEvent) clearTimeout(idleEvent);
    if (!!idleLogoutEvent) clearTimeout(idleLogoutEvent);

    idleEvent = setTimeout(() => {
      console.log("tiemeee");
      setIdleModal(true);
    }, idleTimeout);
    idleLogoutEvent = setTimeout(() => {
      logOut();
    }, idleLogout);
  };

  const extendSession = () => {
    console.log("user wants to stay logged in");
    setIdleModal(false);
  };

  const logOut = () => {
    signOut();
    setIdleModal(false);
    console.log("logging out");
  };

  useEffect(() => {
    console.log(roleInfo);
    if (roleInfo) {
      for (let e in events) {
        console.log("mounted", e);
        window.addEventListener(events[e], sessionTimeout);
      }

      return () => {
        for (let e in events) {
          window.removeEventListener(events[e], sessionTimeout);
        }
      };
    }
  }, [roleInfo]);

  return (
    <Modal show={idleModal} handleClose={() => setIdleModal(false)}>
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
      {/* <ModalHeader toggle={() => setIdleModal(false)}>
            Session expire warning
        </ModalHeader>
        <ModalBody>
            your session will expire in {idleLogout / 60 / 1000} minutes. Do you want to extend the session?
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-info"  onClick={()=> logOut()}>Logout</button>
          <button className="btn btn-success" onClick={()=> extendSession()}>Extend session</button>
        
        </ModalFooter> */}
    </Modal>
  );
};

export default IdleTimeOut;
