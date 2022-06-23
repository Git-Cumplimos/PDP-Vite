import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/AuthHooks";
import { notifyError } from "../../../utils/notify";
import Tickets from "../../../components/Base/Tickets";
import { useReactToPrint } from "react-to-print";
import Select from "../../../components/Base/Select";
import { useNavigate } from "react-router-dom";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const CrearPin = () => {
  const navigate = useNavigate();

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const { crearPinVus, con_estado_tipoPin, consultaTramite } = usePinesVus();
  const { infoTicket } = useAuth();

  const { roleInfo } = useAuth();
  const [documento, setDocumento] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [respPin, setRespPin] = useState("");
  const [optionsTipoPines, setOptionsTipoPines] = useState([]);
  const [tipoPin, setTipoPin] = useState("");
  const [optionsTramites, setOptionsTramites] = useState([]);
  const [tramite, setTramite] = useState("")

  useEffect(() => {
    con_estado_tipoPin("tipo_pines_vus")
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setOptionsTipoPines(res?.obj?.results);
        }
      })
      .catch(() => setDisabledBtns(false));
    
      consultaTramite()
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setOptionsTramites(res?.obj?.results);
        }
      })
      .catch(() => setDisabledBtns(false));
  }, []);

  const pinData = useMemo(() => {
    const resp = optionsTipoPines?.filter((id) => id.id === tipoPin);
    const pinData = {
      descripcion : resp[0]?.descripcion.toUpperCase(),
      valor : resp[0]?.valor,
      iva : resp[0]?.iva,
      total : resp[0]?.valor + resp[0]?.iva
    }
    return pinData;
  }, [optionsTipoPines, tipoPin]);

  const tramiteData = useMemo(() => {
    const resp = optionsTramites?.filter((id) => id.id === tramite);
    const tramiteData = {
      descripcion : resp[0]?.descripcion.toUpperCase(),
      valor : resp[0]?.valor,
      iva : resp[0]?.iva,
      total : resp[0]?.valor + resp[0]?.iva
    }
    return tramiteData;
  }, [optionsTramites, tramite]);

  console.log(tramiteData)
  const user = useMemo(() => {
    return {
      Tipo: roleInfo?.tipo_comercio,
      Usuario: roleInfo?.id_usuario,
      Dispositivo: roleInfo?.id_dispositivo,
      Comercio: roleInfo?.id_comercio,
      Depto: roleInfo?.codigo_dane?.slice(0, 2),
      Municipio: roleInfo?.codigo_dane?.slice(2),
      nombre_comercio: roleInfo?.["nombre comercio"],
    };
  }, [roleInfo]);

  const onSubmitModal = (e) => {
    e.preventDefault();
    setShowModal(true)
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    crearPinVus(documento, tipoPin, tramite,user)
      .then((res) => {
        setDisabledBtns(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setRespPin(res?.obj);
          setShowModal(true);
          setDisabledBtns(false);
          setShowModal(true);
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtns(false);
    setDocumento("");
    setRespPin("");
    setTipoPin("");
    navigate(-1);
  }, []);

  const tickets = useMemo(() => {
    const total = (respPin?.valor_total) + tramiteData?.total
    return {
      title: "Recibo de pago: " + tramiteData?.descripcion,
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": respPin?.transacciones_id_trx?.creacion,
      }),
      commerceName: pinData.descripcion,
      trxInfo: [
        ["Proceso", "Creación de Pin"],
        ["Codigo", respPin?.cod_hash_pin],
        ["Vence", respPin?.fecha_vencimiento],
        ["Valor Tramite", formatMoney.format(tramiteData?.valor)],
        ["Iva Tramite",formatMoney.format(tramiteData?.iva)],
        ["Valor Pin", formatMoney.format(respPin?.valor)],
        ["Iva Pin",formatMoney.format(respPin?.valor_iva)],
        ["Total", formatMoney.format(total)],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [roleInfo, respPin, pinData, tramiteData]);

  useEffect(() => {
    infoTicket(
      respPin?.transacciones_id_trx?.creacion,
      respPin?.tipo_trx,
      tickets
    );
  }, [infoTicket, respPin, tickets]);
  return (
    <>
      <h1 className="text-3xl">Datos creación de Pin</h1>
      <Form onSubmit={onSubmitModal} grid>
        <Input
          id="numDocumento"
          label="Documento"
          type="text"
          required
          minLength="5"
          maxLength="12"
          autoComplete="off"
          value={documento}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setDocumento(num);
          }}
        />
        <Select
          id="tipoPin"
          label="Tipo Pin"
          options={
            Object.fromEntries([
              ["", ""],
              ...optionsTipoPines?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tipoPin}
          required={true}
          onChange={(e) => {
            setTipoPin(parseInt(e.target.value) ?? "");
          }}
        />
        <Select
          className="place-self-stretch"
          id="tramite"
          label="Tramite"
          options={
            Object.fromEntries([
              ["", ""],
              ...optionsTramites?.map(({ descripcion, id }) => {
                return [descripcion, id];
              }),
            ]) || { "": "" }
          }
          value={tramite}
          required={true}
          onChange={(e) => {
            setTramite(parseInt(e.target.value) ?? "");
          }}
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Crear pin
          </Button>
        </ButtonBar>
      </Form>

      <Modal show={showModal} handleClose={() => closeModal()}>
        {respPin !== ""? 
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={tickets} />
          <ButtonBar>
            <Button
              onClick={() => {
                handlePrint();
              }}
            >
              Imprimir
            </Button>
            <Button
              onClick={() => {
                closeModal();
              }}
            >
              Cerrar
            </Button>
          </ButtonBar>
        </div>
        :
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col w-1/2 mx-auto">
            <h1 className="text-3xl mt-3 mx-auto">Crear Pin</h1>
            <br></br>
            <h1 className="flex flex-row justify-center text-lg font-medium">{tramiteData.descripcion}</h1>
            <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Tramite</h1>
                <h1>{formatMoney.format(tramiteData.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVa Tramite</h1>
                <h1>{formatMoney.format(tramiteData.iva)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Pin</h1>
                <h1>{formatMoney.format(pinData.valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVa Pin</h1>
                <h1>{formatMoney.format(pinData.iva)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                <h1>{formatMoney.format(pinData.total + tramiteData.total)}</h1>
              </div>
            </>
            {/* {Object.entries(tramiteData).map(([key, val]) => {
              return (
                <>
                  <div
                    className="flex flex-row justify-between text-lg font-medium"
                    key={key}
                  >
                    <h1>{key}</h1>
                    <h1>{val}</h1>
                  </div>
                </>
              );
            })} */}
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmit}>
                <ButtonBar>
                  <Button type="submit">
                    Crear Pin
                  </Button>
                  <Button
                    onClick={() => {
                      closeModal();
                      // setrespPago();
                      // getQuota();
                    }}
                  >
                    Cerrar
                  </Button>
                </ButtonBar>
              </Form>
            </div>
          </div>
        </div>
        
        
        }
        
      </Modal>
    </>
  );
};
export default CrearPin;
