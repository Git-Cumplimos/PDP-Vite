import { Fragment, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";

const retirosDirectos = [
  { pk_id_convenio: 1, otp: 650122, nombre_cliente: "Kevin Guevara", monto: "25000" },
  { pk_id_convenio: 3, otp: 660122, nombre_cliente: "Juliana Reyes", monto: "35000" },
  { pk_id_convenio: 4, otp: 670122, nombre_cliente: "Camila Hernandez", monto: "5000" },
  { pk_id_convenio: 6, otp: 680122, nombre_cliente: "Nicolas Guerrero", monto: "125000" },
  { pk_id_convenio: 7, otp: 680122, nombre_cliente: "Juan Guerrero", monto: "125000" },
  { pk_id_convenio: 8, otp: 680122, nombre_cliente: "Carlos Gonzales", monto: "125000" },
]
const FormularioRetiro = () => {

  const { pk_id_convenio } = useParams();
  const { nombre_convenio } = useParams();
  // const [datos]=  useSearchParams();
  // const [id_convenio, setId_Convenio] = useState(null);
  const [otp, setOtp] = useState('');
  // const [tipoDocumento, setTipoDocumento] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [monto, setMonto] = useState(null);
  const [dataRetiro, setDataRetiro] = useState('')
  const [showModal, setShowModal] = useState(false)

  const consultarRetiroD = (e) => {
    // Datos Estaticos
    e.preventDefault()
    const buscarRetiro = retirosDirectos.filter((data) => {
      return parseInt(data.pk_id_convenio) === parseInt(pk_id_convenio) && parseInt(data.otp) === parseInt(otp)
    })
    if (buscarRetiro.length < 1) { setOtp(''); alert("Datos Incorrectos"); return false }
    setDataRetiro(buscarRetiro)
    setShowModal(true);
  }

  const hacerRetiro = useCallback((e) => {
    e.preventDefault();
    // Funcionalidad Basica ()
    const buscarCuentaRetiro = dataRetiro
    if (buscarCuentaRetiro.length < 1) { setOtp(''); setMonto(''); setDocumento(''); alert("Datos Incorrectos"); return false }
    if (parseInt(monto) <= parseInt(buscarCuentaRetiro[0].monto)) {
      alert("Retiro Exitoso")
      buscarCuentaRetiro[0].monto = buscarCuentaRetiro[0].monto - monto
      setShowModal(false);
      setOtp(''); setMonto(''); setDocumento('');
    } else { alert("Saldo insuficiente"); setMonto('') }
  }, [dataRetiro, monto])

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
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
          name={"OTP"}
          type="text"
          minLength={"6"}
          maxLength={"6"}
          value={otp ?? ""}
          onChange={(e) => { setOtp(e.target.value) }}
          autoComplete="off"
          required />

        <Input
          id={1}
          label={"Documento Cliente"}
          name={"documento"}
          type="text"
          minLength={"5"}
          maxLength={"11"}
          value={documento ?? ""}
          onChange={(e) => { setDocumento(e.target.value) }}
          autoComplete="off"
          required />
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} >
            Consultar
          </Button>
        </ButtonBar>
      </Form>
      {dataRetiro !== '' &&
        <Modal show={showModal} handleClose={handleClose}>
          <h2 className="text-3xl mx-auto text-center mb-4"> Realizar recaudo </h2>
          <Form onSubmit={hacerRetiro} grid >
            <Input
              id={"Codigo_nit"}
              label={"Codigo convenio"}
              name={"Codigo_nit"}
              autoComplete="off"
              defaultValue={dataRetiro[0].pk_id_convenio}
              disabled
              required />
            <Input
              id={1}
              label={"Nombre cliente"}
              name={"nombre_cliente"}
              type="text"
              defaultValue={dataRetiro[0].nombre_cliente ?? ""}
              autoComplete="off"
              disabled
              required />
            <Input
              id={1}
              label={"Monto"}
              name={"monto"}
              type="text"
              minLength={"1"}
              maxLength={"15"}
              value={monto ?? ""}
              onChange={(e) => { setMonto(e.target.value) }}
              autoComplete="off"
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
      }
    </Fragment>
  )
}

export default FormularioRetiro