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
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import Modal from "../../../../../components/Base/Modal";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { useAuth } from "../../../../../hooks/AuthHooks";
import useQuery from "../../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../../utils/notify";
import {
  postConsultaConveniosDavivienda,
  postConsultaTablaConveniosEspecifico,
} from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivados = () => {
  const { state } = useLocation();
  const { roleInfo } = useAuth();
  const [{ showModal, estadoPeticion }, setShowModal] = useState({
    showModal: false,
    estadoPeticion: 0,
  });
  const [datosTrans, setDatosTrans] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
  const [datosTransValidacion, setDatosTransValidacion] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
  const [isUploading, setIsUploading] = useState(true);
  const [convenio, setConvenio] = useState([]);

  useEffect(() => {
    fecthTablaConveniosEspecificoFunc();
  }, [state?.id]);

  const fecthTablaConveniosEspecificoFunc = () => {
    postConsultaTablaConveniosEspecifico({
      pk_tbl_transaccional_convenios_davivienda_cb: state?.id,
    })
      .then((autoArr) => {
        setConvenio(autoArr?.results[0]);
        console.log(autoArr?.results[0]);
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
    setShowModal((old) => ({ ...old, showModal: true }));
  };
  const onSubmitValidacion = (e) => {
    e.preventDefault();
    if (convenio?.ctrol_ref1_cnb === "1") {
      if (datosTrans.ref1 !== datosTransValidacion.ref1)
        return notifyError("Los datos ingresados son diferentes");
    }
    if (convenio?.ctrol_ref2_cnb === "1") {
      if (datosTrans.ref2 !== datosTransValidacion.ref2)
        return notifyError("Los datos ingresados son diferentes");
    }
    if (
      convenio?.num_ind_consulta_cnb === "0" ||
      convenio?.num_ind_consulta_cnb === "3"
    ) {
      if (datosTrans.valor !== datosTransValidacion.valor) {
        return notifyError("El valor ingresado es diferente");
      }
      console.log("realizar pago");
    } else {
      setIsUploading(true);
      postConsultaConveniosDavivienda({
        tipoTransaccion: "2",
        numNumeroConvenioIAC: convenio.cod_convenio_cnb,
        valReferencia1: datosTransValidacion?.ref1 ?? "",
        valReferencia2: datosTransValidacion?.ref2 ?? "",

        idComercio: roleInfo?.id_comercio,
        idUsuario: roleInfo?.id_usuario,
        idTerminal: roleInfo?.id_dispositivo,
        issuerIdDane: roleInfo?.codigo_dane,
        nombreComercio: roleInfo?.["nombre comercio"],
        municipio: roleInfo?.["ciudad"],
        oficinaPropia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ? true : false,
      })
        .then((res) => {
          if (res?.status) {
            setIsUploading(false);
            notify(res?.msg);
          } else {
            setIsUploading(false);
            notifyError(res?.msg);
            handleClose();
          }
        })
        .catch((err) => {
          setIsUploading(false);
          notifyError("No se ha podido conectar al servidor");
          console.error(err);
        });
    }
  };
  const handleClose = useCallback(() => {
    setDatosTransValidacion((old) => ({
      ...old,
      ref1: "",
      ref2: "",
      valor: "",
    }));
    setShowModal((old) => ({ ShowModal: false, estadoPeticion: 0 }));
  }, []);
  const onChangeMoney = (ev, valor) => {
    if (!isNaN(valor)) {
      const num = valor;
      setDatosTrans((old) => {
        return { ...old, valor: num };
      });
    }
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center mb-5'>
        Recaudo servicios publicos y privados
      </h1>
      <h1 className='text-3xl text-center mb-5'>{`Convenio: ${
        convenio?.nom_convenio_cnb ?? ""
      }`}</h1>

      <Form grid onSubmit={onSubmit}>
        {convenio?.ctrol_ref1_cnb === "1" && (
          <>
            <Input
              id='ref1'
              label={convenio?.nom_ref1_cnb}
              type='text'
              name='ref1'
              minLength='4'
              maxLength='32'
              required
              value={datosTrans.ref1}
              onInput={(e) => {
                setDatosTrans((old) => {
                  return { ...old, ref1: e.target.value };
                });
              }}></Input>
          </>
        )}
        {convenio?.ctrol_ref2_cnb === "1" && (
          <Input
            id='ref2'
            label={convenio?.nom_ref2_cnb}
            type='text'
            name='ref2'
            minLength='4'
            maxLength='32'
            required
            value={datosTrans.ref2}
            onInput={(e) => {
              setDatosTrans((old) => {
                return { ...old, ref2: e.target.value };
              });
            }}></Input>
        )}
        {(convenio?.num_ind_consulta_cnb === "0" ||
          convenio?.num_ind_consulta_cnb === "3") && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={onChangeMoney}
            required></MoneyInput>
        )}
        {(convenio?.num_ind_consulta_cnb === "0" ||
          convenio?.num_ind_consulta_cnb === "3") && (
          <MoneyInput
            id='valCashOut'
            name='valCashOut'
            label='Valor'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={onChangeMoney}
            required></MoneyInput>
        )}
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {convenio?.num_ind_consulta_cnb === "0" ||
            convenio?.num_ind_consulta_cnb === "3"
              ? "Realizar pago"
              : "Realizar consulta"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        {estadoPeticion === 0 ? (
          <>
            <h1 className='text-2xl text-center mb-10'>
              Ingrese nuevamente los datos de la transacción
            </h1>
            <Form grid onSubmit={onSubmitValidacion}>
              {convenio?.ctrol_ref1_cnb === "1" && (
                <>
                  <Input
                    id='ref1'
                    label={convenio?.nom_ref1_cnb}
                    type='text'
                    name='ref1'
                    minLength='4'
                    maxLength='32'
                    required
                    value={datosTransValidacion.ref1}
                    onInput={(e) => {
                      setDatosTransValidacion((old) => {
                        return { ...old, ref1: e.target.value };
                      });
                    }}></Input>
                </>
              )}
              {convenio?.ctrol_ref2_cnb === "1" && (
                <Input
                  id='ref2'
                  label={convenio?.nom_ref2_cnb}
                  type='text'
                  name='ref2'
                  minLength='4'
                  maxLength='32'
                  required
                  value={datosTransValidacion.ref2}
                  onInput={(e) => {
                    setDatosTransValidacion((old) => {
                      return { ...old, ref2: e.target.value };
                    });
                  }}></Input>
              )}
              {(convenio?.num_ind_consulta_cnb === "0" ||
                convenio?.num_ind_consulta_cnb === "3") && (
                <MoneyInput
                  id='valCashOut'
                  name='valCashOut'
                  label='Valor'
                  type='text'
                  autoComplete='off'
                  maxLength={"15"}
                  value={datosTransValidacion.valor ?? ""}
                  onInput={(e, valor) => {
                    if (!isNaN(valor)) {
                      const num = valor;
                      setDatosTransValidacion((old) => {
                        return { ...old, valor: num };
                      });
                    }
                  }}
                  required></MoneyInput>
              )}
              <ButtonBar className='lg:col-span-2'>
                <Button type='button' onClick={handleClose}>
                  cancelar
                </Button>
                <Button type='submit'>
                  {convenio?.num_ind_consulta_cnb === "0" ||
                  convenio?.num_ind_consulta_cnb === "3"
                    ? "Realizar pago"
                    : "Realizar consulta"}
                </Button>
              </ButtonBar>
            </Form>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default RecaudoServiciosPublicosPrivados;
