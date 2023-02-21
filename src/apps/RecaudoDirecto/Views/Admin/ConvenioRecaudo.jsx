import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
// import getRecaudosList from "../utils/fetchFunctions"


const datos = {
    "name": "State",
    "value": [
        { activo: true, codigo_ean_iac: '0000000000000', pk_id_convenio: 2041, nombre_convenio: 'pruebas', fecha_creacion: '2022-07-10', permite_vencidos: true },
        { activo: true, codigo_ean_iac: '8978945645614', pk_id_convenio: 2037, nombre_convenio: 'pruebas2', fecha_creacion: '2023-05-06', permite_vencidos: false },
    ],
}
const tiposValores = [{ label: "verdadero", value: true }, { label: "falso", value: false }]

const RecaudoDirecto = () => {
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null);
    // const [listRecaudos,setListRecaudos] = useState('')

    // const getRecaudos = useCallback(() => {
    //     getRecaudosList()
    //     .then((res)=>{res.json()})
    //     .then((data)=>{setListRecaudos(data)})
    // },[/*pages*/])

    // useEffect(()=>{getRecaudos()},[])

    const crearConvenioRecaudo = useCallback((e) => {
        e.preventDefault();
        console.log(e)
    }, [])
    const handleClose = useCallback(() => {
        setShowModal(false);
        setSelected(false)
    }, []);

    return (
        <Fragment>
            <h1 className="text-3xl mt-6">Convenios de Recaudos Directos</h1>
            <ButtonBar>
                <Button type={"submit"} onClick={() => setShowModal(true)} >
                    Crear Convenio</Button>
            </ButtonBar>
            <TableEnterprise
                title="Convenios de Recaudos"
                headers={[
                    "Código convenio",
                    "Código EAN o IAC",
                    "Nombre convenio",
                    "Permite vencidos",
                    "Estado",
                    "Fecha creacion",
                ]}
                data={datos['value'].map(
                    ({
                        pk_id_convenio,
                        codigo_ean_iac,
                        nombre_convenio,
                        permite_vencidos,
                        activo,
                        fecha_creacion,
                    }) => ({
                        pk_id_convenio,
                        codigo_ean_iac,
                        nombre_convenio,
                        permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
                        activo: activo ? "Activo" : "No activo",
                        fecha_creacion,
                    })
                )}
                onSelectRow={(e, i) => {
                    setShowModal(true);
                    setSelected(datos['value'][i]);
                }}
            >
            </TableEnterprise>
            <Modal show={showModal} handleClose={handleClose}>
                <h2 className="text-3xl mx-auto text-center mb-4"> {selected ? "Editar" : "Crear"} convenio</h2>
                <Form onSubmit={crearConvenioRecaudo} grid >
                    <Input
                        id={"Codigo_nit"}
                        label={"Codigo nit"}
                        name={"Codigo_nit"}
                        autoComplete="off"
                        defaultValue={selected?.pk_id_convenio ?? ""}
                        required />
                    <Input
                        id={"codigo_ean_iac"}
                        label={"Código EAN o IAC"}
                        name={"codigo_ean_iac"}
                        defaultValue={selected?.codigo_ean_iac ?? ""}
                        autoComplete="off"
                    />
                    <Input
                        id={"nombre_convenio"}
                        label={"Nombre convenio"}
                        name={"nombre_convenio"}
                        type="text"
                        defaultValue={selected?.nombre_convenio ?? ""}
                        autoComplete="off"
                        required />
                    <Select
                        className="place-self-stretch"
                        id={"fk_tipo_valor"}
                        label={"Permite vencidos"}
                        name={"fk_tipo_valor"}
                        options={[{ label: "", value: "" }, ...tiposValores]}
                        defaultValue={selected?.permite_vencidos ?? ""}
                        required
                    />
                    <Input
                        id={1}
                        label={"Observaciones"}
                        name={"observaciones"}
                        type="text"
                        autoComplete="off"
                        required />
                    {selected && (
                        <ToggleInput
                            id={"activo"}
                            label={"Se encuentra activo"}
                            name={"activo"}
                            defaultChecked={selected?.activo}
                        />
                    )}
                    <ButtonBar>
                        <Button type={"submit"} >
                            {selected ? "Realizar cambios" : "Crear Convenio"}
                        </Button>
                    </ButtonBar>
                </Form>
            </Modal>

        </Fragment>
    )
}

export default RecaudoDirecto