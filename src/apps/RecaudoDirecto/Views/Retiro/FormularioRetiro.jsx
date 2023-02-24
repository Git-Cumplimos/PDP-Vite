import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";

const retirosDirectos = [
  { pk_id_convenio: 2041, otp: 650122, nombre_cliente: "Kevin Guevara", monto: "25000" },
  { pk_id_convenio: 2041, otp: 660122, nombre_cliente: "Juliana Reyes", monto: "35000" },
  { pk_id_convenio: 2042, otp: 670122, nombre_cliente: "Camila Hernandez", monto: "5.000" },
  { pk_id_convenio: 2043, otp: 680122, nombre_cliente: "Nicolas Guerrero", monto: "125.000" },
]
const FormularioRetiro = () => {
  const { pk_id_convenio } = useParams();
  const { nombre_convenio } = useParams();
  // const [datos]=  useSearchParams();


  const [id_convenio, setId_Convenio] = useState(null);
  const [otp, setOtp] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [monto, setMonto] = useState(null);

  const consultarRetiroDirecto = useCallback((e) => {
    e.preventDefault();
    // Funcionalidad Basica ()
    const buscarCuentaRetiro = retirosDirectos.filter((data) => {
      return data.pk_id_convenio === e.target.Codigo_nit.value && parseInt(data.otp) === parseInt(otp)
    })
    if (buscarCuentaRetiro.length < 1) { setOtp(''); setMonto(''); setDocumento(''); alert("Datos Incorrectos"); return false }
    if (parseInt(monto) <= parseInt(buscarCuentaRetiro[0].monto)) {
      alert("Retiro Exitoso")
      buscarCuentaRetiro[0].monto = buscarCuentaRetiro[0].monto - monto
    } else { alert("Saldo insuficiente"); setMonto('') }
  }, [otp, monto])

  return (
    <Fragment><h2 className="text-3xl mx-auto text-center mb-4"> Realizar retiro </h2>
      <Form onSubmit={consultarRetiroDirecto} grid >
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
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"submit"} >
            Retirar
          </Button>
        </ButtonBar>
      </Form></Fragment>
  )
}

export default FormularioRetiro