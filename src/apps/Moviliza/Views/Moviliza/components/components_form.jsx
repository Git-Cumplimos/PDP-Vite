import React, { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Input from "../../../../../components/Base/Input";
import classes from "../pagarMoviliza.module.css";
import Form from "../../../../../components/Base/Form/Form";

//Clases estilos
const { styleComponentsInput, formItem , ocultar} = classes;

// export const LecturaBarcode = ({ loadingPeticion, onSubmit, buttonDelate }) => {
//   return (
//     <Fragment>
//       <ButtonBar></ButtonBar>
//       <BarcodeReader onSearchCodigo={onSubmit} disabled={loadingPeticion} />
//       <ButtonBar></ButtonBar>

//       <ButtonBar></ButtonBar>
//       <h2 className="text-1xl mt-6">Escanee el código de barras</h2>
//       <ButtonBar></ButtonBar>
//     {console.log({ loadingPeticion, onSubmit, buttonDelate })}
        

//                 <Input
//           required
//           className={styleComponentsInput}
//           type="text"
//           minLength="30"
//           maxLength="30"
//           autoComplete="off"
//           value={onSubmit}
//           onChange={onSubmit}
//         />
      

//       {!loadingPeticion ? (
//         <div className={formItem} ref={buttonDelate}>
//           <button type="reset">Volver a ingresar código de barras</button>
//         </div>
                 
//       ) : (
//         <Fragment>
//           <ButtonBar></ButtonBar>
//           <h1 className="text-2xl font-semibold">Procesando . . .</h1>
//         </Fragment>
//       )}
//     </Fragment>
//   );
// };

  export const LecturaBarcode = ({
    loadingPeticion,
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
    token
  }) => {
    return (
      <Fragment>
        <ButtonBar></ButtonBar>
        <h2 className="text-xl mt-6">Escanee el código de barras</h2>
        <ButtonBar></ButtonBar>

        {procedimiento === option_barcode && (
          
          <Input
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
          />
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



      {/* {!loadingPeticion ? (
        <div className={formItem} >
          <button type="reset">Volver a ingresar código de barras</button>
        </div>
      ) : (
        <Fragment>
          <ButtonBar></ButtonBar>
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        </Fragment>
      )} */}

        {!loadingPeticion ? (
        <Fragment>
         <ButtonBar>
         <button type={"submit"} onClick={onSubmitBarcode} disabled={loadingPeticion} className={ocultar} >Consultar código de barras</button>
         </ButtonBar>
         <ButtonBar>
          <Button  onClick={resetConsultaBarcode} disabled={loadingPeticion}  >Volver a ingresar código de barras</Button>
          </ButtonBar>
          </Fragment>
                 
      ) : (
        <Fragment>
          <ButtonBar></ButtonBar>
          <h1 className="text-2xl font-semibold">Procesando . . .</h1>
        </Fragment>
      )}

      <ButtonBar className="flex justify-center py-1">
          <Button className={formItem} type={"submit"}  onClick={onSubmit} disabled={
            token === "" || 
            numeroMoviliza === "" || numeroMoviliza === 0 || 0 >= numeroMoviliza.length || numeroMoviliza.length > 300 ? !loadingPeticion : loadingPeticion }>
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
