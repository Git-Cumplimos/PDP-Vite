import { Fragment, useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../../components/Base/Tickets";
import { searchConveniosRecaudoList, modRecaudo, getRecaudo } from "../../utils/fetchFunctions"
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import { onChangeNumber } from "../../../../utils/functions";

const limitesMontos = {
  max: 99999999,
  min: 1,
};

const RecaudoConjunto = () => {
  const navigate = useNavigate()

  const { roleInfo, pdpUser } = useAuth();
  const { pk_id_convenio } = useParams()
  const [searchParams] = useSearchParams();
  const [modificar, setModificar] = useState(false)
  const [valorCodigoBarras, setValorCodigoBarras] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dataRecaudo, setDataRecaudo] = useState('')
  const [id_trx, setId_Trx] = useState(null)
  const [pago, setPago] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [convenioRecaudo, setConvenioRecaudo] = useState(null);
  const [valorRecibido, setValorRecibido] = useState({ valor_total_trx: '' })
  const [dataReferencias, setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  })

  const handleClose = useCallback((err = null) => {
    setShowModal(false);
    if (err) notifyError("Transacción de recaudo cancelada por el usuario")
    if (modificar !== true) {
      setDataRecaudo('')
      setDataReferencias({
        referencia1: '',
        referencia2: ''
      })
      setValorRecibido({
        valor_total_trx: ''
      })
    }
  }, [modificar]);

  const [consultaFetch] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setDataRecaudo(data?.obj?.recaudo)
      setId_Trx(data?.obj?.id_trx ?? false)
      data?.obj?.recaudo && notify(data.msg)
      if (data?.obj?.recaudo.fk_modificar_valor === 1) { setValorRecibido({ valor_total_trx: data?.obj?.recaudo.valor - data?.obj?.recaudo?.valor_pagado }) }
      setShowModal(true);
    }, []),
    onError: useCallback((err) => {
      notifyError(err?.message);
      if (modificar === true) navigate("/recaudo-directo/recaudo/barras")
      handleClose()
    }, [handleClose, modificar, navigate]),
  });

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const getData = useCallback(async () => {
    try {
      let rest = await searchConveniosRecaudoList({ convenio_id: pk_id_convenio })
        .then((rest) => { return rest })
      if (rest.length < 1) throw new Error("Convenio no existe")
      setConvenioRecaudo(rest.obj)
      setCargando(true)
    } catch (e) {
      notifyError(e.message)
      navigate("/recaudo-directo/recaudo")
    }
  }, [navigate, pk_id_convenio])

  const consultarRecaudoD =
    useCallback(async (e) => {
      e.preventDefault()
      const data = {
        consulta_recaudo: {
          convenio_id: pk_id_convenio,
          permite_vencidos: convenioRecaudo.permite_vencidos ?? false,
          tipo_convenio: convenioRecaudo.fk_id_tipo_convenio,
          referencias: Object.values(dataReferencias).filter((ref) => ref !== ''),
        },
        valor_total_trx: 0,
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        nombre_usuario: pdpUser?.uname ?? "",
      };
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      const url = getRecaudo()
      consultaFetch(`${url}`, options)
    }, [pk_id_convenio, dataReferencias, roleInfo, pdpUser, convenioRecaudo, consultaFetch])

  const validarLimites = useCallback((tipo, valor) => {
    let res = ''
    if (valor === 'min') {
      if (tipo === 3) {
        res = (parseInt(convenioRecaudo?.limite_monto[0]) !== 0 &&
          parseInt(convenioRecaudo?.limite_monto[0]) >= (dataRecaudo.valor - dataRecaudo.valor_pagado ?? 0) ?
          convenioRecaudo?.limite_monto[0] : (dataRecaudo.valor - dataRecaudo.valor_pagado ?? 0)
        )
      }
      else { // tipo 2 (menor o igual) y 4 (cualquier valor)
        res = convenioRecaudo?.limite_monto[0] === "0" ? limitesMontos.min : convenioRecaudo?.limite_monto[0]
      }
    }
    if (valor === 'max') {
      if (tipo === 2) {
        res = (parseInt(convenioRecaudo?.limite_monto[1]) !== 0 &&
          parseInt(convenioRecaudo?.limite_monto[1]) <= (dataRecaudo.valor - dataRecaudo.valor_pagado ?? 0) ?
          convenioRecaudo?.limite_monto[1] : (dataRecaudo.valor - dataRecaudo.valor_pagado ?? 0)
        )
      } else {
        res = convenioRecaudo?.limite_monto[1] === "0" ? limitesMontos.max : convenioRecaudo?.limite_monto[1]
      }
    }
    res = parseInt(res)
    return res
  }, [convenioRecaudo, dataRecaudo])

  const hacerRecaudo = useCallback(async (e) => {
    e.preventDefault()

    let resp = ''
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
      nombre_comercio: roleInfo?.["nombre comercio"] ?? "",
      direccion: roleInfo?.direccion ?? ""
    };

    let valoresRecibido = parseInt(valorRecibido.valor_total_trx) ?? 0 
    let sumaTotal = valoresRecibido + dataRecaudo.valor_pagado

    const ValidacionTRX = {
      1: () => sumaTotal === dataRecaudo.valor &&
        valoresRecibido >= validarLimites(dataRecaudo?.fk_modificar_valor, 'min') &&
        valoresRecibido <= validarLimites(dataRecaudo?.fk_modificar_valor, 'max') ? { estado: true } : undefined,
      2: () => (valoresRecibido >= validarLimites(dataRecaudo?.fk_modificar_valor, 'min') &&
        valoresRecibido <= validarLimites(dataRecaudo?.fk_modificar_valor, 'max')
      ) ? { estado: true } : undefined,

    };

    let tipo = dataRecaudo?.fk_modificar_valor !== 1 ? 2 : 1
    resp = ValidacionTRX[tipo]?.() || { estado: false };

    data.recaudo = {
      convenio_id: pk_id_convenio,
      nombre_convenio: convenioRecaudo?.nombre_convenio ?? "",
      pk_id_recaudo: dataRecaudo.pk_id_recaudo,
      referencias: Object.values(dataReferencias).filter((ref) => ref !== ''),
    }
    if ((convenioRecaudo?.fk_id_tipo_convenio !== 3 && resp.estado) || convenioRecaudo?.fk_id_tipo_convenio === 3) {
      modRecaudo(data)
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

  }, [roleInfo, valorRecibido, dataRecaudo, id_trx,
    pk_id_convenio, convenioRecaudo, dataReferencias, handleClose, validarLimites])

  useEffect(() => { getData() }, [getData, pk_id_convenio])

  useEffect(() => {
    const urlData = Object.fromEntries(searchParams);
    if ("refs" in urlData) {
      setDataReferencias(
        Object.fromEntries(
          [1, 2]
            .map((ref) => [
              `referencia${ref}`,
              JSON.parse(urlData.refs)?.[`referencia${ref}`] ?? "",
            ])
        )
      );
    }
    if ("valor" in urlData) setValorRecibido({ valor_total_trx: urlData.valor });
    if ("modificar" in urlData) setModificar(true);
    if ("valorRegistrado" in urlData) setValorCodigoBarras(true);

  }, [searchParams]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Recaudos</h1>
      {cargando ? (
        <Form onSubmit={convenioRecaudo?.fk_id_tipo_convenio !== 3 ?
          consultarRecaudoD : (e) => { setShowModal(true); e.preventDefault() }} grid>
          <Input
            label='Número de convenio'
            name={"pk_id_convenio_directo"}
            type='text'
            autoComplete='off'
            defaultValue={convenioRecaudo?.pk_id_convenio_directo}
            disabled
          />
          <Input
            label='Código EAN o IAC'
            type='text'
            defaultValue={convenioRecaudo?.ean13}
            autoComplete='off'

            disabled
          />
          <Input
            label='Nombre de convenio'
            type='text'
            defaultValue={convenioRecaudo?.nombre_convenio}
            autoComplete='off'
            disabled
          />
          {convenioRecaudo?.referencias.map((dict, index) => {
            return (
              <Input
                key={index}
                id={dict?.nombre_referencia ?? `referencia ${index + 1}`}
                label={dict?.nombre_referencia ?? "Referencia 1"}
                minLength={convenioRecaudo['referencias'][index]['length'][0] ?? 0}
                maxLength={convenioRecaudo['referencias'][index]['length'][1] ?? 20}
                name={'referencia' + (index + 1)}
                type="text"
                value={dataReferencias['referencia' + (index + 1)]}
                onInput={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: onChangeNumber(e) }) }}
                // onChange={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: e.target.value }) }}
                autoComplete="off"
                disabled={modificar === true ? true : false}
                required />
            )
          })}
          {
            (convenioRecaudo?.fk_id_tipo_convenio === 3 || valorCodigoBarras) &&
            <MoneyInput
              label="Valor a recaudar"
              name="valor_total_trx"
              autoComplete="off"
              equalError={false}
              min={validarLimites(4, 'min')}
              value={valorRecibido.valor_total_trx}
              max={validarLimites(4, 'max')}
              onInput={(e, valor) =>
                setValorRecibido({ ...valorRecibido, [e.target.name]: valor })
              }
              disabled={valorCodigoBarras ? true : false}
              required
            />
          }
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>
              {convenioRecaudo?.fk_id_tipo_convenio === 3 ? "Realizar recaudo" : "Realizar consulta"}
            </Button>
          </ButtonBar>
        </Form>
      ) : (<> Cargando...</>)}
      <Modal show={showModal} handleClose={()=>handleClose(true)}>
        <h2 className="text-3xl mx-auto text-center mb-4"> Realizar recaudo {
          !dataRecaudo && convenioRecaudo?.fk_id_tipo_convenio === 3 ? 'no registrado' : ''
        } </h2>
        <Form onSubmit={hacerRecaudo} grid >
          {convenioRecaudo?.fk_id_tipo_convenio !== 3 ? (
            <>
              <Input
                id={"Estado"}
                label={"Estado"}
                name={"nombre_estado"}
                type="text"
                defaultValue={dataRecaudo.nombre_estado ?? ""}
                autoComplete="off"
                disabled
              />
              {dataRecaudo?.fk_modificar_valor === 1 || valorCodigoBarras ? (
                <MoneyInput
                  label="Valor a recaudar"
                  name="valor_total_trx"
                  autoComplete="off"
                  value={valorCodigoBarras ? valorRecibido.valor_total_trx : (dataRecaudo.valor - dataRecaudo.valor_pagado ?? 0)}
                  disabled
                  required
                />
              ) : (
                <MoneyInput
                  label="Valor a recaudar"
                  name="valor_total_trx"
                  autoComplete="off"
                  min={validarLimites(dataRecaudo?.fk_modificar_valor, 'min')}
                  equalError={dataRecaudo?.fk_modificar_valor === 2 ? null : false}
                  max={validarLimites(dataRecaudo?.fk_modificar_valor, 'max')}
                  onInput={(e, valor) =>
                    setValorRecibido({ ...valorRecibido, [e.target.name]: valor })
                  }
                  required
                />
              )}
            </>
          ) : (
            <>
              {convenioRecaudo?.referencias.map((dict, index) => {
                return (
                  <Input
                    key={index}
                    id={dict?.nombre_referencia ?? `referencia ${index + 1}`}
                    label={dict?.nombre_referencia ?? "Referencia 1"}
                    name={'referencia' + (index + 1)}
                    type="text"
                    value={dataReferencias['referencia' + (index + 1)]}
                    autoComplete="off"
                    disabled
                    required />
                )
              })}
              <MoneyInput
                label="Valor a recaudar"
                name="valor_total_trx"
                autoComplete="off"
                value={valorRecibido.valor_total_trx}
                disabled
                required
              />
            </>
          )}
          <ButtonBar>
            <Button type={"submit"} >
              {convenioRecaudo?.fk_id_tipo_convenio === 3 ? "Confirmar" : "Aceptar"}
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
            <Button onClick={() => navigate("/recaudo-directo/recaudo/manual")}>
              Cerrar
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </Fragment>
  )
}

export default RecaudoConjunto