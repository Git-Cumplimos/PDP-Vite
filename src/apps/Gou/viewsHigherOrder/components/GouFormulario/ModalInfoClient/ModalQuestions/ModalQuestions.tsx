import { Fragment } from "react";
import Modal from "../../../../../../../components/Base/Modal";

import { PropsModalInterno } from "../TypingModalInfoClient";
import classes from "./ModalQuestions.module.css";

//FRAGMENT ******************** CSS *******************************
const {
  containerPrincipal,
  containerPerItemFather,
  containerRes,
  labelQuestion,
} = classes;

//FRAGMENT ******************** COMPONENT *******************************
const ModalQuestions = ({
  constInfo,
  showModalInfoClient,
  setShowModalInfoClient,
}: PropsModalInterno) => {
  return (
    <Modal
      show={showModalInfoClient !== null ? true : false}
      handleClose={() => setShowModalInfoClient(null)}
    >
      <h1 className="py-5 text-2xl font-semibold grid justify-center">
        Aceptar Terminos y condiciones
      </h1>
      <div className={containerPrincipal}>
        {Object.keys(constInfo).map((key) => {
          const resObj = constInfo[key].res;
          const resList = Object.keys(resObj);
          return (
            <div className={containerPerItemFather} id={`PerItemFather ${key}`}>
              <label className={labelQuestion} id={`Question ${key}`}>
                {constInfo[key].que}
              </label>
              <div className={containerRes}>
                {resObj.paragraph && (
                  <label id={`Res ${key} paragraph`}>{resObj.paragraph}</label>
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
    </Modal>
  );
};

export default ModalQuestions;
