import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { searchConveniosRecaudoList } from "../../utils/fetchFunctions"

const RecaudoConjunto = () => {
  const navigate = useNavigate()

  const { pk_id_convenio } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [dataRecaudo, setDataRecaudo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [referencia, setReferencia] = useState('')
  const [convenioRetiro, setConvenioRetiro] = useState(null);

  const recaudoDirectos = [
    { pk_id_convenio: 1, referencia: 650122, nombre_cliente: "Kevin Guevara", valor: "25000" },
    { pk_id_convenio: 4, referencia: 660122, nombre_cliente: "Maria Reyes", valor: "35000" },
  ]

  const getData = useCallback(async() => {
    try {
      let rest =await searchConveniosRecaudoList({convenio_id:pk_id_convenio})
        .then((rest)=>{ return rest })
      if (rest.length < 1) throw "no hay datos"
      setConvenioRetiro(rest.obj)
      setCargando(true)
    } catch (e) {
      alert("error")
      navigate("/recaudo-directo/recaudo")
    }
  }, [navigate,pk_id_convenio])

  const consultarRecaudoD = (e) => {
    // Datos Estaticos
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

  useEffect(() => {getData()}, [getData,pk_id_convenio])
    
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
                  <Button onClick={()=>handleClose()} >
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