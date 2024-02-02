import React, { Fragment, useRef } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Input from "../../../../../components/Base/Input";
import classes from "../pagarMoviliza.module.css";
import TextArea from "../../../../../components/Base/TextArea";
import Form from "../../../../../components/Base/Form/Form";

//Clases estilos
const { styleComponentsInput, formItem } = classes;

  export const LecturaBarcode = ({
    loadingPeticion,
    loadingPeticionConsulta,
    onSubmit,
    handleClose,
    onChange,
    procedimiento,
    option_barcode,
    option_manual,
    numeroMoviliza,
    onSubmitBarcode,
    bloqueoInput,
    resetConsultaBarcode,
    token,
    cambioBarcodeBoton,
    datosTrans,
    setDatosTrans,
    onChangeFormat
  }) => {
    const isAlt = useRef("");
    const isAltCR = useRef({ data: "", state: false });
    return (
      <Fragment>
        <ButtonBar></ButtonBar>
        {/* <h2 className="text-xl mt-6">Escanee el código de barras</h2> */}
        <ButtonBar></ButtonBar>

        {procedimiento === option_barcode && (
          <>
          {/* <Input
          required
          className={styleComponentsInput}
          type="text"
          minLength="1"
          maxLength="300"
          autoComplete="off"
          value={numeroMoviliza}
          onChange={onChange}
          disabled={bloqueoInput}
          onKeyDown={(ev) => {
            if(ev.key=="Backspace"){
              ev.preventDefault();
            }
          }}
          /> */}
          <TextArea
          className={styleComponentsInput}
          disabled={bloqueoInput}
          onChange={onChange}
          id='codBarras'
          label='Escanee el código de barras'
          type='text'
          name='codBarras'
          required
          value={datosTrans.codBarras}
          autoFocus
          autoComplete='off'
          onInput={onChangeFormat}
          onKeyDown={(ev) => {
            if (ev.keyCode === 13 && ev.shiftKey === false) {
              // ev.preventDefault();
              onSubmitBarcode(ev);
              return;
            }
            if (ev.altKey) {
              if (isAltCR.current.state) {
                isAltCR.current = {
                  ...isAltCR.current,
                  data: isAltCR.current.data + ev.key,
                };
              }
              if (ev.keyCode !== 18) {
                isAlt.current += ev.key;
              } else {
                isAltCR.current = { ...isAltCR.current, state: true };
              }
            }
          }}
          onKeyUp={(ev) => {
            if (ev.altKey === false && isAlt.current !== "") {
              let value = String.fromCharCode(parseInt(isAlt.current));
              isAlt.current = "";
              if (value === "\u001d") {
                setDatosTrans((old) => {
                  return { ...old, codBarras: old.codBarras + "\u001d" };
                });
              }
            }
            if (ev.keyCode === 18) {
              if (isAltCR.current.data === "013") {
                onSubmitBarcode(ev);
              }
              isAltCR.current = {
                ...isAltCR.current,
                state: false,
                data: "",
              };
            }
          }}></TextArea>
          </>
        )}
        {procedimiento === option_manual && (
          <Input
            required
            className={styleComponentsInput}
            type="text"
            minLength="1"
            maxLength="300"
            autoComplete="off"
            value={numeroMoviliza}
            onChange={onChange}
          />
        )}

        {!(loadingPeticion || loadingPeticionConsulta) ? (
        <Fragment>
         <ButtonBar>
          {cambioBarcodeBoton?(
          <Button  
          onClick={resetConsultaBarcode} 
          disabled={loadingPeticion} 
          >Volver a ingresar código de barras</Button>
         )
         :<></>
        //  (
        //   <Button type={"submit"} onClick={onSubmitBarcode} disabled={loadingPeticion} >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Consultar código de barras&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Button>
        //  ) 
         }
         </ButtonBar>
          </Fragment>
                 
      ) : (
        <Fragment>
          <ButtonBar></ButtonBar>
          <br></br>
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        </Fragment>
      )}

      {/* <ButtonBar className="flex justify-center py-1">
          <Button 
          className={formItem} 
          type={"submit"}  
          onClick={onSubmit} 
          disabled={
            (
              token === "" || 
              numeroMoviliza === "" ||
              numeroMoviliza === 0 || 
              0 >= numeroMoviliza.length || 
              numeroMoviliza.length > 300 
              ? !loadingPeticion : loadingPeticion
              ) || (
                !cambioBarcodeBoton ? true : false
                ) 
              }>
           Realizar consulta
          </Button>
          <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
            Cancelar
          </Button>
        </ButtonBar> */}

        {/* </Form> */}

      </Fragment>
    );
  };

export const LecturaMoviliza = ({
  loadingPeticion,
  onSubmit,
  handleClose,
  onChange,
  procedimiento,
  option_barcode,
  option_manual,
  numeroMoviliza,
  token
}) => {
  return (
    <Fragment>
      <ButtonBar></ButtonBar>
      <h2 className="text-xl mt-6">Número de referencia</h2>
      <ButtonBar></ButtonBar>

      {/* <Form > */}

      {procedimiento === option_barcode && (
          
          <Input
          required
          className={styleComponentsInput}
          type="text"
          minLength="1"
          maxLength="30"
          autoComplete="off"
          value={numeroMoviliza}
          onChange={onChange}
          onKeyDown={(ev) => {
            if(ev.key=="Backspace"){
              ev.preventDefault();
            }
          }}
          />
        )}
      {procedimiento === option_manual && (
        <Input
          required
          className={styleComponentsInput}
          type="text"
          minLength="1"
          maxLength="30"
          autoComplete="off"
          value={numeroMoviliza}
          onChange={onChange}
        />
      )}

      <ButtonBar className="flex justify-center py-6">
        <Button type={"submit"}  onClick={onSubmit} disabled={ 
          token === "" || 
          numeroMoviliza === "" || numeroMoviliza === 0 || 0 >= numeroMoviliza.length || numeroMoviliza.length > 30 ? !loadingPeticion : loadingPeticion }>
        Realizar consulta
        </Button>
        <Button type={"reset"} onClick={handleClose} disabled={loadingPeticion}>
          Cancelar
        </Button>
      </ButtonBar>
      {/* </Form> */}
    </Fragment>
  );
};
