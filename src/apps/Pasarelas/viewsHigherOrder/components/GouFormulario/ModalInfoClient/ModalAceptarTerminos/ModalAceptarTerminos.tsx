import React, { Fragment } from "react";
import Modal from "../../../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../../components/Base/Button";
import { PropsModalInternoAcepto } from "../../../../utils/utils_typing";
import classes from "./ModalAceptarTerminos.module.css";

//FRAGMENT ******************** CSS *******************************
const {
  containerPrincipal,
  labelParagraph,
  labelSeccionTitle,
  labelItem,
  labelTitle,
} = classes;
//FRAGMENT ******************** TYPING **********************************

//FRAGMENT ******************** SUBCOMPONENT ****************************
const SubItem = ({ key_, info }: any) => {
  const classNameCustom = key_.split("|")[2];
  console.log(classNameCustom);
  return (
    <label className={`${labelItem} ${classNameCustom ? classNameCustom : ""}`}>
      {info}
    </label>
  );
};

const SubSwitch = ({ key_, tipo, info }: any) => {
  return (
    <Fragment>
      {tipo === "title" && <label className={labelTitle}>{info}</label>}
      {tipo === "br" && <br />}
      {tipo === "seccion:title" && (
        <label className={labelSeccionTitle}>{info}</label>
      )}
      {tipo === "paragraph" && <p className={labelParagraph}>{info}</p>}
      {tipo === "item" && <SubItem key_={key_} info={info}></SubItem>}
    </Fragment>
  );
};

const AceptarTerminosBase = ({ infoClientConst }: any) => {
  return (
    <Fragment>
      <h1 className="py-5 text-2xl font-semibold grid justify-center">
        Aceptar Términos y condiciones
      </h1>
      <div className={containerPrincipal}>
        {Object.keys(infoClientConst).map((key, index) => {
          return (
            <SubSwitch
              key_={key}
              tipo={key.split("|")[1]}
              info={infoClientConst[key]}
            ></SubSwitch>
          );
        })}
      </div>
    </Fragment>
  );
};

//FRAGMENT ******************** COMPONENT *******************************
const ModalAceptarTerminos = ({
  showModalInfoClient,
  setShowModalInfoClient,
  setAcepto,
  infoClientConst,
  children,
}: PropsModalInternoAcepto) => {
  return (
    <Modal
      show={showModalInfoClient !== null ? true : false}
      handleClose={() => setShowModalInfoClient(null)}
    >
      <ButtonBar>
        {children && !infoClientConst && children}
        {infoClientConst && !children && (
          <Fragment>
            <AceptarTerminosBase
              infoClientConst={infoClientConst}
            ></AceptarTerminosBase>
          </Fragment>
        )}
        <Button
          type={"submit"}
          onClick={() => {
            setAcepto(true);
            setShowModalInfoClient(null);
          }}
        >
          Aceptar
        </Button>
        <Button onClick={() => setShowModalInfoClient(null)}>Cerrar</Button>
      </ButtonBar>
    </Modal>
  );
};

export default ModalAceptarTerminos;
