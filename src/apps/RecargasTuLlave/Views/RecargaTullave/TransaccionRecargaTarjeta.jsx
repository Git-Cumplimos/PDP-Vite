import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosTuLlave } from "../../utils/enumParametrosTuLlave";
import { useReactToPrint } from "react-to-print";
import Select from "../../../../components/Base/Select/Select";
import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useFetchTuLlave } from "../../hooks/fetchTuLlave";
import useMoney from "../../../../hooks/useMoney";

const URL_REALIZAR_RECARGA_TARJETA = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/recarga-tarjeta`;
const URL_CONSULTAR_RECARGA_TARJETA = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/consulta-recarga-tarjeta`;

const TransaccionRecargaTarjeta = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const optionsTipoDocumento = [
    { value: "", label: "" },
    { value: "1", label: "Cédula de ciudadanía" },
    { value: "2", label: "Cédula de extranjería" },
    { value: "4", label: "Número único de identificación" },
    { value: "5", label: "Tarjeta de identidad" },
    { value: "6", label: "Pasaporte" },
  ];
  const [dataUsuario, setDataUsuario] = useState({
    NTargeta: "",
    valorRecarga: 0,
    nombresCliente: "",
    apellidosCliente: "",
    telefonoCliente: "",
    emailCliente: "",
    tipoDocumentoId: "",
    tipoDocumento: "",
    documento: "",
  });
  const [estadoPeticion, setEstadoPeticion] = useState(0);
  const [objTicketActual, setObjTicketActual] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(-1);
  }, []);
  const makeRecharge = useCallback(
    (ev) => {
      ev.preventDefault();
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: dataUsuario?.valorRecarga,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          id_uuid_trx: uniqueId,
        },
        location: {
          address: roleInfo?.["direccion"],
          dane_code: roleInfo?.codigo_dane,
          city: roleInfo?.["ciudad"],
        },
        recarga_tarjeta: {
          numero_tarjeta: dataUsuario?.NTargeta,
        },
      };
      if (dataUsuario?.nombresCliente !== "")
        data["recarga_tarjeta"]["nombres_cliente"] =
          dataUsuario?.nombresCliente;
      if (dataUsuario?.apellidosCliente !== "")
        data["recarga_tarjeta"]["apellidos_cliente"] =
          dataUsuario?.apellidosCliente;
      if (dataUsuario?.telefonoCliente !== "")
        data["recarga_tarjeta"]["telefono_cliente"] =
          dataUsuario?.telefonoCliente;
      if (dataUsuario?.emailCliente !== "")
        data["recarga_tarjeta"]["email_cliente"] = dataUsuario?.emailCliente;
      if (dataUsuario?.tipoDocumentoId !== "")
        data["recarga_tarjeta"]["tipo_id_cliente"] =
          dataUsuario?.tipoDocumentoId;
      if (dataUsuario?.documento !== "")
        data["recarga_tarjeta"]["id_cliente"] = dataUsuario?.documento;
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionRecargaTarjeta(data, dataAditional),
        {
          render: () => {
            return "Procesando recarga";
          },
        },
        {
          render: ({ data: res }) => {
            setObjTicketActual(res?.obj?.ticket);
            setEstadoPeticion(1);
            return "Recarga satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            navigate(-1);
            return error?.message ?? "Recarga fallida";
          },
        }
      );
    },
    [dataUsuario, navigate, roleInfo, pdpUser]
  );
  const [loadingPeticionRecargaTarjeta, peticionRecargaTarjeta] =
    useFetchTuLlave(
      URL_REALIZAR_RECARGA_TARJETA,
      URL_CONSULTAR_RECARGA_TARJETA,
      "Realizar recarga tarjeta"
    );
  const handleShow = useCallback(
    (ev) => {
      ev.preventDefault();
      // if (valor % 50 !== 0) {
      //   return notifyError("El valor de la recarga debe ser multiplo de 50");
      // }
      setEstadoPeticion(0);
      setShowModal(true);
    },
    [dataUsuario]
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback(
    (ev) => {
      const valor = ev.target.value;
      let num = valor.replace(/[\s\.]/g, "");
      if (!isNaN(num)) {
        if (ev.target.name === "telefonoCliente") {
          if (dataUsuario.telefonoCliente.length === 0 && num !== "3") {
            return notifyError("El número de teléfono debe comenzar por 3");
          }
        }
        setDataUsuario((old) => {
          return { ...old, [ev.target.name]: num };
        });
      }
    },
    [dataUsuario.telefonoCliente]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataUsuario((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  const onChangeMoney = useMoney({
    limits: [
      enumParametrosTuLlave.MINRECARGATARJETA,
      enumParametrosTuLlave.MAXRECARGATARJETA,
    ],
    equalError: false,
  });
  return (
    <>
      <h1 className='text-3xl'>Recargar tarjeta Tu Llave</h1>
      <Form onSubmit={handleShow} grid>
        <Fieldset legend='Datos obligatorios' className='lg:col-span-2'>
          <Input
            id='NTargeta'
            name='NTargeta'
            label={"Número tarjeta"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["NTargeta"]}
            maxLength={16}
            onChange={onChangeFormatNumber}
            required
            disabled={loadingPeticionRecargaTarjeta}
          />
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a recargar'
            type='text'
            min={enumParametrosTuLlave.MINRECARGATARJETA}
            max={enumParametrosTuLlave.MAXRECARGATARJETA}
            autoComplete='off'
            maxLength={"11"}
            value={parseInt(dataUsuario?.valorRecarga)}
            onInput={(ev) => {
              setDataUsuario((old) => {
                return { ...old, valorRecarga: onChangeMoney(ev) };
              });
            }}
            required
            disabled={loadingPeticionRecargaTarjeta}
          />
        </Fieldset>
        <Fieldset legend='Datos opcionales' className='lg:col-span-2'>
          <Input
            id='nombresCliente'
            name='nombresCliente'
            label={"Nombres cliente"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["nombresCliente"]}
            maxLength={50}
            onChange={onChangeFormat}
            disabled={loadingPeticionRecargaTarjeta}
          />
          <Input
            id='apellidosCliente'
            name='apellidosCliente'
            label={"Apellidos cliente"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["apellidosCliente"]}
            maxLength={50}
            onChange={onChangeFormat}
            disabled={loadingPeticionRecargaTarjeta}
          />
          <Input
            id='telefonoCliente'
            name='telefonoCliente'
            label={"Teléfono cliente"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["telefonoCliente"]}
            maxLength={15}
            onChange={onChangeFormatNumber}
            disabled={loadingPeticionRecargaTarjeta}
          />
          <Input
            id='emailCliente'
            name='emailCliente'
            label={"Correo cliente"}
            type='email'
            autoComplete='off'
            value={dataUsuario?.["emailCliente"]}
            maxLength={50}
            onChange={onChangeFormat}
            disabled={loadingPeticionRecargaTarjeta}
          />
          <Input
            id='documento'
            name='documento'
            label={"Documento cliente"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["documento"]}
            maxLength={50}
            onChange={onChangeFormatNumber}
            disabled={loadingPeticionRecargaTarjeta}
          />
          <Select
            id='tipoDocumentoId'
            label='Tipo de documento'
            options={optionsTipoDocumento}
            value={dataUsuario?.tipoDocumentoId}
            onChange={(e) => {
              setDataUsuario((old) => ({
                ...old,
                tipoDocumentoId: e.target.value,
                tipoDocumento: e.target[e.target.selectedIndex].text,
              }));
            }}
          />
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}
            disabled={loadingPeticionRecargaTarjeta}>
            Cancelar
          </Button>
          <Button type='submit' disabled={loadingPeticionRecargaTarjeta}>
            Recargar tarjeta
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        <>
          {estadoPeticion === 0 ? (
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                ¿Está seguro de realizar la recarga?
              </h1>
              <h2>{`Número tarjeta: ${dataUsuario?.NTargeta}`}</h2>
              {dataUsuario?.nombresCliente !== "" && (
                <h2>{`Nombres cliente: ${dataUsuario?.nombresCliente}`}</h2>
              )}
              {dataUsuario?.apellidosCliente !== "" && (
                <h2>{`Apellidos cliente: ${dataUsuario?.apellidosCliente}`}</h2>
              )}
              {dataUsuario?.telefonoCliente !== "" && (
                <h2>{`Teléfono cliente: ${dataUsuario?.telefonoCliente}`}</h2>
              )}
              {dataUsuario?.emailCliente !== "" && (
                <h2>{`Correo cliente: ${dataUsuario?.emailCliente}`}</h2>
              )}
              {dataUsuario?.documento !== "" && (
                <h2>{`Documento cliente: ${dataUsuario?.documento}`}</h2>
              )}
              {dataUsuario?.tipoDocumento !== "" && (
                <h2>{`Tipo documento cliente: ${dataUsuario?.tipoDocumento}`}</h2>
              )}
              <h2 className='text-base'>
                {`Valor a recargar: ${formatMoney.format(
                  dataUsuario?.valorRecarga
                )} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                    disabled={loadingPeticionRecargaTarjeta}>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    onClick={makeRecharge}
                    disabled={loadingPeticionRecargaTarjeta}>
                    Realizar recarga
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : estadoPeticion === 1 ? (
            <div className='flex flex-col justify-center items-center'>
              <Tickets ticket={objTicketActual} refPrint={printDiv} />
              <h2>
                <ButtonBar>
                  <Button onClick={handlePrint}>Imprimir</Button>
                  <Button
                    type='submit'
                    onClick={() => {
                      handleClose();
                    }}>
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

export default TransaccionRecargaTarjeta;