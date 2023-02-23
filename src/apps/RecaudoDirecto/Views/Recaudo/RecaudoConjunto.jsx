import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { consultarRecaudo } from "../../../Recaudo/Views/utils";


const RecaudoConjunto = () => {
  const navigate = useNavigate()

  const convenios = {
    "name": "State",
    "value": [
      { activo: true, codigo_ean_iac: '0000000000000', id_convenio: 2041, nombre_convenio: 'pruebas', fecha_creacion: '2022-07-10' },
      { activo: true, codigo_ean_iac: '8978945645614', id_convenio: 2037, nombre_convenio: 'pruebas2', fecha_creacion: '2023-05-06' },
    ],
  }
  const recaudoDirectos = [
    { pk_id_convenio: 2041, referencia: 650122, nombre_cliente: "Kevin Guevara", valor: "25000" },
    { pk_id_convenio: 2037, referencia: 660122, nombre_cliente: "Maria Reyes", valor: "35000" },
  ]
  const { pk_id_convenio } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState('')
  const [dataRecaudo, setDataRecaudo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [referencia, setReferencia] = useState('')


  const getData = useCallback(() => {
    try {
      let rest = convenios['value'].filter((conv) => conv.id_convenio == pk_id_convenio)
      if (rest.length < 1) throw "no hay datos"
      return rest
    } catch (e) {
      return e
    }
  }, [pk_id_convenio])

  const getDataMemo = useMemo(() => { return getData() }, [pk_id_convenio])

  const consultarRecaudoD = (e) => {
    e.preventDefault()
    const buscarRecaudo = recaudoDirectos.filter((data) => {
      return parseInt(data.pk_id_convenio) === parseInt(e.target.id_convenio.value) && parseInt(data.referencia) === parseInt(referencia)
    })
    if (buscarRecaudo.length < 1) { setReferencia(''); alert("Datos Incorrectos"); return false }
    setDataRecaudo(buscarRecaudo)
    setShowModal(true);
  }
  const hacerRecaudo = (e) => {
    e.preventDefault()
  }
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    getDataMemo == "no hay datos" ? navigate(
      "/recaudo-directo/recaudo"
    ) : setData(getDataMemo)
    setCargando(true)
  }, [pk_id_convenio])

  return (
    <>
      {cargando ? (
        <Fragment>
          <h1 className="text-3xl mt-6">Recaudos</h1>
          <Form onSubmit={consultarRecaudoD}>
            <Input
              label='Número de convenio'
              name={"id_convenio"}
              type='text'
              autoComplete='off'
              defaultValue={data[0].id_convenio}
              disabled
            />
            <Input
              label='Código EAN o IAC'
              type='text'
              defaultValue={data[0].codigo_ean_iac}
              autoComplete='off'

              disabled
            />
            <Input
              label='Nombre de convenio'
              type='text'
              defaultValue={data[0].nombre_convenio}
              autoComplete='off'
              disabled
            />
            <Input
              label='Factura/Referencia'
              type='text'
              value={referencia ?? ""}
              onChange={(e) => { setReferencia(e.target.value) }}
              autoComplete='off'
              required
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"}>
                Realizar consulta
              </Button>
            </ButtonBar>
          </Form>
          {dataRecaudo !== '' &&
            <Modal show={showModal} handleClose={handleClose}>
              <h2 className="text-3xl mx-auto text-center mb-4"> Realizar recaudo </h2>
              <Form onSubmit={hacerRecaudo} grid >
                <Input
                  id={"Codigo_nit"}
                  label={"Codigo convenio"}
                  name={"Codigo_nit"}
                  autoComplete="off"
                  defaultValue={dataRecaudo[0].pk_id_convenio}
                  disabled
                  required />
                <Input
                  id={1}
                  label={"Nombre cliente"}
                  name={"nombre_cliente"}
                  type="text"
                  defaultValue={dataRecaudo[0].nombre_cliente ?? ""}
                  autoComplete="off"
                  disabled
                  required />
                <Input
                  id={1}
                  label={"Valor"}
                  name={"valor"}
                  type="text"
                  defaultValue={dataRecaudo[0].valor ?? ""}
                  autoComplete="off"
                  disabled
                  required />
                <ButtonBar>
                  <Button type={"submit"} >
                    Aceptar
                  </Button>
                  <Button type={"submit"} >
                    Cancelar
                  </Button>
                </ButtonBar>
              </Form>
            </Modal>
          }

        </Fragment>
      ) : (<> Cargando...</>)}
    </>

  )
}

export default RecaudoConjunto