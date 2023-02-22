import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";


const RecaudoConjunto = () => {
  const navigate = useNavigate()

  const convenios = {
    "name": "State",
    "value": [
      { activo: true, codigo_ean_iac: '0000000000000', id_convenio: 2041, nombre_convenio: 'pruebas', fecha_creacion: '2022-07-10' },
      { activo: true, codigo_ean_iac: '8978945645614', id_convenio: 2037, nombre_convenio: 'pruebas2', fecha_creacion: '2023-05-06' },
    ],
  }
  const [data, setData] = useState('')
  const [cargando, setCargando] = useState(false)
  const { pk_id_convenio } = useParams()

  const getData = useCallback(() => {
    try {
      let rest = convenios['value'].filter((conv) => conv.id_convenio == pk_id_convenio)
      if (rest.length < 1) throw "no hay datos"
      return rest
    }catch(e){
      return e
    }
  }, [pk_id_convenio])

  const getDataMemo = useMemo(() => { return getData() }, [pk_id_convenio])

  useEffect(() => {
    getDataMemo == "no hay datos" ? navigate(
      "/recaudo-directo/recaudo"
    ): setData(getDataMemo)
    setCargando(true)
  }, [pk_id_convenio])

  return (
    <>
      {cargando ? (
        <Fragment>
          <h1 className="text-3xl mt-6">Recaudos</h1>
          <Form>
            <Input
              label='Número de convenio'
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
              autoComplete='off'
              disabled
            />
            <ButtonBar className={"lg:col-span-2"}>
              <Button type={"submit"} >
                Realizar consulta
              </Button>
            </ButtonBar>
          </Form>

        </Fragment>
      ) : (<> Cargando...</>)}
    </>

  )
}

export default RecaudoConjunto