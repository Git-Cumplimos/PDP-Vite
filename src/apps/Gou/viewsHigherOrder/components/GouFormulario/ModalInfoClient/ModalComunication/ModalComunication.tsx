import { Fragment } from "react";
import Modal from "../../../../../../../components/Base/Modal";

import classes from "./ModalComunication.module.css";
import { PropsModalInterno } from "../../../../utils/utils_typing";

//FRAGMENT ******************** CSS *******************************
const {
  containerPrincipal,
  containerPerItemFather,
  containerRes,
  labelQuestion,
} = classes;

//FRAGMENT ******************** COMPONENT *******************************
const ModalComunication = ({
  showModalInfoClient,
  setShowModalInfoClient,
  infoClientConst,
  children,
}: PropsModalInterno) => {
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
        {children && !infoClientConst && children}
        {infoClientConst && !children && (
          <div className={containerPrincipal}>
            {Object.keys(infoClientConst).map((key) => {
              const resObj = infoClientConst[key].res;
              const resList = Object.keys(resObj);
              return (
                <div
                  className={containerPerItemFather}
                  id={`PerItemFather ${key}`}
                >
                  <label className={labelQuestion} id={`Question ${key}`}>
                    {infoClientConst[key].que}
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
        )}
      </div>
    </Modal>
  );
};

export default ModalComunication;
