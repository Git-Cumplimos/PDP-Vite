import { Fragment, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";
import { notify, notifyPending, notifyError } from "../../../../utils/notify";
import { getRetiro, searchConveniosRecaudoList } from "../../utils/fetchFunctions"

const FormularioRetiro = () => {

  const { pk_id_convenio } = useParams();
  const { nombre_convenio } = useParams();
  const [dataRetiro, setDataRetiro] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const consultarRetiroD = useCallback(async (e) => {
    e.preventDefault()
    await getRetiro({
      convenio_id: pk_id_convenio,
      otp: e.target.otp.value,
      documento: e.target.documento.value
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

  }, [pk_id_convenio,handleClose])

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
      <Form onSubmit={consultarRetiroD} grid >
        <Input
          id={"Codigo_nit"}
          label={"Codigo convenio"}
          name={"Codigo_nit"}
          autoComplete="off"
          value={pk_id_convenio ?? ""}
          disabled
          required />
        <Input
          id={"nombre_convenio"}
          label={"Nombre convenio"}
          name={"nombre_convenio"}
          type="text"
          value={nombre_convenio ?? ""}
          autoComplete="off"
          disabled
          required
        />
        <Input
          id={1}
          label={"Numero OTP"}
          name={"otp"}
          type="text"
          minLength={"6"}
          maxLength={"6"}
          autoComplete="off"
          required />

        <Input
          id={1}
          label={"Documento Cliente"}
          name={"documento"}
          type="text"
          minLength={"5"}
          maxLength={"11"}
          autoComplete="off"
          required />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} >
            Consultar
          </Button>
        </ButtonBar>
      </Form>

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
              <Button onClick={()=>handleClose()} >
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        </Modal>

    </Fragment>
  )
}

export default FormularioRetiro