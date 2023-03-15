import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { getRecaudo, modRecaudo, searchConveniosRecaudoList } from "../../utils/fetchFunctions"

const RecaudoConjunto = () => {
  const navigate = useNavigate()

  const { roleInfo, pdpUser } = useAuth();
  const { pk_id_convenio } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [dataRecaudo, setDataRecaudo] = useState('')
  const [id_trx, setId_Trx] = useState('')
  const [cargando, setCargando] = useState(false)
  const [convenioRetiro, setConvenioRetiro] = useState(null);
  const [valorRecibido, setValorRecibido] = useState({ valor_total_trx: '' })
  const [dataReferencias, setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  })
  const tipoModificacion = [
    { label: "Valor igual", value: 1 },
    { label: "Valor menor o igual", value: 2 },
    { label: "Valor mayor o igual", value: 3 },
    { label: "Valor menor, mayor o igual", value: 4 },
  ]

  const handleClose = useCallback(() => {
    setShowModal(false);
    setDataReferencias({
      referencia1: '',
      referencia2: ''
    })
  }, []);
  const limitesMontos = {
    max: 999999999,
    min: 1,
  };

  const getData = useCallback(async () => {
    try {
      let rest = await searchConveniosRecaudoList({ convenio_id: pk_id_convenio })
        .then((rest) => { return rest })
      if (rest.length < 1) throw new Error("Convenio no existe")
      setConvenioRetiro(rest.obj)
      setCargando(true)
    } catch (e) {
      notifyError(e.message)
      navigate("/recaudo-directo/recaudo")
    }
  }, [navigate, pk_id_convenio])

  const consultarRecaudoD = useCallback(async (e) => {
    e.preventDefault()
    const data = {
      consulta_recaudo: {
        convenio_id: pk_id_convenio,
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
    await getRecaudo(data)
      .then((data) => {
        setDataRecaudo(data?.obj?.recaudo ?? "")
        setId_Trx(data?.obj?.id_trx ?? false)
        notify(data.msg)
        setShowModal(true);
      })
      .catch((err) => {
        notifyError(err?.message);
        handleClose()
      });

  }, [pk_id_convenio, dataReferencias, roleInfo, pdpUser, handleClose])


  const hacerRecaudo = useCallback(async (e) => {
    e.preventDefault()
    
    let valoresRecibido = parseInt(valorRecibido.valor_total_trx) ?? 0
    let sumaTotal = valoresRecibido + dataRecaudo.valor_pagado

    const ValidacionTRX = {
      1: () => sumaTotal === dataRecaudo.valor ? { estado: true } : undefined,
      2: () => sumaTotal <= dataRecaudo.valor ? { estado: true } : undefined,
      3: () => sumaTotal >= dataRecaudo.valor ? { estado: true } : undefined,
      4: () => (sumaTotal < dataRecaudo.valor || sumaTotal >= dataRecaudo.valor) ? { estado: true } : undefined,
    };

    const resp = ValidacionTRX[dataRecaudo?.fk_modificar_valor]?.() || { estado: false };

    if (resp.estado) {
      const data = {
        id_trx: id_trx,
        recaudo: {
          convenio_id: pk_id_convenio,
          pk_id_recaudo: dataRecaudo.pk_id_recaudo,
        },
        comercio: {
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
        },
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO",
        ...valorRecibido,
        nombre_usuario: pdpUser?.uname ?? "",
      };
      await modRecaudo(data)
        .then((data) => {
          data?.status && notify(data?.msg)
        })
        .catch((err) => {
          notifyError(err?.msg);
        });
      handleClose()
    }
    else { notifyError("El valor recibido debe estar a corde al tipo de pago") }

  }, [roleInfo, pdpUser, valorRecibido, dataRecaudo, id_trx, pk_id_convenio, handleClose])

  useEffect(() => { getData() }, [getData, pk_id_convenio])

  return (

    <Fragment>
      <h1 className="text-3xl mt-6">Recaudos</h1>
      {cargando ? (
        <Form onSubmit={consultarRecaudoD}>
          <Input
            label='Número de convenio'
            name={"pk_id_convenio_directo"}
            type='text'
            autoComplete='off'
            defaultValue={convenioRetiro?.pk_id_convenio_directo}
            disabled
          />
          <Input
            label='Código EAN o IAC'
            type='text'
            defaultValue={convenioRetiro?.ean13}
            autoComplete='off'

            disabled
          />
          <Input
            label='Nombre de convenio'
            type='text'
            defaultValue={convenioRetiro?.nombre_convenio}
            autoComplete='off'
            disabled
          />
          {convenioRetiro?.referencias.map((dict, index) => {
            return (
              <Input
                key={index}
                id={1}
                label={dict?.nombre_referencia ?? "Referencia 1"}
                name={'referencia' + (index + 1)}
                type="text"
                // minLength={dict?.length[0]}
                // maxLength={dict?.length[1]}
                value={dataReferencias['referencia' + (index + 1)]}
                onChange={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: e.target.value }) }}
                autoComplete="off"
                required />
            )
          })}
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"}>
              Realizar consulta
            </Button>
          </ButtonBar>
        </Form>
      ) : (<> Cargando...</>)}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> Realizar recaudo </h2>
        <Form onSubmit={hacerRecaudo} grid >
          <Input
            id={1}
            label={"Estado"}
            name={"nombre_estado"}
            type="text"
            defaultValue={dataRecaudo.nombre_estado ?? ""}
            autoComplete="off"
            disabled
          />
          <Select
            className="place-self-stretch"
            id={"Tipo modificacion"}
            label={"Tipo de pago"}
            name={"fk_modificar_valor"}
            options={[{ label: "", value: "" }, ...tipoModificacion]}
            defaultValue={dataRecaudo?.fk_modificar_valor ?? ""}
            disabled
          />
          <MoneyInput
            label="Valor a recaudar"
            name="valor_total_trx"
            autoComplete="off"
            min={limitesMontos?.min}
            max={dataRecaudo?.fk_modificar_valor === 1 ||
              dataRecaudo?.fk_modificar_valor === 2 ?
              parseInt(dataRecaudo.valor) - parseInt(dataRecaudo.valor_pagado)
              : limitesMontos.max}
            onInput={(e, valor) =>
              setValorRecibido({ ...valorRecibido, [e.target.name]: valor})
            }
            required
          />
          <ButtonBar>
            <Button type={"submit"} >
              Aceptar
            </Button>
            <Button onClick={() => handleClose()} >
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  )
}

export default RecaudoConjunto