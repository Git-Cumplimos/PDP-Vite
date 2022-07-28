import { Fragment, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Form from "../../../../../components/Base/Form";
import Input from "../../../../../components/Base/Input";
import MoneyInputDec from "../../../../../components/Base/MoneyInputDec";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../../../utils/notify";
import { postConsultaCodigoBarrasConveniosEspecifico } from "../../utils/fetchRecaudoServiciosPublicosPrivados";

const RecaudoServiciosPublicosPrivadosLecturaCodigoBarras = () => {
  const [showModal, setShowModal] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    codBarras: "",
  });
  const [datosEnvio, setDatosEnvio] = useState({
    datosCodigoBarras: {},
    datosConvenio: {},
    estadoConsulta: false,
    estadoFecha: false,
  });
  const [datosTransaccion, setDatosTransaccion] = useState({
    ref1: "",
    ref2: "",
    valor: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const onChangeFormat = useCallback((ev) => {
    const valor = ev.target.value;
    setDatosTrans((old) => {
      return { ...old, [ev.target.name]: valor };
    });
    if (valor.slice(0, 4) === "C281") {
      setIsUploading(true);
      fecthTablaConveniosEspecificoFunc(valor);
    }
  }, []);

  const fecthTablaConveniosEspecificoFunc = useCallback((codigoBar) => {
    postConsultaCodigoBarrasConveniosEspecifico({
      codigoBarras: codigoBar,
    })
      .then((autoArr) => {
        if (autoArr?.status) {
          notify(autoArr?.msg);
          console.log(autoArr);
          let dateStatus = false;
          if (
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
            datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 &&
            datosEnvio?.datosConvenio[0]?.val_fecha_lim_cnb === "1"
          ) {
            const dateVenc = new Date(
              datosEnvio?.datosCodigoBarras?.fechaCaducidad[0]
            );
            dateVenc.setHours(dateVenc.getHours() + 5);
            const dateActual = new Date();
            if (dateActual.getTime() > dateVenc.getTime()) {
              dateStatus = true;
              notifyError("Se ha vencido el pago");
            }
          }
          setDatosEnvio({
            datosCodigoBarras: autoArr?.obj.datosCodigoBarras,
            datosConvenio: autoArr?.obj.datosConvenio[0],
            estadoConsulta: true,
            estadoFecha: dateStatus,
          });
        } else {
          notifyError(autoArr?.msg);
        }
        setIsUploading(false);
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  }, []);
  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     console.log("do validate");
  //   }
  // };
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans?.codBarras.slice(0, 4) === "C281") {
      setIsUploading(true);
      fecthTablaConveniosEspecificoFunc(datosTrans?.codBarras);
    } else {
      notifyError("El codigo de barras no tiene el formato correcto");
    }
  };
  const onSubmitPago = (e) => {
    e.preventDefault();
    if (
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
      datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
    ) {
      console.log("realizar pago");
    } else {
      console.log("realizar consulta");
    }
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        Recaudo servicios publicos y privados
      </h1>
      {!datosEnvio.estadoConsulta ? (
        <>
          <h1 className='text-3xl text-center'>Ingrese el código de barras</h1>
          <Form grid onSubmit={onSubmit}>
            <Input
              id='codBarras'
              label='Código de barras'
              type='text'
              name='codBarras'
              required
              value={datosTrans.codBarras}
              autoFocus
              autoComplete='off'
              onInput={onChangeFormat}
              // onKeyDown={handleKeyDown}
            ></Input>
            <ButtonBar className='lg:col-span-2'>
              <Button type='submit'>Realizar consulta</Button>
            </ButtonBar>
          </Form>
        </>
      ) : (
        <>
          <h1 className='text-3xl text-center'>{`Convenio: ${
            datosEnvio?.datosConvenio?.nom_convenio_cnb ?? ""
          }`}</h1>
          <Form grid onSubmit={onSubmitPago}>
            {datosEnvio?.datosConvenio?.ctrol_ref1_cnb === "1" && (
              <>
                <Input
                  id='ref1'
                  label={datosEnvio?.datosConvenio?.nom_ref1_cnb}
                  type='text'
                  name='ref1'
                  minLength='32'
                  maxLength='32'
                  disabled={true}
                  value={
                    datosEnvio.datosCodigoBarras.codigosReferencia[0] ?? ""
                  }
                  onInput={(e) => {
                    setDatosTransaccion((old) => {
                      return { ...old, ref1: e.target.value };
                    });
                  }}></Input>
              </>
            )}
            {datosEnvio?.datosConvenio?.ctrol_ref2_cnb === "1" && (
              <Input
                id='ref2'
                label={datosEnvio?.datosConvenio?.nom_ref2_cnb}
                type='text'
                name='ref2'
                minLength='32'
                maxLength='32'
                disabled={true}
                value={datosEnvio.datosCodigoBarras.codigosReferencia[1] ?? ""}
                onInput={(e) => {
                  // setDatosTransaccion((old) => {
                  //   return { ...old, ref2: e.target.value };
                  // });
                }}></Input>
            )}
            {datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length &&
              datosEnvio?.datosCodigoBarras?.fechaCaducidad?.length > 0 && (
                <Input
                  id='ref2'
                  label='Fecha de caducidad'
                  type='text'
                  name='ref2'
                  minLength='32'
                  maxLength='32'
                  disabled={true}
                  value={datosEnvio.datosCodigoBarras.fechaCaducidad[0] ?? ""}
                  onInput={(e) => {
                    // setDatosTransaccion((old) => {
                    //   return { ...old, ref2: e.target.value };
                    // });
                  }}></Input>
              )}
            {(datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
              datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3") && (
              <MoneyInputDec
                id='valCashOut'
                name='valCashOut'
                label='Valor a pagar en '
                type='text'
                autoComplete='off'
                maxLength={"15"}
                disabled={true}
                value={datosEnvio.datosCodigoBarras.pago[0] ?? ""}
                onInput={(e, valor) => {
                  if (!isNaN(valor)) {
                    const num = valor;
                    // setDatosTransaccion((old) => {
                    //   return { ...old, valor: num };
                    // });
                  }
                }}
                required></MoneyInputDec>
            )}
            <ButtonBar className='lg:col-span-2'>
              <Button
                type='button'
                onClick={() => {
                  setDatosEnvio({
                    datosCodigoBarras: {},
                    datosConvenio: {},
                    estadoConsulta: false,
                  });
                  setDatosTrans({ codBarras: "" });
                }}>
                Volver a ingresar codigo de barras
              </Button>
              {!datosEnvio.estadoFecha && (
                <Button type='submit'>
                  {datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "0" ||
                  datosEnvio?.datosConvenio?.num_ind_consulta_cnb === "3"
                    ? "Realizar pago"
                    : "Realizar consulta"}
                </Button>
              )}
            </ButtonBar>
          </Form>
        </>
      )}
    </>
  );
};

export default RecaudoServiciosPublicosPrivadosLecturaCodigoBarras;
