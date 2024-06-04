import { Fragment } from "react";
import Modal from "../../../../../../../components/Base/Modal";
import classes from "./ModalQuestions.module.css";
import {
  PropsModalInterno,
  TypingInfoClientConst,
} from "../../../../utils/utils_typing";

//FRAGMENT ******************** CSS *******************************
const { containerPrincipal, labelQuestion, labelParagraph } = classes;

//FRAGMENT ******************** SUBCOMPONENT *******************************
const SubSwitch = ({
  key_,
  tipo,
  info,
  valueReplace,
}: {
  key_: string;
  tipo: string;
  info: string;
  valueReplace: { [key: string]: string };
}) => {
  return (
    <Fragment>
      {tipo === "questions" && (
        <label className={labelQuestion} id={key_}>
          {info}
        </label>
      )}
      {tipo === "br" && <br />}
      {tipo === "paragraph" && <p className={labelParagraph}>{info}</p>}
    </Fragment>
  );
};

const ModalQuestionsBase = ({
  infoClientConst,
  valueReplace,
}: {
  infoClientConst: TypingInfoClientConst;
  valueReplace: { [key: string]: string };
}) => {
  return (
    <Fragment>
      <h1 className="py-5 text-2xl font-semibold grid justify-center">
        Preguntas Frecuentes
      </h1>
      <div className={containerPrincipal}>
        {Object.keys(infoClientConst).map((key) => {
          return (
            <SubSwitch
              key_={key}
              tipo={key.split("|")[1]}
              info={infoClientConst[key]}
              valueReplace={valueReplace}
            ></SubSwitch>
          );
        })}
      </div>
    </Fragment>
  );
};

//FRAGMENT ******************** COMPONENT *******************************
const ModalQuestions = ({
  showModalInfoClient,
  setShowModalInfoClient,
  infoClientConst,
  valueReplace,
  children,
}: PropsModalInterno) => {
  return (
    <Modal
      show={showModalInfoClient !== null ? true : false}
      handleClose={() => setShowModalInfoClient(null)}
    >
      {children && !infoClientConst && children}
      {infoClientConst && !children && (
        <ModalQuestionsBase
          infoClientConst={infoClientConst}
          valueReplace={valueReplace ? valueReplace : {}}
        ></ModalQuestionsBase>
      )}
    </Modal>
  );
};

export default ModalQuestions;
