import React, { Fragment, useMemo } from "react";
import Modal from "../../../../../../../components/Base/Modal";
import PaymentSummary from "../../../../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../../../../components/Base/ButtonBar";
import Button from "../../../../../../../components/Base/Button";
import { PropsModalInternoAcepto } from "../../../../utils/utils_typing";
import classes from "./ModalAceptarTerminos.module.css";
import { NameVar } from "../../../../../../Corresponsalia/CorresponsaliaDavivienda/utils/typingPagoDaviplata";

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
  return (
    <label className={`${labelItem} ${classNameCustom ? classNameCustom : ""}`}>
      {info}
    </label>
  );
};

const SubSwitch = ({ key_, tipo, info, valueReplace }: any) => {
  const infoFinal = useMemo(() => {
    let infoNew = info;
    if (valueReplace) {
      Object.keys(valueReplace).map((nameVar_) => {
        infoNew = infoNew.replace(nameVar_, valueReplace[nameVar_]);
        return nameVar_;
      });
    }
    return infoNew;
  }, [info, valueReplace]);

  return (
    <Fragment>
      {tipo === "title" && <label className={labelTitle}>{infoFinal}</label>}
      {tipo === "br" && <br />}
      {tipo === "seccion:title" && (
        <label className={labelSeccionTitle}>{infoFinal}</label>
      )}
      {tipo === "paragraph" && <p className={labelParagraph}>{infoFinal}</p>}
      {tipo === "item" && <SubItem key_={key_} info={infoFinal}></SubItem>}
    </Fragment>
  );
};

const AceptarTerminosBase = ({ infoClientConst, valueReplace }: any) => {
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
              valueReplace={valueReplace}
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
  valueReplace,
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
              valueReplace={valueReplace}
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
