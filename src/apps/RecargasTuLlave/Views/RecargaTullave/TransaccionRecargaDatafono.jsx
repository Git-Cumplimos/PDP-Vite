import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
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
import Tickets from "../../../../components/Base/Tickets/Tickets";
import { useFetchTuLlave } from "../../hooks/fetchTuLlave";
import useMoney from "../../../../hooks/useMoney";

const URL_CONSULTAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/consultar`;
const URL_REALIZAR_RECARGA_DATAFONO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/recarga-datafono`;
const URL_CONSULTAR_RECARGA_DATAFONO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/tu-llave/consulta-recarga-datafono`;

const TransaccionRecargaDatafono = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const params = useParams();
  const { roleInfo, pdpUser } = useAuth();
  const [objTicketActual, setObjTicketActual] = useState({});
  const [dataDatafono, setDataDatafono] = useState({
    comentarios: "",
    estado: true,
    fecha_creacion: null,
    fecha_modificacion: null,
    fk_comercio_asociado: "",
    hardware_id: "",
    numero_serie: "",
    pk_tullave_datafonos: "",
    pos_id: "",
    tarjeta_lsam: "",
    tarjeta_sim: "",
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
      if (params?.id) {
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
            id_uuid_trx: uniqueId,
          },
          recarga_datafono_tu_llave: {
            posId: dataDatafono?.["pos_id"],
          },
          location: {
            address: roleInfo?.["direccion"],
            dane_code: roleInfo?.codigo_dane,
            city: roleInfo?.["ciudad"],
          },
        };
        const dataAditional = {
          id_uuid_trx: uniqueId,
        };
        notifyPending(
          peticionRecargaDatafono(data, dataAditional),
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
      }
    },
    [params?.id, dataDatafono, navigate, valor, roleInfo, pdpUser]
  );
  const [loadingPeticionConsultaDatafono, peticionConsultaDatafono] = useFetch(
    fetchCustom(URL_CONSULTAR_DATAFONO, "GET", "Consultar datáfono")
  );
  const [loadingPeticionRecargaDatafono, peticionRecargaDatafono] =
    useFetchTuLlave(
      URL_REALIZAR_RECARGA_DATAFONO,
      URL_CONSULTAR_RECARGA_DATAFONO,
      "Realizar recarga datáfono"
    );
  useEffect(() => {
    fetchDatafonosFunc();
  }, [params.id]);
  const fetchDatafonosFunc = useCallback(() => {
    if (params.id) {
      const data = {
        pk_tullave_datafonos: params.id,
      };
      notifyPending(
        peticionConsultaDatafono(data, {}),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setDataDatafono(
              res?.obj?.results[0] ?? {
                comentarios: "",
                estado: true,
                fecha_creacion: null,
                fecha_modificacion: null,
                fk_comercio_asociado: "",
                hardware_id: "",
                numero_serie: "",
                pk_tullave_datafonos: "",
                pos_id: "",
                tarjeta_lsam: "",
                tarjeta_sim: "",
              }
            );
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    }
  }, [params.id]);
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
  const onChangeMoney = useMoney({
    limits: [
      enumParametrosTuLlave.MINRECARGADATAFONO,
      enumParametrosTuLlave.MAXRECARGADATAFONO,
    ],
    equalError: false,
  });
  return (
    <>
      <h1 className='text-3xl'>Recargar datáfono Tu Llave</h1>
      <Form onSubmit={handleShow} grid>
        <Fieldset legend='Datos datáfono' className='lg:col-span-2'>
          <Input
            id='pos_id'
            name='pos_id'
            label={"Pos Id"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["pos_id"]}
            maxLength={15}
            onChange={() => {}}
            required
            disabled
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
            disabled
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
            maxLength={"12"}
            value={parseInt(valor)}
            required
            disabled={
              loadingPeticionConsultaDatafono || loadingPeticionRecargaDatafono
            }
            onInput={(e, monto) => {
              if (!isNaN(monto)) {
                setValor(monto);
              }
            }}
            equalError={false}
            equalErrorMin={false}
          />
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}
            disabled={
              loadingPeticionConsultaDatafono || loadingPeticionRecargaDatafono
            }>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={
              loadingPeticionConsultaDatafono || loadingPeticionRecargaDatafono
            }>
            Recargar datáfono
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
              <h2>{`PosId datáfono: ${dataDatafono?.["pos_id"]}`}</h2>
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
                      loadingPeticionConsultaDatafono ||
                      loadingPeticionRecargaDatafono
                    }>
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    onClick={makeRecharge}
                    disabled={
                      loadingPeticionConsultaDatafono ||
                      loadingPeticionRecargaDatafono
                    }>
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

export default TransaccionRecargaDatafono;
