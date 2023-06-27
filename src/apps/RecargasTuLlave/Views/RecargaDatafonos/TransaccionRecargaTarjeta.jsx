import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchTuLlave";
import TextArea from "../../../../components/Base/TextArea/TextArea";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosTuLlave } from "../../utils/enumParametrosTuLlave";
import { useReactToPrint } from "react-to-print";

const URL_CONSULTAR_TARJETA = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/consultar`;
const URL_REALIZAR_RECARGA_TARJETA = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/recarga-datafono`;

const TransaccionRecargaTarjeta = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [dataUsuario, setDataUsuario] = useState({
    NTargeta: "",
    valorRecarga: 0,
    nombresCliente: "",
    apellidosCliente: "",
    telefonoCliente: "",
    emailCliente: "",
  });
  const [valor, setValor] = useState(0);
  const [estadoPeticion, setEstadoPeticion] = useState(0);

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
        valor_total_trx: valor,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        address: roleInfo?.["direccion"],
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.["ciudad"],
        recarga_datafono_tu_llave: {
          posId: dataUsuario?.["pos_id"],
        },
      };
      notifyPending(
        peticionRecargaDatafono({ pk_tullave_datafonos: "" }, data),
        {
          render: () => {
            return "Procesando recarga";
          },
        },
        {
          render: ({ data: res }) => {
            console.log("respuesta recarga", data);
            navigate(-1);
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
    [dataUsuario, navigate, valor, roleInfo, pdpUser]
  );
  const [loadingPeticionConsultaTarjeta, peticionConsultaTarjeta] = useFetch(
    fetchCustom(URL_CONSULTAR_TARJETA, "GET", "Consultar tarjeta")
  );
  const [loadingPeticionRecargaTarjeta, peticionRecargaDatafono] = useFetch(
    fetchCustom(
      URL_REALIZAR_RECARGA_TARJETA,
      "POST",
      "Realizar recarga tarjeta"
    )
  );
  const handleShow = useCallback(
    (ev) => {
      ev.preventDefault();
      if (valor % 50 !== 0) {
        return notifyError("El valor de la recarga debe ser multiplo de 50");
      }
      setEstadoPeticion(0);
      setShowModal(true);
    },
    [valor]
  );
  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    let num = valor.replace(/[\s\.]/g, "");
    if (!isNaN(num)) {
      setDataUsuario((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataUsuario((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  return (
    <>
      <h1 className='text-3xl'>Recargar datafono</h1>
      <Form onSubmit={handleShow} grid>
        <Fieldset legend='Datos usuario' className='lg:col-span-2'>
          <Input
            id='pos_id'
            name='pos_id'
            label={"Pos Id"}
            type='text'
            autoComplete='off'
            value={dataUsuario?.["pos_id"]}
            maxLength={15}
            onChange={() => {}}
            required
            disabled={
              loadingPeticionConsultaTarjeta || loadingPeticionRecargaTarjeta
            }
          />
          <TextArea
            id='comentarios'
            name='comentarios'
            label={"Comentarios"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["comentarios"]}
            maxLength={200}
            onChange={() => {}}
            disabled={
              loadingPeticionConsultaTarjeta || loadingPeticionRecargaTarjeta
            }
          />
        </Fieldset>
        <Fieldset legend='Valor a recargar' className='lg:col-span-2'>
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a recargar'
            type='text'
            min={enumParametrosTuLlave.MINRECARGADATAFONO}
            max={enumParametrosTuLlave.MAXRECARGADATAFONO}
            autoComplete='off'
            maxLength={"9"}
            value={parseInt(valor)}
            onInput={(e, val) => {
              setValor(val);
            }}
            required
            disabled={
              loadingPeticionConsultaTarjeta || loadingPeticionRecargaTarjeta
            }
          />
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}
            disabled={
              loadingPeticionConsultaTarjeta || loadingPeticionRecargaTarjeta
            }>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={
              loadingPeticionConsultaTarjeta || loadingPeticionRecargaTarjeta
            }>
            Recargar datafono
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
              <h2>{`PosId datafono: ${dataDatafono?.["pos_id"]}`}</h2>
              <h2 className='text-base'>
                {`Valor a recargar: ${formatMoney.format(valor)} `}
              </h2>
              <>
                <ButtonBar>
                  <Button
                    onClick={() => {
                      handleClose();
                      notifyError("Transacción cancelada por el usuario");
                    }}
                    disabled={
                      loadingPeticionConsultaTarjeta ||
                      loadingPeticionRecargaTarjeta
                    }>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    onClick={makeRecharge}
                    disabled={
                      loadingPeticionConsultaTarjeta ||
                      loadingPeticionRecargaTarjeta
                    }>
                    Realizar recarga
                  </Button>
                </ButtonBar>
              </>
            </div>
          ) : estadoPeticion === 1 ? (
            <div className='flex flex-col justify-center items-center'>
              {/* <TicketsAgrario ticket={objTicketActual} refPrint={printDiv} /> */}
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
