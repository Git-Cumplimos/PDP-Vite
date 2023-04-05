import { Fragment, useCallback, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../utils/MoneyInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { getRetiro, modRetiro, searchConveniosRetiroList } from "../../utils/fetchFunctions"

const FormularioRetiro = () => {
  const navigate = useNavigate()

  const { pk_id_convenio } = useParams();
  // const { nombre_convenio } = useParams();
  const [cargando, setCargando] = useState(false)
  const [dataRetiro, setDataRetiro] = useState('')
  const [dataConvRetiro, setDataConvRetiro] = useState('')
  const [id_trx, setId_Trx] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [valorRecibido, setValorRecibido] = useState({ valor_total_trx: '' })
  const { roleInfo, pdpUser } = useAuth();
  const [dataReferencias, setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  })
  // const tipoModificacion = [
  //   { label: "Valor igual", value: 1 },
  //   { label: "Valor menor o igual", value: 2 },
  // ]
  const limitesMontos = {
    max: 999999999,
    min: 1,
  };


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
      if (rest.length < 1) throw new Error("No hay datos");
      setDataConvRetiro(rest?.obj)
      setCargando(true)
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

    }, [pk_id_convenio, handleClose, dataReferencias, dataConvRetiro, roleInfo, pdpUser])
 

  useEffect(() => { getData() }, [getData, pk_id_convenio])

  const hacerRetiro = useCallback(async (e) => {
    e.preventDefault();

    let valoresRecibido = parseInt(valorRecibido.valor_total_trx) ?? 0
    let sumaTotal = valoresRecibido + dataRetiro.valor_retirado

    const FlujosTRX = {
      1: () => sumaTotal === dataRetiro.valor ?
        { estado: true } : undefined,
      2: () => sumaTotal <= dataRetiro.valor ?
        { estado: true } : undefined,
    };

    const resp = FlujosTRX[dataRetiro?.fk_modificar_valor]?.() || { estado: false };

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
          pk_id_retiro: dataRetiro.pk_id_recaudo,
        },
        nombre_usuario: pdpUser?.uname ?? "",
      };
      await modRetiro(data)
        .then((data) => {
          data?.status && notify(data?.msg)
          navigate("/recaudo-directo/consultar-retiro")
        })
        .catch((err) => {
          notifyError(err?.msg);
        });
      handleClose()
    }
    else { notifyError("El valor recibido debe estar a corde al tipo de pago") }
  }, [dataRetiro, roleInfo, pdpUser, id_trx, valorRecibido, pk_id_convenio, navigate, handleClose])

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
                // minLength={dict?.length[0]}
                // maxLength={dict?.length[1]}
                value={dataReferencias['referencia' + (index + 1)]}
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
          <MoneyInput
            label="Valor a retirar"
            name="valor_total_trx"
            autoComplete="off"
            equalError={dataRetiro?.fk_modificar_valor}
            min={parseInt(dataRetiro.valor) - parseInt(dataRetiro.valor_retirado ?? 0)}
            max={parseInt(dataRetiro.valor) - parseInt(dataRetiro.valor_retirado ?? 0)}
            onInput={(e, valor) =>
              setValorRecibido({ ...valorRecibido, [e.target.name]: valor })
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

export default FormularioRetiro