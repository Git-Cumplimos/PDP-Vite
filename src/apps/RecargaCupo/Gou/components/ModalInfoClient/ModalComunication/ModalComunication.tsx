import { Fragment, useEffect, useState } from "react";
import Modal from "../../../../../../components/Base/Modal";

import classes from "./ModalComunication.module.css";

//FRAGMENT ******************** CSS *******************************
const {
  containerPerItemFather,
  containerRes,
  labelQuestion,
  containerPrincipal,
} = classes;

//FRAGMENT ******************** Typing *******************************
type PropsModalInternoSimple = {
  constInfo: any;
  showModalInfoClient: any;
  setShowModalInfoClient: any;
};

//FRAGMENT ******************** COMPONENT *******************************
const ModalComunication = ({
  constInfo,
  showModalInfoClient,
  setShowModalInfoClient,
}: PropsModalInternoSimple) => {
  return (
    <Modal
      show={showModalInfoClient !== null ? true : false}
      handleClose={() => setShowModalInfoClient(null)}
    >
      <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
        <h1 className="text-2xl font-semibold">Canales de comunicación</h1>
        <h1 className="text-xl font-semibold">
          Estos son nuestros canales de servicio al cliente
        </h1>
        <div className={containerPrincipal}>
          {Object.keys(constInfo).map((key) => {
            const resObj = constInfo[key].res;
            const resList = Object.keys(resObj);
            return (
              <div
                className={containerPerItemFather}
                id={`PerItemFather ${key}`}
              >
                <label className={labelQuestion} id={`Question ${key}`}>
                  {constInfo[key].que}
                </label>
                <div className={containerRes}>
                  {resObj.paragraph && (
                    <label id={`Res ${key} paragraph`}>
                      {resObj.paragraph}
                    </label>
                  )}
                  {resList.length > 0 && (
                    <Fragment>
                      {resList.map((item) => (
                        <Fragment>
                          {item !== "paragraph" && (
                            <label id={`Res ${key} item ${item}`}>
                              {`- ${resObj[item]}`}
                            </label>
                          )}
                        </Fragment>
                      ))}
                    </Fragment>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ModalComunication;
