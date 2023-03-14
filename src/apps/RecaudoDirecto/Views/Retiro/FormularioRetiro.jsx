import { Fragment, useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import Input from "../../../../components/Base/Input";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyPending, notifyError } from "../../../../utils/notify";
import { getRetiro, modRetiro, searchConveniosRetiroList } from "../../utils/fetchFunctions"


const FormularioRetiro = () => {

  const { pk_id_convenio } = useParams();
  // const { nombre_convenio } = useParams();
  const [cargando, setCargando] = useState(false)
  const [dataRetiro, setDataRetiro] = useState('')
  const [dataConvRetiro, setDataConvRetiro] = useState('')
  const [id_trx, setId_Trx] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [valorRecibido, setValorRecibido] = useState({ valor_total_trx: '' })
  const { roleInfo, pdpUser, infoTicket } = useAuth();
  const [dataReferencias, setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  })
  const tipoModificacion = [
    { label: "Valor igual", value: 1 },
    { label: "Valor menor o igual", value: 2 },
  ]


  const handleClose = useCallback(() => {
    setShowModal(false);
    setDataReferencias({
      referencia1: '',
      referencia2: ''
    })
  }, []);

  const getData = useCallback(async () => {
    try {
      let rest = await searchConveniosRetiroList({ convenio_id: pk_id_convenio })
        .then((rest) => { return rest })
      if (rest.length < 1) throw "no hay datos"
      setDataConvRetiro(rest?.obj)
      setCargando(true)
    } catch (e) {
      console.error(e)
    }

  }, [pk_id_convenio])

  const consultarRetiroD = useCallback(async (e) => {
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
    await getRetiro(data)
      .then((data) => {
        setDataRetiro(data?.obj.retiro ?? "")
        setId_Trx(data?.obj?.id_trx ?? "")
        notify(data.msg)
        setShowModal(true);
      })
      .catch((err) => {
        notifyError(err?.message);
        handleClose()
      });

  }, [pk_id_convenio, handleClose, dataReferencias, roleInfo, pdpUser])

  useEffect(() => { getData() }, [getData, pk_id_convenio])

  const hacerRetiro = useCallback(async (e) => {
    e.preventDefault();

    let valoresRecibido = parseInt(valorRecibido.valor_total_trx) ?? 0
    let sumaTotal = valoresRecibido + dataRetiro.valor_retirado

    const FlujosTRX = {
      1: () => sumaTotal === dataRetiro.valor ?
        { estado: true, fk_estado: 2 } : undefined,
      2: () => sumaTotal <= dataRetiro.valor ?
        { estado: true, fk_estado: sumaTotal === dataRetiro.valor ? 2 : 1 } : undefined,
    };

    const resp = FlujosTRX[dataRetiro?.fk_modificar_valor]?.() || { estado: false };

    if (resp.estado) {

      const data = {
        id_trx: id_trx,
        fk_estado: resp.fk_estado,
        convenio_id: pk_id_convenio,
        valor_antes: dataRetiro?.valor_retirado ?? 0,
        valor_retirado: sumaTotal,
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
      console.log(data)
      await modRetiro({ pk_id_retiro: dataRetiro.pk_id_recaudo }, data)
        .then((data) => {
          data?.status && notify(data?.msg)
        })
        .catch((err) => {
          notifyError(err?.msg);
        });
      handleClose()
    }
    else { notifyError("El valor recibido debe estar a corde al tipo de pago") }
  }, [dataRetiro, roleInfo, pdpUser, id_trx, valorRecibido, handleClose])

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
          <ButtonBar className={"lg:col-span-2"}>
            <Button type={"submit"} >
              Consultar
            </Button>
          </ButtonBar>
        </Form>
      ) : (<>cargando...</>)}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> Realizar retiro </h2>
        {dataRetiro.fk_estado !== 2 ?
          <Form onSubmit={hacerRetiro} grid >
            <Input
              id={1}
              label={"Estado"}
              name={"nombre_estado"}
              type="text"
              defaultValue={dataRetiro?.nombre_estado ?? ""}
              autoComplete="off"
              disabled
            />
            <Select
              className="place-self-stretch"
              id={"Tipo modificacion"}
              label={"Tipo de pago"}
              name={"fk_modificar_valor"}
              options={[{ label: "", value: "" }, ...tipoModificacion]}
              defaultValue={dataRetiro?.fk_modificar_valor ?? ""}
              disabled
            />
            <Input
              id={1}
              label={"Valor total a retirar"}
              name={"valor"}
              type="text"
              defaultValue={dataRetiro?.valor ?? ""}
              autoComplete="off"
              disabled
              required />
            {dataRetiro.valor_retirado !== 0 &&
              <Input
                id={1}
                label={"Saldo restante"}
                name={"valor"}
                type="text"
                defaultValue={dataRetiro.fk_modificar_valor === 2 ?
                  parseInt(dataRetiro.valor - parseInt(dataRetiro.valor_retirado)) : dataRetiro.valor_retirado}
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
          : (
            <>
              <h2 className="text-2xl mx-auto text-center mb-4">No tiene saldo para retirar</h2>
              <Button onClick={() => handleClose()} >
                Cerrar
              </Button>
            </>

          )}
      </Modal>

    </Fragment>
  )
}

export default FormularioRetiro