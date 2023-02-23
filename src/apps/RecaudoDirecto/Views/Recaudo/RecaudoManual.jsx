import { Fragment, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { getRecaudosList } from "../../utils/fetchFunctions"


// const datos = {
//   "name": "State",
//   "value": [
//     { activo: true, codigo_ean_iac: '0000000000000', pk_id_convenio: 2041, nombre_convenio: 'pruebas', fecha_creacion: '2022-07-10' },
//     { activo: true, codigo_ean_iac: '8978945645614', pk_id_convenio: 2037, nombre_convenio: 'pruebas2', fecha_creacion: '2023-05-06' },
//   ],
// }

const RecaudoManual = () => {
  const navigate = useNavigate();


  const [listRecaudos, setListRecaudos] = useState('')
  const [cargando, setCargando] = useState(false)

  const getRecaudos = useCallback(async() => {
    await getRecaudosList()
      .then((data) => { setListRecaudos(data) })
    setCargando(true)
  }, [])

  useEffect(() => { getRecaudos() }, [getRecaudos])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Consulta recaudos manual</h1>
      {cargando ? (
      <TableEnterprise
        title="Convenios de recaudo"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
        ]}
        // data={datos['value'].map(
        data={listRecaudos.map(
          ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
          }) => ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
          })
        )}
        onSelectRow={(e, i) => {
          navigate(`/recaudo-directo/recaudo/${listRecaudos[i].pk_id_convenio_directo}`)
        }}
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_codigo_convenio_directo"}
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
          name={"ean13"}
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
      ) : (<>cargando...</>)}
    </Fragment>
  )
}

export default RecaudoManual