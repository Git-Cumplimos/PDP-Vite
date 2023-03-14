import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyPending, notifyError } from "../../../../utils/notify";
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
  }, []);

  const getData = useCallback(async () => {
    try {
      let rest = await searchConveniosRecaudoList({ convenio_id: pk_id_convenio })
        .then((rest) => { return rest })
      if (rest.length < 1) throw "no hay datos"
      setConvenioRetiro(rest.obj)
      setCargando(true)
    } catch (e) {
      alert("error")
      navigate("/recaudo-directo/recaudo")
    }
  }, [navigate, pk_id_convenio])

  const consultarRecaudoD = useCallback(async (e) => {
    e.preventDefault()
    const data = {
      ...dataReferencias,
      convenio_id: pk_id_convenio,
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
    notify(sumaTotal)

    const FlujosTRX = {
      1: () => sumaTotal === dataRecaudo.valor ?
        { estado: true, fk_estado: 2 } : undefined,
      2: () => sumaTotal <= dataRecaudo.valor ?
        { estado: true, fk_estado: sumaTotal === dataRecaudo.valor ? 2 : 1 } : undefined,
      3: () => sumaTotal >= dataRecaudo.valor ?
        { estado: true, fk_estado: 2 } : undefined,
      4: () => (sumaTotal < dataRecaudo.valor || sumaTotal >= dataRecaudo.valor) ?
        { estado: true, fk_estado: sumaTotal >= dataRecaudo.valor ? 2 : 1 } : undefined,
    };

    // const FlujosTRX = {
    //   1: { condicion: function(valoresRecibido,dataRecaudo){
    //     if (valoresRecibido === dataRecaudo) { return {estado : true,fk_estado : 2 }}},
    //   2: { condicion: function(valoresRecibido,dataRecaudo){
    //     if (valoresRecibido <= dataRecaudo) { 
    //       if (valoresRecibido === dataRecaudo) return{estado : true,fk_estado : 2 }
    //       else return{estado : true,fk_estado : 1 }
    //     }
    //   }},
    //   3: {condicion: function(valoresRecibido,dataRecaudo){
    //     if (valoresRecibido >= dataRecaudo) { 
    //       if (valoresRecibido === dataRecaudo) return{estado : true,fk_estado : 2 }
    //       else return{estado : true,fk_estado : 1 }
    //     }
    //   }},
    //   4: {condicion: function(valoresRecibido,dataRecaudo){
    //     if (valoresRecibido < dataRecaudo || valoresRecibido >= dataRecaudo) { 
    //       if (valoresRecibido >= dataRecaudo) return{estado : true,fk_estado : 2 }
    //       else return{estado : true,fk_estado : 1 }
    //     }
    //   }},
    // }}
    // const resp = FlujosTRX[dataRecaudo?.fk_modificar_valor]?.condicion(valoresRecibido,dataRecaudo.valor) || {'estado':false}
    // console.log(resp);


    const resp = FlujosTRX[dataRecaudo?.fk_modificar_valor]?.() || { estado: false };
    console.log(id_trx)
    if (resp.estado) {
      const data = {
        id_trx:id_trx,
        fk_estado: resp.fk_estado,
        valor_antes: dataRecaudo?.valor_pagado ?? 0,
        valor_pagado: sumaTotal,
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
      await modRecaudo({ pk_id_recaudo: dataRecaudo.pk_id_recaudo }, data)
        .then((data) => {
          data?.status && notify(data?.msg)
        })
        .catch((err) => {
          notifyError(err?.msg);
        });
      handleClose()
    }
    else { notifyError("El valor recibido debe estar a corde al tipo de pago") }

  }, [roleInfo, pdpUser, valorRecibido, dataRecaudo, id_trx, handleClose])

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
                value={dataReferencias['referencia'+ (index + 1)]}
                onChange={(e) => { setDataReferencias({ ...dataReferencias, [e.target.name]: e.target.value }) }}
                autoComplete="off"
                required />
            )
          })}
          {/* <Input
            label='Factura/Referencia'
            name={"referencia"}
            type='text'
            value={referencia ?? ""}
            onChange={(e) => { setReferencia(e.target.value) }}
            autoComplete='off'
            required
          /> */}
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
          <Input
            id={1}
            label={"Valor total a pagar"}
            name={"valor"}
            type="text"
            defaultValue={dataRecaudo.valor ?? ""}
            autoComplete="off"
            required />
          {dataRecaudo.valor_pagado !== 0 && 
            <Input
              id={1}
              label={dataRecaudo.fk_modificar_valor === 2  ? "valor a restante": "saldo a favor"}
              name={"valor"}
              type="text"
              defaultValue={dataRecaudo.fk_modificar_valor === 2 ? 
                parseInt(dataRecaudo.valor - parseInt(dataRecaudo.valor_pagado)) ?? 0: dataRecaudo.valor_pagado}
              autoComplete="off"
              disabled
            />
          }
          <Input
            id={1}
            label={"Valor recibido"}
            name={"valor_total_trx"}
            type="text"
            onChange={(e) => { setValorRecibido({ ...valorRecibido, [e.target.name]: e.target.value }) }}
            autoComplete="off"
            required />
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