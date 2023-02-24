import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { getRecaudosList, addConveniosRecaudoList,modConveniosRecaudoList } from "../../utils/fetchFunctions"

const tiposValores = [{ label: "verdadero", value: true }, { label: "falso", value: false }]

const RecaudoDirecto = () => {
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [listRecaudos, setListRecaudos] = useState('')
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false)
  const [crear, setCrear] = useState(false)

  const getRecaudos = useCallback(async () => {
    // console.log("pagina",pageData.page,"limite", pageData.limit,"offset",pageData.page === 1 ? 0 : (pageData.page*pageData.limit)-pageData.limit)
    await getRecaudosList({ limit: pageData.limit, offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit })
      .then((data) => { setListRecaudos(data.results); setMaxPages(data.maxPages) })
    setCargando(true)
  }, [pageData])

  useEffect(() => { getRecaudos() }, [getRecaudos, pageData])

  const crearModificarConvenioRecaudo = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    if (!selected) { addConveniosRecaudoList(body); handleClose()}
    else{ modConveniosRecaudoList({convenio_id:selected.pk_id_convenio_directo},body); handleClose()}
  }, [selected])

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
  }, []);


  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Recaudos Directo</h1>
      <ButtonBar>
        <Button type={"submit"} onClick={() => setShowModal(true)} >
          Crear Convenio</Button>
      </ButtonBar>
      {cargando ? (<>
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
          // data={datos['value'].map(
          data={listRecaudos.map(
            ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              permite_vencidos,
              activo,
              fecha_creacion,
            }) => ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
              activo: activo ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "ninguna" ,
            })
          )}
          onSelectRow={(e, i) => {
            setShowModal(true);
            setSelected(listRecaudos[i]);
          }}
          maxPage={maxPages}
          onSetPageData={setPageData}
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
      </>) : (<>cargando...</>)}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> {selected ? "Editar" : "Crear"} convenio</h2>
        <Form onSubmit={crearModificarConvenioRecaudo} grid >
          {selected && (
            <>
              <Input
                id={"Codigo_convenio"}
                label={"Codigo convenio"}
                name={"pk_id_convenio_directo"}
                autoComplete="off"
                defaultValue={selected?.pk_id_convenio_directo ?? ""}
                disabled={selected ? true : false}
                required />
            </>
          )}
          <Input
            id={"nombre_convenio"}
            label={"Nombre convenio"}
            name={"nombre_convenio"}
            type="text"
            defaultValue={selected?.nombre_convenio ?? ""}
            autoComplete="off"
            required />
          {/* {!selected && ( */}
            <>
              <Input
                id={"NIT"}
                label={"nit"}
                name={"nit"}
                type="text"
                autoComplete="off"
                defaultValue={selected?.nit ?? ""}
                required />
              <Input
                id={"id valor a modificar"}
                label={"id valor para modificar"}
                name={"fk_modificar_valor"}
                defaultValue={selected?.fk_modificar_valor ?? ""}
                type="number"
                autoComplete="off"
                required />
            </>
          {/* )} */}
          <Input
            id={"codigo_ean_iac"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            defaultValue={selected?.ean13 ?? ""}
            // disabled={selected ? true : false}
            autoComplete="off"
          />

          <Select
            className="place-self-stretch"
            id={"fk_tipo_valor"}
            label={"Permite vencidos"}
            name={"permite_vencidos"}
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
            defaultValue={selected?.observaciones ?? ""}
            required />
          {selected && (
            <Select
            className="place-self-stretch"
            id={"activo"}
            label={"Estado"}
            name={"estado"}
            options={[{ label: "", value: "" }, ...tiposValores]}
            defaultValue={selected?.estado ?? ""}
            required
          />
            // <ToggleInput
            //   id={"activo"}
            //   label={"Se encuentra activo"}
            //   name={"estado"}
            //   defaultChecked={selected?.activo}
            // />
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