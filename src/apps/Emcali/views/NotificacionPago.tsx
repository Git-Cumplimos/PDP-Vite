import React, { Fragment, useCallback, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

import Select from "../../../components/Base/Select/Select";
import classes from "./NotificacionPago.module.css";
import Form from "../../../components/Base/Form/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader/BarcodeReader";
import { type } from "os";
import Input from "../../../components/Base/Input/Input";

//Constantes Style
const { styleComponents } = classes;

//Typing
type TypingPaso = "LecturaBarcode" | "LecturaEmcali";
type TypingInputData = {
  numcupon: string;
};
//Constantes
const option_manual = "Manual";
const option_barcode = "Código de barras";
const options_select = [
  { value: option_barcode, label: option_barcode },
  { value: option_manual, label: option_manual },
];
const inputDataInitial: TypingInputData = {
  numcupon: "",
};

const NotificacionPago = () => {
  const uniqueId = v4();
  const [paso, setPaso] = useState<TypingPaso>("LecturaEmcali");
  const [procedimiento, setProcedimiento] = useState<string>(option_manual);
  const [inputData, setInputData] = useState<TypingInputData>(inputDataInitial);
  const [showModal, setShowModal] = useState(false);
  const [resConsultRunt, setResConsultRunt] = useState({});
  const [infTicket, setInfTicket] = useState(null);
  const printDiv = useRef();
  const buttonDelate = useRef(null);
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();

  const CallErrorPeticion = useCallback((error) => {
    let msg = "Pago RUNT no exitosa";
    setPaso("LecturaBarcode");
    // setNumeroRunt("");
    // setResConsultRunt(null);
    setShowModal(false);
    // setProcedimiento(option_barcode);
  }, []);

  const onChangeInputData = useCallback((e) => {
    let valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setInputData(valueInput);
  }, []);

  const onChangeSelect = useCallback((e) => {
    if (e.target.value === option_barcode) {
      setPaso("LecturaBarcode");
      setProcedimiento(option_barcode);
    } else if (e.target.value === option_manual) {
      setPaso("LecturaEmcali");
      setProcedimiento(option_manual);
    }
    // setNumeroRunt("");
  }, []);

  const onSubmitBarcode = useCallback(
    (info: any) => {
      const data = {
        codigo_barras: info,
      };
      if (info === "") {
        notifyError(
          "El campo del código de barras está vacío, por favor scanee o dijite el código"
        );
        return;
      }
    },
    [CallErrorPeticion]
  );

  const onSubmitConsult = (e: any) => {
    e.preventDefault();
    // const data = {
    //   comercio: {
    //     id_comercio: roleInfo.id_comercio,
    //     id_terminal: roleInfo.id_dispositivo,
    //     id_usuario: roleInfo.id_usuario,
    //   },
    //   nombre_usuario: pdpUser["uname"],
    //   numero_runt: numeroRunt,
    // };
  };

  const onSubmitPayRunt = useCallback(
    (e) => {
      // const tipo__comercio = roleInfo.tipo_comercio.toLowerCase();
      // const data = {
      //   comercio: {
      //     id_comercio: roleInfo.id_comercio,
      //     id_terminal: roleInfo.id_dispositivo,
      //     id_usuario: roleInfo.id_usuario,
      //   },
      //   id_uuid_trx: uniqueId,
      //   oficina_propia:
      //     tipo__comercio.search("kiosco") >= 0 ||
      //     tipo__comercio.search("oficinas propias") >= 0
      //       ? true
      //       : false,
      //   nombre_usuario: pdpUser["uname"],
      //   nombre_comercio: roleInfo?.["nombre comercio"],
      //   numero_runt: numeroRunt,
      //   id_trx_original: resConsultRunt.id_trx,
      //   valor_mt: resConsultRunt.valor_mt,
      //   valor_runt: resConsultRunt.valor_runt,
      //   valor_total_trx: resConsultRunt.valor_total_trx,
      //   ciudad: roleInfo.ciudad,
      //   direccion: roleInfo.direccion,
      //   telefono: roleInfo?.telefono,
      //   dane_code: roleInfo?.codigo_dane,
      //   city: roleInfo?.["ciudad"],
      // };
      // const dataAditional = {
      //   id_uuid_trx: uniqueId,
      // };
    },
    [pdpUser, roleInfo, resConsultRunt, CallErrorPeticion]
  );

  // const handlePrint = useReactToPrint({
  //   content: () => printDiv.current,
  // });

  //********************Funciones para cerrar el Modal**************************
  const HandleCloseTrx = useCallback(() => {
    setPaso("LecturaBarcode");
    setShowModal(false);
    notify("Transacción cancelada");
    // setNumeroRunt("");
    // setResConsultRunt(null);
    setProcedimiento(option_barcode);
  }, []);

  const HandleCloseTrxExitosa = useCallback(() => {
    setPaso("LecturaBarcode");
    setShowModal(false);
    // setNumeroRunt("");
    // setResConsultRunt(null);
    setInfTicket(null);
    setProcedimiento(option_barcode);
    validNavigate("/corresponsalia/corresponsalia-banco-agrario");
  }, [validNavigate]);

  const HandleCloseModal = useCallback(() => {
    // if (paso === "LecturaBarcode" && !loadingPeticionBarcode) {
    //   HandleCloseTrx();
    // } else if (paso === "LecturaRunt" && !loadingPeticionConsultRunt) {
    //   HandleCloseTrx();
    // } else if (paso === "ResumenTrx" && !loadingPeticionPayRunt) {
    //   HandleCloseTrx();
    // } else if (paso === "TransaccionExitosa") {
    //   HandleCloseTrxExitosa();
    // }
  }, [paso, HandleCloseTrx, HandleCloseTrxExitosa]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recaudo Emcali</h1>
      <Form grid>
        <div className={styleComponents}>
          <Select
            id="opciones"
            label=""
            options={options_select}
            onChange={onChangeSelect}
            value={procedimiento}
          />
        </div>
        {/******************************Lectura Barcode*******************************************************/}
        {paso === "LecturaBarcode" && (
          <Fragment>
            <ButtonBar>
              <></>
            </ButtonBar>
            <BarcodeReader onSearchCodigo={() => {}} disabled={true} />
            <ButtonBar>
              <></>
            </ButtonBar>
          </Fragment>
        )}
        {/******************************Lectura Barcode*******************************************************/}

        {/******************************Lectura Emcali*******************************************************/}
        {paso === "LecturaEmcali" && (
          <Fragment>
            {procedimiento === option_barcode && (
              <Input
                label=""
                required
                // className={styleComponentsInput}
                type="text"
                autoComplete="off"
                maxLength={10}
                value={inputData.numcupon}
                disabled={true}
              />
            )}
            {procedimiento === option_manual && (
              <Input
                label=""
                required
                // className={styleComponentsInput}
                type="text"
                autoComplete="off"
                maxLength={10}
                value={inputData.numcupon}
                onChange={onChangeInputData}
              />
            )}
            <ButtonBar className="flex justify-center py-6">
              <Button
                type={"submit"}
                onClick={onSubmitConsult}
                // disabled={}
              >
                Realizar Consulta
              </Button>
              <Button
                type={"reset"}
                // onClick={handleClose}
                // disabled={loadingPeticion}
              >
                Cancelar
              </Button>
            </ButtonBar>
          </Fragment>
        )}

        {/******************************Respuesta Lectura runt*******************************************************/}
      </Form>

      {/* <Modal show={showModal} handleClose={HandleCloseModal}> */}
      {/******************************Resumen de trx*******************************************************/}
      {/* {paso === "ResumenTrx" && (
          <ComponentsModalSummaryTrx
            summary={resConsultRunt}
            loadingPeticion={loadingPeticionPayRunt}
            peticion={onSubmitPayRunt}
            handleClose={HandleCloseTrx}
          ></ComponentsModalSummaryTrx>
        )} */}
      {/******************************Resumen de trx*******************************************************/}

      {/**************** TransaccionExitosa **********************/}
      {/* {infTicket && paso === "TransaccionExitosa" && (
          <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
            <TicketsAgrario refPrint={printDiv} ticket={infTicket} />
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={HandleCloseTrxExitosa}>Cerrar</Button>
            </ButtonBar>
          </div>
        )} */}
      {/*************** Recarga Exitosa **********************/}
      {/* </Modal> */}
    </Fragment>
  );
};

export default NotificacionPago;
