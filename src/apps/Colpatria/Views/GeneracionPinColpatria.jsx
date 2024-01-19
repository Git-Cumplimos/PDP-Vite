import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { useAuth } from "../../../hooks/AuthHooks";
import { useCallback, useMemo, useRef, useState } from "react";
import { notifyError, notifyPending } from "../../../utils/notify";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Modal from "../../../components/Base/Modal";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { enumParametrosColpatria } from "../utils/enumParametrosColpatria";
import Fieldset from "../../../components/Base/Fieldset";
import Select from "../../../components/Base/Select";
import InputSuggestions from "../../../components/Base/InputSuggestions";
import { MUNICIPIOS_SIIAN } from "../../CreditoFacilPdp/enumDataLocalizacionCredito";
import { useFetchcolpatria } from "../hooks/fetchColpatria";
import TicketColpatria from "../components/TicketColpatria";
import { useReactToPrint } from "react-to-print";

const URL_GENERACION_PIN = `${process.env.REACT_APP_URL_COLPATRIA}/soap/generacion-pin-pago`;
const URL_CONSULTA_GENERACION_PIN = `${process.env.REACT_APP_URL_COLPATRIA}/soap/consulta-estado-generacion-pin-pago`;

const DATA_INICIAL_PIN = {
  referencia_1: "",
  num_identificacion_cliente: "",
  tipo_doc_cliente: "C",
  tipo_doc_beneficiario: "C",
  num_identificacion_beneficiario: "",
  fec_expedicion_beneficiario: "",
  num_identificacion_comprador: "",
  tipo_doc_comprador: "C",
  fec_expedicion_comprador: "",
  codigo_convenio: "",
  codigo_pin: "",
  cod_ciudad_transaccion: "",
  nombre_comprador: "",
  apellidos_comprador: "",
  dir_domicilio_ppal: "",
  tel_fijo_comprador: "",
  num_cel_comprador: "",
  cod_ciudad_domicilio: "",
  email_comprador: "",
  razon_social: "",
  valorPin: 0,
};

const DATA_TIPO_ID = {
  "CEDULA CIUDADANIA": "C",
  "CEDULA EXTRANJERIA": "CE",
  PASAPORTE: "P",
};

const GeneracionPinColpatria = () => {
  const uniqueId = v4();
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [dataUsuario, setDataUsuario] = useState(DATA_INICIAL_PIN);
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [filterData, setFilterData] = useState({
    cod_ciudad_domicilio: "",
  });
  const [showModal, setShowModal] = useState(false);
  const dataMunicipio = useMemo(() => {
    let filteredList = MUNICIPIOS_SIIAN.filter((item) =>
      item.Nombre.toUpperCase().includes(filterData.cod_ciudad_domicilio)
    );
    filteredList = filteredList.slice(0, 10);
    return {
      dataRender: filteredList.map((data, index) => (
        <h1 className="py-2">{data.Nombre}</h1>
      )),
      dataList: filteredList,
    };
  }, [filterData.cod_ciudad_domicilio]);
  const [loadingPeticionGeneracionPin, peticionGeneracionPin] =
    useFetchcolpatria(
      URL_GENERACION_PIN,
      URL_CONSULTA_GENERACION_PIN,
      "Generación pin"
    );
  const handleClose = useCallback(() => {
    setShowModal(false);
    validNavigate(-1);
  }, []);
  const generatePin = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataUsuario?.valorPin,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        colpatria: {
          referencia_1: dataUsuario.referencia_1,
          num_identificacion_cliente: dataUsuario.num_identificacion_cliente,
          tipo_doc_cliente: dataUsuario.tipo_doc_cliente,
          tipo_doc_beneficiario: dataUsuario.tipo_doc_beneficiario,
          num_identificacion_beneficiario:
            dataUsuario.num_identificacion_beneficiario,
          fec_expedicion_beneficiario:
            dataUsuario.fec_expedicion_beneficiario.replaceAll("-", ""),
          num_identificacion_comprador:
            dataUsuario.num_identificacion_comprador,
          tipo_doc_comprador: dataUsuario.tipo_doc_comprador,
          fec_expedicion_comprador:
            dataUsuario.fec_expedicion_comprador.replaceAll("-", ""),
          codigo_convenio: dataUsuario.codigo_convenio,
          codigo_pin: dataUsuario.codigo_pin,
          cod_ciudad_transaccion: roleInfo?.codigo_dane.slice(-3),
          nombre_comprador: dataUsuario.nombre_comprador,
          apellidos_comprador: dataUsuario.apellidos_comprador,
          dir_domicilio_ppal: dataUsuario.dir_domicilio_ppal,
          tel_fijo_comprador: dataUsuario.tel_fijo_comprador,
          num_cel_comprador: dataUsuario.num_cel_comprador,
          cod_ciudad_domicilio: dataUsuario.cod_ciudad_domicilio,
          email_comprador: dataUsuario.email_comprador,
          razon_social: dataUsuario.razon_social,
          location: {
            address: roleInfo?.["direccion"],
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.["ciudad"],
          },
        },
      };
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionGeneracionPin(data, dataAditional),
        {
          render: () => {
            return "Procesando generación de pin";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(1);
            return "Generación pin satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            validNavigate(-1);
            return error?.message ?? "Generación fallida";
          },
        }
      );
    },
    [dataUsuario, validNavigate, roleInfo, pdpUser]
  );

  const handleShow = useCallback(
    (ev) => {
      ev.preventDefault();
      if (dataUsuario.cod_ciudad_domicilio === "")
        return notifyError("Seleccione la ciudad en la que se crea el pin");
      setEstadoPeticion(0);
      setShowModal(true);
    },
    [dataUsuario.cod_ciudad_domicilio]
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataUsuario((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeFormatNumber = useCallback(
    (ev) => {
      const valor = ev.target.value;
      const num = valor.replace(/[\s\.\-+eE]/g, "");
      if (!isNaN(num)) {
        if (ev.target.name === "num_cel_comprador") {
          if (dataUsuario.num_cel_comprador.length === 0 && num !== "3") {
            return notifyError("El número de celular debe comenzar por 3");
          }
        }
        setDataUsuario((old) => {
          return { ...old, [ev.target.name]: num };
        });
      }
    },
    [dataUsuario.num_cel_comprador]
  );
  const onSelectSuggestion = useCallback(
    (i, el, name) => {
      if (name === "cod_ciudad_domicilio") {
        let dataMuni = dataMunicipio.dataList[i];
        setDataUsuario((old) => {
          return { ...old, [name]: dataMuni.Id };
        });
        setFilterData((old) => {
          return {
            ...old,
            [name]: dataMuni.Nombre,
          };
        });
      }
    },
    [dataMunicipio]
  );
  return (
    <>
      <h1 className="text-3xl">Generación de Pin</h1>
      <Form onSubmit={handleShow} grid>
        <Fieldset legend="Datos del Pin" className="lg:col-span-2">
          <Input
            id="referencia_1"
            name="referencia_1"
            label={"Referencia 1"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["referencia_1"]}
            maxLength={19}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="codigo_convenio"
            name="codigo_convenio"
            label={"Código convenio"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["codigo_convenio"]}
            maxLength={6}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="codigo_pin"
            name="codigo_pin"
            label={"Código pin"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["codigo_pin"]}
            maxLength={4}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="razon_social"
            name="razon_social"
            label={"Razon social"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["razon_social"]}
            maxLength={50}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <InputSuggestions
            id="cod_ciudad_domicilio"
            name="cod_ciudad_domicilio"
            label={"Ciudad"}
            type="search"
            autoComplete="off"
            suggestions={dataMunicipio.dataRender || []}
            onSelectSuggestion={(i, el) =>
              onSelectSuggestion(i, el, "cod_ciudad_domicilio")
            }
            value={filterData.cod_ciudad_domicilio || ""}
            onChange={(e) => {
              setFilterData((old) => ({
                ...old,
                cod_ciudad_domicilio: e.target.value.toUpperCase(),
              }));
            }}
            maxLength={50}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <MoneyInput
            id="valor"
            name="valor"
            label="Valor a recargar"
            type="text"
            min={enumParametrosColpatria.MINGENERACIONPIN}
            max={enumParametrosColpatria.MAXGENERACIONPIN}
            autoComplete="off"
            maxLength={"10"}
            value={parseInt(dataUsuario?.valorPin)}
            required
            disabled={loadingPeticionGeneracionPin}
            onInput={(e, monto) => {
              if (!isNaN(monto)) {
                setDataUsuario((old) => {
                  return { ...old, valorPin: monto };
                });
              }
            }}
            equalError={false}
            equalErrorMin={false}
          />
        </Fieldset>
        <Fieldset legend="Datos del cliente" className="lg:col-span-2">
          <Select
            id="tipo_doc_cliente"
            name="tipo_doc_cliente"
            label="Tipo documento"
            options={DATA_TIPO_ID}
            value={dataUsuario?.["tipo_doc_cliente"]}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="num_identificacion_cliente"
            name="num_identificacion_cliente"
            label={"Identificación cliente"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["num_identificacion_cliente"]}
            maxLength={17}
            minLength={1}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionGeneracionPin}
          />
        </Fieldset>
        <Fieldset legend="Datos del beneficiario" className="lg:col-span-2">
          <Select
            id="tipo_doc_beneficiario"
            name="tipo_doc_beneficiario"
            label="Tipo documento beneficiario"
            options={DATA_TIPO_ID}
            value={dataUsuario?.["tipo_doc_beneficiario"]}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="num_identificacion_beneficiario"
            name="num_identificacion_beneficiario"
            label={"Identificación beneficiario"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["num_identificacion_beneficiario"]}
            maxLength={19}
            minLength={1}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="fec_expedicion_beneficiario"
            name="fec_expedicion_beneficiario"
            label={"Fecha expedición beneficiario"}
            type="date"
            autoComplete="off"
            value={dataUsuario?.["fec_expedicion_beneficiario"]}
            maxLength={20}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
        </Fieldset>
        <Fieldset legend="Datos del comprador" className="lg:col-span-2">
          <Input
            id="nombre_comprador"
            name="nombre_comprador"
            label={"Nombres comprador"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["nombre_comprador"]}
            maxLength={80}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="apellidos_comprador"
            name="apellidos_comprador"
            label={"Apellidos comprador"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["apellidos_comprador"]}
            maxLength={80}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="email_comprador"
            name="email_comprador"
            label={"Email comprador"}
            type="email"
            autoComplete="off"
            value={dataUsuario?.["email_comprador"]}
            maxLength={80}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="tel_fijo_comprador"
            name="tel_fijo_comprador"
            label={"Telefono fijo comprador"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["tel_fijo_comprador"]}
            maxLength={12}
            minLength={1}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="num_cel_comprador"
            name="num_cel_comprador"
            label={"Celular comprador"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["num_cel_comprador"]}
            maxLength={10}
            minLength={10}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Select
            id="tipo_doc_comprador"
            name="tipo_doc_comprador"
            label="Tipo documento comprador"
            options={DATA_TIPO_ID}
            value={dataUsuario?.["tipo_doc_comprador"]}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="num_identificacion_comprador"
            name="num_identificacion_comprador"
            label={"Identificación comprador"}
            type="text"
            autoComplete="off"
            value={dataUsuario?.["num_identificacion_comprador"]}
            maxLength={19}
            minLength={1}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionGeneracionPin}
          />
          <Input
            id="fec_expedicion_comprador"
            name="fec_expedicion_comprador"
            label={"Fecha expedición comprador"}
            type="date"
            autoComplete="off"
            value={dataUsuario?.["fec_expedicion_comprador"]}
            maxLength={20}
            minLength={1}
            onChange={onChangeFormat}
            required
            disabled={loadingPeticionGeneracionPin}
          />
        </Fieldset>
        <ButtonBar className="lg:col-span-2">
          <Button
            type="button"
            onClick={() => {
              validNavigate(-1);
            }}
            disabled={loadingPeticionGeneracionPin}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loadingPeticionGeneracionPin}>
            Generar pin
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} className="flex align-middle">
        <>
          {estadoPeticion === 0 ? (
            <PaymentSummary
              title="¿Está seguro de generar el pin?"
              subtitle="Resumen de transacción"
              summaryTrx={{
                "Referencia 1": dataUsuario?.referencia_1,
                "Código convenio": dataUsuario?.codigo_convenio,
                "Código pin": dataUsuario?.codigo_pin,
                "Código ciudad": roleInfo?.codigo_dane,
                "Razon social": dataUsuario?.razon_social,
                "Identificación cliente":
                  dataUsuario?.num_identificacion_cliente,
                "Identificación beneficiario":
                  dataUsuario?.num_identificacion_beneficiario,
                "Fecha expedición beneficiario":
                  dataUsuario?.fec_expedicion_beneficiario,
                "Identificación comprador":
                  dataUsuario?.num_identificacion_comprador,
                "fecha expedición comprador":
                  dataUsuario?.fec_expedicion_comprador,
                "Nombre comprador": dataUsuario?.nombre_comprador,
                "Apellido comprador": dataUsuario?.apellidos_comprador,
                Dirección: roleInfo?.["direccion"],
                "telefono fijo comprador": dataUsuario?.tel_fijo_comprador,
                "Celular comprador": dataUsuario?.num_cel_comprador,
                "Email comprador": dataUsuario?.email_comprador,
                "Código ciudad domicilio": dataUsuario?.cod_ciudad_domicilio,
                "Valor del pin": formatMoney.format(dataUsuario?.valorPin),
              }}
            >
              <ButtonBar>
                <Button
                  onClick={() => {
                    notifyError("Transacción cancelada por el usuario");
                    handleClose();
                  }}
                  disabled={loadingPeticionGeneracionPin}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={generatePin}
                  disabled={loadingPeticionGeneracionPin}
                >
                  Generar pin
                </Button>
              </ButtonBar>
            </PaymentSummary>
          ) : estadoPeticion === 1 ? (
            <div className="flex flex-col justify-center items-center">
              <TicketColpatria ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    Aceptar
                  </Button>
                </ButtonBar>
              </h2>
            </div>
          ) : (
            <></>
          )}
        </>
      </Modal>
    </>
  );
};

export default GeneracionPinColpatria;
