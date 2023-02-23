import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";

// import getRecaudosList from "../utils/fetchFunctions"


const convenioRetiro = {
  "name": "State",
  "value": [
    { activo: true, codigo_ean_iac: '0000000000000', pk_id_convenio: 2041, nombre_convenio: 'pruebas', fecha_creacion: '2022-07-10', },
    { activo: true, codigo_ean_iac: '8978945645614', pk_id_convenio: 2037, nombre_convenio: 'pruebas2', fecha_creacion: '2023-05-06', },
  ],
}
const retirosDirectos = [
  { pk_id_convenio: 2041, otp: 650122, nombre_cliente: "Kevin Guevara", monto: "25000" },
  { pk_id_convenio: 2041, otp: 660122, nombre_cliente: "Juliana Reyes", monto: "35000" },
  { pk_id_convenio: 2042, otp: 670122, nombre_cliente: "Camila Hernandez", monto: "5.000" },
  { pk_id_convenio: 2043, otp: 680122, nombre_cliente: "Nicolas Guerrero", monto: "125.000" },
]

const RetiroDirecto = () => {
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState('');
  const [id_convenio, setId_Convenio] = useState(null);
  const [otp, setOtp] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [monto, setMonto] = useState(null);

  const optionsDocumento = [
    { value: "01", label: "Cédula Ciudadanía" },
    { value: "02", label: "Cédula Extranjería" },
    { value: "04", label: "Tarjeta Identidad" },
    { value: "13", label: "Registro Civil" },
  ];
  const [busqueda, setBusqueda] = useState('');
  // const [listRetiros,setListRetiros] = useState('')

  // const getRecaudos = useCallback(() => {
  //     getRecaudosList()
  //     .then((res)=>{res.json()})
  //     .then((data)=>{setListRetiros(data)})
  // },[/*pages*/])

  // useEffect(()=>{getRecaudos()},[])

  const consultarRetiroDirecto = useCallback((e) => {
    e.preventDefault();
    // Funcionalidad Basica ()
    const buscarCuentaRetiro = retirosDirectos.filter((data) => {
      return data.pk_id_convenio == e.target.Codigo_nit.value && parseInt(data.otp) == parseInt(otp)
    })
    if (buscarCuentaRetiro.length < 1) { setOtp(''); setTipoDocumento(''); setDocumento('');alert("Datos Incorrectos"); return false }
    if (parseInt(monto) <= parseInt(buscarCuentaRetiro[0].monto) ) {
      alert("Retiro Exitoso")
      buscarCuentaRetiro[0].monto = buscarCuentaRetiro[0].monto - monto
      setShowModal(false);
      setSelected(false)
    }else {alert("Saldo insuficiente")}
  }, [selected?.id_convenio, otp, tipoDocumento, documento, monto])

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
  }, []);
  useEffect(() => {
  if (selected !== '') navigate(`/recaudo-directo/consultar-retiro/retirar/${selected.pk_id_convenio}/${selected.nombre_convenio}`)
  }, [selected]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Retiros Directos</h1>
      <TableEnterprise
        title="Convenios de Retiros"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
        ]}
        data={convenioRetiro['value'].map(
          ({
            pk_id_convenio,
            codigo_ean_iac,
            nombre_convenio,
          }) => ({
            pk_id_convenio,
            codigo_ean_iac,
            nombre_convenio,
          })
        )}
        onSelectRow={(e, i) => {
          setShowModal(true);
          setSelected(convenioRetiro['value'][i]);
        }}
        onChange={(ev) => {
          setBusqueda(ev)
        }
          // setSearchFilters((old) => ({
          //   ...old,
          //   [ev.target.name]: ev.target.value,
          // }))
        }
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_codigo_convenio"}
          type="tel"
          autoComplete="off"
          maxLength={"4"}
          onChange={(ev) => {
            // ev.target.value = onChangeNumber(ev);
          }}
          // defaultValue={selected?.pk_codigo_convenio ?? ""}
          // readOnly={selected}
          required
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"codigo_ean_iac"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onChange={(ev) => {
            // ev.target.value = onChangeNumber(ev);
          }}
          // defaultValue={selected?.codigo_ean_iac ?? ""}
          required
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
          // defaultValue={selected?.nombre_convenio ?? ""}
          required
        />
      </TableEnterprise>
      {/* <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> Realizar retiro </h2>
        <Form onSubmit={consultarRetiroDirecto} grid >
          <Input
            id={"Codigo_nit"}
            label={"Codigo convenio"}
            name={"Codigo_nit"}
            autoComplete="off"
            defaultValue={selected?.pk_id_convenio ?? ""}
            disabled
            required />
          <Input
            id={"codigo_ean_iac"}
            label={"Código EAN o IAC"}
            name={"codigo_ean_iac"}
            defaultValue={selected?.codigo_ean_iac ?? ""}
            autoComplete="off"
            disabled
          />
          <Input
            id={"nombre_convenio"}
            label={"Nombre convenio"}
            name={"nombre_convenio"}
            type="text"
            defaultValue={selected?.nombre_convenio ?? ""}
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
            onChange={(e) => { setOtp(e.target.value) }}
            autoComplete="off"
            required />
          <Select
            id='tipoDocumento'
            label='Tipo de documento'
            options={optionsDocumento}
            onChange={(e) => { setTipoDocumento(e.target.value) }}
            required
          />
          <Input
            id={1}
            label={"Documento Cliente"}
            name={"documento"}
            type="text"
            minLength={"5"}
            maxLength={"11"}
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
            onChange={(e) => { setMonto(e.target.value) }}
            autoComplete="off"
            required />
          {selected && (
            <ToggleInput
              id={"activo"}
              label={"Se encuentra activo"}
              name={"activo"}
              defaultChecked={selected?.activo}
              disabled
            />
          )}
          <ButtonBar>
            <Button type={"submit"} >
              Retirar
            </Button>
          </ButtonBar>
        </Form>
      </Modal> */}

    </Fragment>
  )
}

export default RetiroDirecto