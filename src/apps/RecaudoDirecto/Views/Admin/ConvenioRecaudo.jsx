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
import Fieldset from "../../../../components/Base/Fieldset";
import { ExportToCsv } from "export-to-csv";
import { notifyPending } from "../../../../utils/notify";
import { getRecaudosList, addConveniosRecaudoList, modConveniosRecaudoList } from "../../utils/fetchFunctions"

const RecaudoDirecto = () => {
  const [listRecaudos, setListRecaudos] = useState('')
  const [selected, setSelected] = useState(false); // fila selecionada
  const [showModal, setShowModal] = useState(false)
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false)
  const [referencias, setReferencias] = useState([{
    "Nombre de Referencia": "",
    "Longitud minima": "",
    "Longitud maxima": "",
  }])
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });
  const [res] = useState([
    ["ID_PRODUCTOR", "NUMERO_DOCUMENTO", "NOMBRE_PRODUCTOR",
      "APELLIDO_PRODUCTOR", "TOTAL_PAGAR", "TIPO_PAGO", "NUMERO_QUINCENA"],
    [333, 332421116, "nombre", "apellido", 50000, "EFECTIVO", 125],
    [333, 332421117, "nombre", "apellido", 80000, "CONSIGNACION", 125],
    [333, 332421118, "nombre", "apellido", 1250000, "EFECTIVO", 125],
  ])
  const tipoModificacion = [
    { label: "Valor igual", value: 1 },
    { label: "Valor menor", value: 2 },
    { label: "Valor mayor", value: 3 },
    { label: "Valor menor o mayor", value: 4 },
  ]
  const tipoConvenio = [
    { label: "Interno", value: 1 },
    { label: "Con autorizador", value: 2 },
    { label: "Sin base de datos", value: 3 },
  ]

  useEffect(() => {
    let referencia = []
    if (selected['referencias']) {
      for (let i in selected['referencias']) {
        referencia.push({
          "Nombre de Referencia": selected['referencias'][i]['nombre_referencia'],
          "Longitud minima": selected['referencias'][i]['length'][0],
          "Longitud maxima": selected['referencias'][i]['length'][1],
        })
      }
    }
    else {
      referencia = [{
        "Nombre de Referencia": "",
        "Longitud minima": "",
        "Longitud maxima": "",
      }]
    }
    setReferencias(referencia)
  }, [selected])

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
    setReferencias([{
      "Nombre de Referencia": "",
      "Longitud minima": "",
      "Longitud maxima": "",
    }])
  }, []);

  const getRecaudos = useCallback(async () => {
    await getRecaudosList({
      ...pageData,
      ...searchFilters
    })
      .then((data) => {
        setListRecaudos(data?.obj?.results ?? []);
        setMaxPages(data?.obj?.maxPages ?? '')
      })
      .catch((err) => {
        // if (err?.cause === "custom") {
        //   notifyError(err?.message);
        //   return;
        // }
        console.error(err?.message);
      });
    setCargando(true)
  }, [pageData, searchFilters])

  useEffect(() => { getRecaudos() }, [getRecaudos, pageData, searchFilters])

  useEffect(() => {
    setPageData(pageData => ({ ...pageData, page: 1 }));
  }, [pageData.limit]);


  const crearModificarConvenioRecaudo = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    if (body['Nombre de Referencia']) {
      delete body['Nombre de Referencia']; delete body['Longitud minima']; delete body['Longitud maxima']
      let allReferencias = []
      for (let i in referencias) {
        allReferencias.push({
          "nombre_referencia": referencias[i]["Nombre de Referencia"],
          "length": [referencias[i]["Longitud minima"], referencias[i]["Longitud maxima"],]
        })
      }
      body['referencias'] = allReferencias
      console.log(body)
    }
    notifyPending(
      selected
        ? modConveniosRecaudoList({ convenio_id: selected?.pk_id_convenio_directo ?? '' }, body)
        : addConveniosRecaudoList(body),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          handleClose();
          getRecaudos();
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
  }, [handleClose, getRecaudos, selected, referencias])


  const descargarPlantilla = useCallback(() => {
    const options = {
      fieldSeparator: ";",
      quoteStrings: '"',
      decimalSeparator: ",",
      showLabels: true,
      showTitle: false,
      title: `Ejemplo_de_archivo_recaudo_csv`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: false,
      filename: `Ejemplo_de_archivo_recaudo`,
    };
    const csvExporter = new ExportToCsv(options);
    const data = JSON.stringify(res);
    csvExporter.generateCsv(data);
  }, [res]);

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
          data={listRecaudos.map(
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
              permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
              estado: estado ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "ninguna",
            })
          )}
          onSelectRow={(e, i) => {
            setShowModal(true);
            setSelected(listRecaudos[i]);
          }}
          maxPage={maxPages}
          onSetPageData={setPageData}
          onChange={(ev) => {
            setSearchFilters((old) => ({
              ...old,
              [ev.target.name]: ev.target.value,
            }))
          }}
          actions={{
            download: descargarPlantilla,
          }}
        >
          <Input
            id={"pk_codigo_convenio"}
            label={"Código de convenio"}
            name={"pk_id_convenio_directo"}
            type="tel"
            autoComplete="off"
            maxLength={"4"}
            onChange={(ev) => { }}

          />
          <Input
            id={"codigo_ean_iac_search"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            type="tel"
            autoComplete="off"
            maxLength={"13"}
            onChange={(ev) => { }}
          />
          <Input
            id={"nombre_convenio"}
            label={"Nombre del convenio"}
            name={"nombre_convenio"}
            type="text"
            autoComplete="off"
            maxLength={"30"}
            onChange={(ev) => { }}
          />
        </TableEnterprise>
      </>) : (<>Cargando...</>)}
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
            required
          />
          <Input
            id={"NIT"}
            label={"Nit"}
            name={"nit"}
            type="text"
            placeholder={"333.333.333-3"}
            autoComplete="off"
            defaultValue={selected?.nit ?? ""}
            required
          />
          <Select
            className="place-self-stretch"
            id={"Tipo modificacion"}
            label={"Tipo modificacion"}
            name={"fk_modificar_valor"}
            options={[{ label: "", value: "" }, ...tipoModificacion]}
            defaultValue={selected?.fk_modificar_valor ?? ""}
            required
          />
          <Select
            className="place-self-stretch"
            id={"Tipo de convenio"}
            label={"Tipo de convenio"}
            name={"fk_id_tipo_convenio"}
            options={[{ label: "", value: "" }, ...tipoConvenio]}
            defaultValue={selected?.fk_id_tipo_convenio ?? ""}
            required
            disabled={selected ? true : false}
          />
          <Input
            id={"codigo_ean_iac"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            defaultValue={selected?.ean13 ?? ""}
            // disabled={selected ? true : false}
            autoComplete="off"
          />

          <Fieldset legend={"Referencias"}>
            {referencias?.map((obj, index) => {
              return (
                <div key={index}>
                  {Object.entries(obj).map(([keyRef, valRef]) => {
                    return (
                      <Input
                        key={keyRef}
                        className={"mb-4"}
                        id={`${keyRef}_${index}`}
                        name={keyRef}
                        label={keyRef}
                        type={`${keyRef.includes("Longitud") ? "number" : "text"}`}
                        autoComplete="off"
                        value={valRef}
                        onChange={(e) => {
                          const copyRef = [...referencias];
                          copyRef[index][keyRef] = e.target.value;
                          setReferencias(copyRef);
                        }}
                        required
                      />
                    );
                  })}
                  {referencias.length > 1 &&
                    <ButtonBar>
                      <Button
                        type='button'
                        onClick={() => {
                          let copyRef = [...referencias]
                          copyRef = copyRef.filter((item) => item !== copyRef[index])
                          setReferencias(copyRef)
                          getRecaudos()
                        }}
                      >Eliminar referencia</Button>
                    </ButtonBar>
                  }
                </div>
              )
            })}
            {referencias.length < 2 &&
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    let copyRef = [...referencias]
                    if (copyRef.length < 2) {
                      copyRef.push({
                        "Nombre de Referencia": "",
                        "Longitud minima": "",
                        "Longitud maxima": "",
                      })
                      setReferencias(copyRef)
                      getRecaudos()
                    }
                  }}
                >Añadir referencia</Button>
              </ButtonBar>
            }
          </Fieldset>
          {/*  */}
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

export default RecaudoDirecto