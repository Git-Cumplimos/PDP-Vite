import { Fragment } from 'react'
import Button from '../../../../components/Base/Button'
import ButtonBar from '../../../../components/Base/ButtonBar'
import Form from '../../../../components/Base/Form'

const ReportesCierre = () => {
  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Reportes</h1>
      <Form grid>
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">
            Descargar reporte de arqueo
            <p className='w-full whitespace-pre-wrap'></p>
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  )
}

export default ReportesCierre