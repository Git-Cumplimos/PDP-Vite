import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import TextArea from "../../../../components/Base/TextArea";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { getRetirosList, addConveniosRetiroList, modConveniosRetiroList } from "../../utils/fetchFunctions"

const tiposValores = [{ label: "1ra opcion", value: 1 }, { label: "2da opcion", value: 2 }]

const RetiroDirecto = () => {
  const [listRetiro, setListRetiro] = useState('');
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
  }, []);

  const getConvRetiro = useCallback(async () => {
    await getRetirosList({
      ...searchFilters,
      limit: pageData.limit,
      offset: pageData.page === 1 ? 0 : (pageData.page * pageData.limit) - pageData.limit
    })
    .then((data) => {
      setListRetiro(data?.obj?.results ?? []);
      setMaxPages(data?.obj?.maxPages ?? '')
    })
    .catch((err) => {
      // setListRetiro([]);
      // if (err?.cause === "custom") {
      //   notifyError(err?.message);
      //   return;
      // }
      console.error(err?.message);
    });

    setCargando(true)
  }, [pageData, searchFilters])

  const crearModificarConvenioRetiro = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    console.log(body)
    notifyPending(
      selected
        ? modConveniosRetiroList({ convenio_id: selected?.pk_id_convenio_directo ?? '' }, body)
        : addConveniosRetiroList(body),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          // console.log(res);
          handleClose();
          getConvRetiro();
          return `Convenio ${selected ? "modificado" : "agregado"
            } exitosamente`;
        },
      },
      {
        render({ data: err }) {
          if (err?.cause === "custom") {
            return err?.message;
          }
          console.error(err?.message);
          return `${selected ? "Edicion" : "Creacion"} fallida`;
        },
      }
    )
    // if (!selected) { addConveniosRetiroList(body); handleClose() }
    // else { modConveniosRetiroList({ convenio_id: selected.pk_id_convenio_directo }, body); handleClose() }
  }, [handleClose, getConvRetiro,selected])

  useEffect(() => { getConvRetiro() }, [getConvRetiro, pageData, searchFilters])

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Retiros Directos</h1>
      <ButtonBar>
        <Button type={"submit"} onClick={() => setShowModal(true)} >
          Crear Convenio</Button>
      </ButtonBar>
      {cargando ? (<>
        <TableEnterprise
          title="Convenios de Retiros"
          headers={[
            "Código convenio",
            "Código EAN o IAC",
            "Nombre convenio",
            "Estado",
            "Fecha creacion",
          ]}
          data={listRetiro.map(
            ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              permite_vencidos,
              estado,
              fecha_creacion,
            }) => ({
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              estado: estado ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "No indicada",
            })
          )}
          maxPage={maxPages}
          onSetPageData={setPageData}
          onSelectRow={(e, i) => {
            setShowModal(true);
            setSelected(listRetiro[i]);
          }}
          onChange={(ev) => {
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }}
        >
          <Input
            id={"pk_codigo_convenio"}
            label={"Código de convenio"}
            name={"pk_id_convenio_directo"}
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
      </>) : (<>cargando...</>)}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> {selected ? "Editar" : "Crear"} convenio</h2>
        <Form onSubmit={crearModificarConvenioRetiro} grid >
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

          <Input
            id={"NIT"}
            label={"Nit"}
            name={"nit"}
            type="text"
            autoComplete="off"
            defaultValue={selected?.nit ?? ""}
            required />
          <Select
            className="place-self-stretch"
            id={"id valor a modificar"}
            label={"id valor para modificar"}
            name={"fk_modificar_valor"}
            options={[{ label: "", value: "" }, ...tiposValores]}
            defaultValue={selected?.fk_modificar_valor ?? ""}
            required
          />
          <Input
            id={"codigo_ean_iac"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            defaultValue={selected?.ean13 ?? ""}
            // disabled={selected ? true : false}
            autoComplete="off"
          />
          <TextArea
            id={1}
            label={"Observaciones"}
            name={"observaciones"}
            type="text"
            autoComplete="off"
            defaultValue={selected?.observaciones ?? ""}
            required
          />
          <ToggleInput
            id={"permite_vencidos"}
            label={"Permite vencidos"}
            name={"permite_vencidos"}
            defaultChecked={selected?.permite_vencidos ?? ""}
          />
          {selected && (
            <ToggleInput
              id={"activo"}
              label={"Se encuentra activo"}
              name={"estado"}
              defaultChecked={selected?.estado}
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

export default RetiroDirecto