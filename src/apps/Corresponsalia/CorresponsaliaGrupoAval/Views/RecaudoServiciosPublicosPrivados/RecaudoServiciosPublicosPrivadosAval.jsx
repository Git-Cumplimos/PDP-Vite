import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useMoney from "../../../../../hooks/useMoney";
import { notify, notifyError } from "../../../../../utils/notify";
import TicketsAval from "../../components/TicketsAval";
import {
  postConsultaConveniosAval,
  postConsultaTablaConveniosEspecifico,
  postRecaudoConveniosAval,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";
import { enumParametrosGrupoAval } from "../../utils/enumParametrosGrupoAval";

const RecaudoServiciosPublicosPrivadosAval = () => {
  const { state } = useLocation();
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();

  const [{ showModal, estadoPeticion }, setShowModal] = useState({
    showModal: false,
    estadoPeticion: 0,
  });
  const [datosTrans, setDatosTrans] = useState({
    ref1: "",
    ref2: "",
    valor: "",
    valorConst: "",
    valorVar: "",
  });
  const [objTicketActual, setObjTicketActual] = useState({});
  const [datosConsulta, setDatosConsulta] = useState({});
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);
  useEffect(() => {
    if (state?.id) {
      fecthTablaConveniosEspecificoFunc();
    } else {
      navigate("../");
    }
  }, [state?.id]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      pk_convenios_recaudo_aval: state?.id,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        setIsUploading(false);
      })
      .catch((err) => console.error(err));
  };
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onSubmit = (e) => {
    e.preventDefault();
    // setShowModal((old) => ({ ...old, showModal: true }));
    if (parseInt(datosTrans.ref1) <= 0) {
      return notifyError("La referencia no puede ser 0");
    }
    setIsUploading(true);
    postConsultaConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: datosTrans.valor !== "" ? datosTrans.valor : 0,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        numeroConvenio: convenio.nura,
        valReferencia1: datosTrans.ref1,
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          let valorTrxCons = res?.obj?.valorTrx ?? 0;
          setIsUploading(false);
          notify(res?.msg);
          setDatosConsulta(res?.obj);
          setDatosTrans((old) => ({
            ...old,
            valorConst: valorTrxCons ?? "",
            valorVar: res?.obj?.valorTrx,
          }));
          setShowModal((old) => ({ ...old, showModal: true }));
        } else {
          setIsUploading(false);
          handleClose();
          notifyError(res?.msg);
          navigate(-1)
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
        navigate(-1)
      });
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    let valorTransaccion = parseFloat(datosTrans?.valorVar) ?? 0;
    setIsUploading(true);
    postRecaudoConveniosAval({
      oficina_propia:
        roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
        roleInfo?.tipo_comercio === "KIOSCO"
          ? true
          : false,
      valor_total_trx: valorTransaccion,
      nombre_comercio: roleInfo?.["nombre comercio"],
      nombre_usuario: pdpUser?.uname ?? "",
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
      },
      recaudoAval: {
        nombreConvenio: convenio.convenio,
        numeroConvenio: convenio.nura,
        valReferencia1: datosTrans.ref1,
        pila: datosConsulta?.["pila"] ?? "",
        54: datosConsulta?.tipoRecaudo?.["54"] ?? "",
        62: datosConsulta?.tipoRecaudo?.["62"] ?? "",
        103: datosConsulta?.tipoRecaudo?.["103"] ?? "",
        104: datosConsulta?.tipoRecaudo?.["104"] ?? "",
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
      },
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          setObjTicketActual(res?.obj?.ticket);
          setShowModal((old) => ({ ...old, estadoPeticion: 4 }));
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          handleClose();
          navigate(-1)
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        handleClose();
        console.error(err);
        navigate(-1)
      });
  };
  const handleClose = useCallback(() => {
    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
    setDatosTrans({
      ref1: "",
      ref2: "",
      valor: "",
      valorConst: "",
      valorVar: "",
    });
    setObjTicketActual({});
    setDatosConsulta({});
    navigate(-1);
  }, [roleInfo]);
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-10 mt-5'>
        Recaudo servicios públicos y privados
      </h1>
      <h1 className='text-2xl text-center mb-10'>{`Convenio: ${
        convenio?.convenio ?? ""
      }`}</h1>

      <Form onSubmit={onSubmit}>
        <Input
          id='ref1'
          label='Referencia 1'
          type='text'
          name='ref1'
          minLength='1'
          maxLength='25'
          required
          value={datosTrans.ref1}
          autoComplete='off'
          onInput={(e) => {
            let valor = e.target.value;
            let num = valor.replace(/[\s\.\-+eE]/g, "");
            if (!isNaN(num)) {
              setDatosTrans((old) => {
                return { ...old, ref1: num };
              });
            }
          }}></Input>
        {convenio?.parciales === "1" && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor a pagar'
            type='text'
            autoComplete='off'
            maxLength={"12"}
            decimalDigits={2}
            defaultValue={datosTrans.valor ?? ""}
            onInput={(ev, val) => {
              setDatosTrans((old) => {
                return { ...old, valor: val };
              });
            }}
            min={0}
            max={enumParametrosGrupoAval.MAX_RECAUDO_AVAL}
            equalError={false}
            equalErrorMin={false}
          />
        )}
        <ButtonBar>
          <Button type='submit'>Realizar consulta</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          {estadoPeticion === 0 ? (
            <>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                Resultado consulta
              </h1>
              <h2>{`Nombre convenio: ${convenio?.convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.nura}`}</h2>
              <h2>{`Referencia 1: ${datosTrans.ref1}`}</h2>
              <h2 className='text-base font-semibold'>
                {`Valor consultado: ${formatMoney.format(
                  datosConsulta?.valorTrx ?? "0"
                )} `}
              </h2>
              {convenio?.parciales === "1" ? (
                <Form
                  grid
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowModal((old) => ({ ...old, estadoPeticion: 3 }));
                  }}>
                  <MoneyInput
                    id='valCashOut'
                    name='valCashOut'
                    label='Valor a pagar'
                    min={enumParametrosGrupoAval.MIN_RECAUDO_AVAL}
                    max={enumParametrosGrupoAval.MAX_RECAUDO_AVAL}
                    type='text'
                    decimalDigits={2}
                    autoComplete='off'
                    maxLength={"12"}
                    defaultValue={datosTrans.valorConst ?? ""}
                    // defaultValue={datosTrans.valorConst ?? ""}
                    onInput={(ev, valMoney) =>
                      setDatosTrans((old) => ({
                        ...old,
                        valorConst: valMoney,
                        valorVar: valMoney,
                      }))
                    }
                    equalError={false}
                    equalErrorMin={false}
                    required></MoneyInput>
                  <ButtonBar>
                    <Button
                      onClick={() => {
                        notifyError("Transacción cancelada por el usuario");
                        handleClose();
                      }}>
                      Cancelar
                    </Button>
                    <Button type='submit'>Realizar pago</Button>
                  </ButtonBar>
                </Form>
              ) : (
                <>
                  <ButtonBar>
                    <Button
                      onClick={() => {
                        notifyError("Transacción cancelada por el usuario");
                        handleClose();
                      }}>
                      Cancelar
                    </Button>
                    <Button
                      type='submit'
                      onClick={(e) => {
                        e.preventDefault();
                        setShowModal((old) => ({ ...old, estadoPeticion: 3 }));
                      }}>
                      Realizar pago
                    </Button>
                  </ButtonBar>
                </>
              )}
            </>
          ) : estadoPeticion === 3 ? (
            <>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                ¿Está seguro de realizar el recaudo?
              </h1>
              <h2>{`Nombre convenio: ${convenio?.convenio}`}</h2>
              <h2>{`Número convenio: ${convenio?.nura}`}</h2>
              <h2>{`Referencia 1: ${datosTrans.ref1}`}</h2>
              <h2 className='text-base font-semibold'>
                {`Valor a pagar: ${formatMoney.format(
                  datosTrans.valorVar ?? "0"
                )} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      notifyError("Transacción cancelada por el usuario");
                      handleClose();
                    }}>
                    Cancelar
                  </Button>
                  <Button type='submit' onClick={onSubmitValidacion}>
                    Realizar pago
                  </Button>
                </ButtonBar>
              </>
            </>
          ) : estadoPeticion === 4 ? (
            <>
              <TicketsAval
                ticket={objTicketActual}
                refPrint={printDiv}></TicketsAval>
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button
                  type='button'
                  onClick={() => {
                    handleClose();
                    navigate(-1);
                  }}>
                  Cerrar
                </Button>
              </ButtonBar>
            </>
          ) : (
            <></>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosAval;
