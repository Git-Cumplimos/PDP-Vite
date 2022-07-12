import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";
import { postConsultaTablaConveniosEspecifico } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = () => {
  const [showModal, setShowModal] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    codBarras: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [convenio, setConvenio] = useState([]);

  // useEffect(() => {
  //   fecthTablaConveniosEspecificoFunc();
  // }, [state?.id]);

  // const fecthTablaConveniosEspecificoFunc = () => {
  //   postConsultaTablaConveniosEspecifico({
  //     pk_tbl_transaccional_convenios_davivienda_cb: state?.id,
  //   })
  //     .then((autoArr) => {
  //       console.log(autoArr?.results[0])
  //       setConvenio(autoArr?.results[0]);
  //     })
  //     .catch((err) => console.error(err));
  // };
  // const printDiv = useRef();

  const onSubmit = () => {};
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        Recaudo servicios publicos y privados
      </h1>
      <h1 className='text-3xl text-center'>Ingrese el código de barras</h1>

      <Form grid onSubmit={onSubmit}>
        <Input
          id='codBarras'
          label='Código de barras'
          type='text'
          name='codBarras'
          minLength='32'
          maxLength='32'
          required
          value={datosTrans.ref1}
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, ref1: e.target.value };
            });
          }}></Input>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Realizar consulta</Button>
        </ButtonBar>
      </Form>
      {/* <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {!peticion ? (
            datosTrans.valorCashOut <= limiteRecarga.superior &&
            datosTrans.valorCashOut >= limiteRecarga.inferior ? (
              <>
                <h1 className='text-2xl font-semibold'>
                  ¿Esta seguro de realizar el cash out?
                </h1>
                <h2 className='text-base'>
                  {`Valor de transacción: ${formatMoney.format(
                    datosTrans.valorCashOut
                  )} COP`}
                </h2>
                <h2>{`Número de telefono: ${datosTrans.numeroTelefono}`}</h2>
                <h2>{`Número de otp: ${datosTrans.otp}`}</h2>
                <ButtonBar>
                  <Button
                    disabled={botonAceptar}
                    type='submit'
                    onClick={peticionCashOut}>
                    Aceptar
                  </Button>
                  <Button onClick={hideModal}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <>
                <h2 className='text-2xl font-semibold'>
                  {datosTrans.valorCashOut <= limiteRecarga.inferior
                    ? `ERROR el valor de cash out debe ser mayor a ${formatMoney.format(
                        limiteRecarga.inferior
                      )}`
                    : "ERROR El valor de cash out debe ser menor a " +
                      formatMoney.format(limiteRecarga.superior) +
                      " COP"}
                </h2>

                <ButtonBar>
                  <Button onClick={() => setShowModal(false)}>Cancelar</Button>
                </ButtonBar>
              </>
            )
          ) : (
            ""
          )} */}
      {/* {peticion && (
            <>
              <h2>
                <ButtonBar>
                  <Button
                    type='submit'
                    onClick={() => {
                      hideModal();
                    }}>
                    Aceptar
                  </Button>
                  <Button onClick={handlePrint}>Imprimir</Button>
                </ButtonBar>
              </h2>
              <TicketsDavivienda
                ticket={objTicketActual}
                refPrint={printDiv}></TicketsDavivienda>
            </>
          )} */}
      {/* </div>
      </Modal> */}
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarras;