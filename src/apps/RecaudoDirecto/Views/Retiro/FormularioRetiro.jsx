import { Fragment, useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";
import { notify, notifyPending, notifyError } from "../../../../utils/notify";
import { getRetiro, searchConveniosRetiroList } from "../../utils/fetchFunctions"


const FormularioRetiro = () => {

  const { pk_id_convenio } = useParams();
  // const { nombre_convenio } = useParams();
  const [cargando, setCargando] = useState(false)
  const [dataRetiro, setDataRetiro] = useState('')
  const [dataConvRetiro, setDataConvRetiro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [dataReferencias,setDataReferencias] = useState({
    referencia1: '',
    referencia2: ''
  }) 

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
    await getRetiro({
      ...dataReferencias,
      convenio_id: pk_id_convenio,
    })
      .then((data) => {
        setDataRetiro(data?.obj ?? "")
        notify(data.msg)
        setShowModal(true);
      })
      .catch((err) => {
        notifyError(err?.message);
        handleClose()
      });

  }, [pk_id_convenio, handleClose,dataReferencias])

  useEffect(() => { getData() }, [getData, pk_id_convenio])

  const hacerRetiro = useCallback((e) => {
    e.preventDefault();
    // Funcionalidad Basica ()
    // const buscarCuentaRetiro = dataRetiro
    // if (buscarCuentaRetiro.length < 1) { setOtp(''); setMonto(''); setDocumento(''); alert("Datos Incorrectos"); return false }
    // if (parseInt(monto) <= parseInt(buscarCuentaRetiro[0].monto)) {
    //   alert("Retiro Exitoso")
    //   buscarCuentaRetiro[0].monto = buscarCuentaRetiro[0].monto - monto
    //   setShowModal(false);
    //   setOtp(''); setMonto(''); setDocumento('');
    // } else { alert("Saldo insuficiente"); setMonto('') }
  }, [])

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
                name={'referencia'+ (index + 1)}
                type="text"
                // minLength={dict?.length[0]}
                // maxLength={dict?.length[1]}
                onChange={(e)=>{setDataReferencias({...dataReferencias,[e.target.name]:e.target.value})}}
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
            id={1}
            label={"Estado"}
            name={"nombre_estado"}
            type="text"
            defaultValue={dataRetiro?.nombre_estado ?? ""}
            autoComplete="off"
            disabled
          />
          <Input
            id={1}
            label={"Valor a retirar"}
            name={"valor"}
            type="text"
            defaultValue={dataRetiro?.valor ?? ""}
            autoComplete="off"
            disabled
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

export default FormularioRetiro