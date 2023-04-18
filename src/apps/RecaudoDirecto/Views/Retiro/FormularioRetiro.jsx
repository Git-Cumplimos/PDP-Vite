import { Fragment, useCallback, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Tickets from "../../../../components/Base/Tickets";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../../utils/notify";
import { getRetiro, modRetiro, searchConveniosRetiroList } from "../../utils/fetchFunctions"
import { onChangeNumber } from "../../../../utils/functions";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";

const limitesMontos = {
  max: 99999999,
  min: 1,
};

const FormularioRetiro = () => {
  const navigate = useNavigate()

  const { pk_id_convenio } = useParams();
  const [cargando, setCargando] = useState(false)
  const [dataRetiro, setDataRetiro] = useState('')
  const [dataConvRetiro, setDataConvRetiro] = useState(null)
  const [id_trx, setId_Trx] = useState('')
  const [pago, setPago] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [valorRecibido, setValorRecibido] = useState({ valor_total_trx: '' })
  const { roleInfo, pdpUser } = useAuth();
  const [dataReferencias, setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  })


  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const handleClose = useCallback((err = null) => {
    if (err) notifyError("Transacción de retiro cancelada")
    setShowModal(false);
    setDataReferencias({
      referencia1: '',
      referencia2: ''
    })
  }, []);

  const [consultaFetch] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setDataRetiro(data?.obj.retiro ?? "")
      setId_Trx(data?.obj?.id_trx ?? "")
      if (data?.obj?.retiro?.fk_modificar_valor === 1) { setValorRecibido({ valor_total_trx: data?.obj?.retiro?.valor }) }
      notify(data.msg)
      setShowModal(true);
    }, []),
    onError: useCallback((err) => {
      notifyError(err?.message);
      handleClose()
    }, [handleClose]),
  });

  const validarLimiteMax = useCallback((tipo, valor) => {
    let res = ''
    if (valor === 'max') {
      if (tipo === 2) {
        res = (parseInt(dataConvRetiro?.limite_monto[1]) !== 0 &&
          parseInt(dataConvRetiro?.limite_monto[1]) <= (dataRetiro.valor - dataRetiro.valor_retirado ?? 0) ?
          dataConvRetiro?.limite_monto[1] : (dataRetiro.valor - dataRetiro.valor_retirado ?? 0)
        )
      } else {
        res = dataConvRetiro?.limite_monto[1] === '0' ? limitesMontos.max : dataConvRetiro?.limite_monto[1]
      }
    }
    res = parseInt(res)
    return res
  }, [dataConvRetiro, dataRetiro])

  const getData = useCallback(async () => {
    try {
      searchConveniosRetiroList({ convenio_id: pk_id_convenio })
        .then((rest) => {
          if (rest.length < 1) throw new Error("No hay datos");
          setDataConvRetiro(rest?.obj)
          setCargando(true)
        })
        .catch((err) => {
          notifyError(err?.msg);
        });
    } catch (e) {
      console.error(e)
    }

  }, [pk_id_convenio])

  const consultarRetiroD =
    useCallback(async (e) => {
      e.preventDefault()
      const data = {
        consulta_retiro: {
          convenio_id: pk_id_convenio,
          permite_vencidos: dataConvRetiro.permite_vencidos ?? false,
          referencias: Object.values(dataReferencias).filter((ref) => ref !== ''),
        },
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        valor_total_trx: 0,
        nombre_usuario: pdpUser?.uname ?? "",
      };
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      const url = getRetiro()
      consultaFetch(`${url}`, options)
    }, [pk_id_convenio, consultaFetch, dataReferencias, dataConvRetiro, roleInfo, pdpUser])


  useEffect(() => { getData() }, [getData, pk_id_convenio])

  const hacerRetiro = useCallback(async (e) => {
    e.preventDefault();

    let valoresRecibido = parseInt(valorRecibido.valor_total_trx) ?? 0
    let sumaTotal = valoresRecibido + dataRetiro.valor_retirado

    const ValidacionTRX = {
      1: () => sumaTotal === dataRetiro.valor &&
        valoresRecibido >= (dataConvRetiro?.limite_monto[0] ==="0" ? limitesMontos.min : dataConvRetiro?.limite_monto[0]) &&
        valoresRecibido <= validarLimiteMax(dataRetiro?.fk_modificar_valor, 'max') ? { estado: true } : undefined,
      2: () => (valoresRecibido >= (dataConvRetiro?.limite_monto[0] ==="0" ? limitesMontos.min : dataConvRetiro?.limite_monto[0]) &&
        valoresRecibido <= validarLimiteMax(dataRetiro?.fk_modificar_valor, 'max')
      ) ? { estado: true } : undefined,

    };

    const resp = ValidacionTRX[dataRetiro?.fk_modificar_valor]?.() || { estado: false };

    if (resp.estado) {

      const data = {
        id_trx: id_trx,
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        ...valorRecibido,
        retiro: {
          convenio_id: pk_id_convenio,
          nombre_convenio: dataConvRetiro?.nombre_convenio ?? "",
          pk_id_retiro: dataRetiro.pk_id_recaudo,
          referencias: Object.values(dataReferencias).filter((ref) => ref !== ''),
        },
        nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
        direccion: roleInfo?.direccion ?? ""
      };
      modRetiro(data)
        .then((data) => {
          data?.status && notify(data?.msg)
          setPago(data?.obj?.ticket)
          handleClose()
        })
        .catch((err) => {
          notifyError(err?.msg);
          handleClose()
        });
    }
    else { notifyError("El valor recibido no cumple con los limites establecidos") }
  }, [dataRetiro, roleInfo, dataReferencias, id_trx, valorRecibido,
    dataConvRetiro, pk_id_convenio, handleClose, validarLimiteMax])

  return (
    <Fragment>
      <h2 className="text-3xl mx-auto text-center mb-4"> Realizar retiro </h2>
      {cargando ? (
        <Form onSubmit={consultarRetiroD} grid >
          <Input
            id={"Codigo_nit"}
            label={"Codigo convenio"}
            name={"Codigo_nit"}
            autoComplete="off"
            value={dataConvRetiro?.pk_id_convenio_directo ?? ""}
            disabled
            required />
          <Input
            id={"nombre_convenio"}
            label={"Nombre convenio"}
            name={"nombre_convenio"}
            type="text"
            value={dataConvRetiro?.nombre_convenio ?? ""}
            autoComplete="off"
            disabled
            required
          />
          {dataConvRetiro?.referencias.map((dict, index) => {
            return (
              <Input
                key={index}
                id={dict?.nombre_referencia ?? `referencia ${index + 1}`}
                label={dict?.nombre_referencia ?? "Referencia 1"}
                name={'referencia' + (index + 1)}
                type="text"
                minLength={dict['length'][0] ?? 0}
                maxLength={dict['length'][1] ?? 20}
                value={dataReferencias['referencia' + (index + 1)]}
                onInput={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: onChangeNumber(e) }) }}
                // onChange={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: e.target.value }) }}
                autoComplete="off"
                required />
            )
          })}
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} >
              Consultar
            </Button>
          </ButtonBar>
        </Form>
      ) : (<>cargando...</>)}
      <Modal show={showModal} handleClose={()=>handleClose(true)}>
        <h2 className="text-3xl mx-auto text-center mb-4"> Realizar retiro </h2>
        <Form onSubmit={hacerRetiro} grid >
          <Input
            id={"Estado"}
            label={"Estado"}
            name={"nombre_estado"}
            type="text"
            defaultValue={dataRetiro?.nombre_estado ?? ""}
            autoComplete="off"
            disabled
          />
          {dataRetiro?.fk_modificar_valor === 1 ? (
            <MoneyInput
              label="Valor a retirar"
              name="valor_total_trx"
              autoComplete="off"
              value={(dataRetiro.valor - dataRetiro.valor_retirado ?? 0)}
              disabled
              required
            />
          ) : (
            <MoneyInput
              label="Valor a retirar"
              name="valor_total_trx"
              autoComplete="off"
              min={dataConvRetiro?.limite_monto[0] ==="0" ? limitesMontos.min : dataConvRetiro?.limite_monto[0]}
              equalError={dataRetiro?.fk_modificar_valor === 2 ? null : false}
              max={validarLimiteMax(dataRetiro?.fk_modificar_valor, 'max')}
              onInput={(e, valor) =>
                setValorRecibido({ ...valorRecibido, [e.target.name]: valor })
              }
              required
            />
          )}
          <ButtonBar>
            <Button type={"submit"} >
              Aceptar
            </Button>
            <Button onClick={() => handleClose(true)} >
              Cancelar
            </Button>
          </ButtonBar>
        </Form>

      </Modal>
      <Modal show={pago !== false}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center'>
          <Tickets refPrint={printDiv} ticket={pago} />
          <ButtonBar>
            <Button onClick={handlePrint}>Imprimir</Button>
            <Button onClick={() => navigate("/recaudo-directo/consultar-retiro")}>
              Cerrar
            </Button>
          </ButtonBar>
        </div>
      </Modal>

    </Fragment>
  )
}

export default FormularioRetiro