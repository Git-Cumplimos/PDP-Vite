import { Fragment, useCallback, useEffect, useState } from "react";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../hooks/useMap";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import DataTable from "../../../../components/Base/DataTable";
import ToggleInput from "../../../../components/Base/ToggleInput";
import Select from "../../../../components/Base/Select";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import TextArea from "../../../../components/Base/TextArea";
import Fieldset from "../../../../components/Base/Fieldset";
import MoneyInput from "../../utils/MoneyInput";
import { notifyPending } from "../../../../utils/notify";
import { onChangeEan13Number, onChangeNit, descargarCSV, changeDateFormat } from "../../utils/functions";
import { getUrlRecaudosList, addConveniosRecaudoList, modConveniosRecaudoList } from "../../utils/fetchFunctions"
import { onChangeNumber } from "../../../../utils/functions";

const initialSearchFilters = new Map([
  ["pk_id_convenio_directo", ""],
  ["ean13", ""],
  ["nombre_convenio", ""],
  ["page", 1],
  ["limit", 10],
]);

const RecaudoDirecto = () => {
  const [listRecaudos, setListRecaudos] = useState([])
  // const [sinBaseDatos, setSinBaseDatos] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showModal, setShowModal] = useState(false)
  const [isNextPage, setIsNextPage] = useState(false);
  const [limites, setlimites] = useState({
    "Valor minimo": "0",
    "Valor maximo": "0",
  })
  const [referencias, setReferencias] = useState([{
    "Nombre de Referencia": "",
    "Longitud minima": "",
    "Longitud maxima": "",
  }])

  const [res] = useState([
    ["REFERENCIA_1", "REFERENCIA_2",
      "APELLIDO_PRODUCTOR", "TOTAL_PAGAR","FECHA_VENCIMIENTO", "NUMERO_QUINCENA"],
    [332421116, "JUAN", "apellido", 50000, "8/06/2023", 125],
    [332421117, "PEDRO", "apellido", 80000, "16/06/2023", 125],
    [332421118, "MARIA", "apellido", 1250000, "12/06/2023", 125],
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

  const [searchFilters2, { setAll: setSearchFilters2, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListRecaudos(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist);
    }, []),
    onError: useCallback((error) => {
      if (!error instanceof DOMException) console.error(error)
    }, []),
  });

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters2);
    const url = getUrlRecaudosList()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [fetchTrxs, searchFilters2]);

  useEffect(() => {
    searchTrxs();
  }, [searchTrxs]);

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
    let limite = {}
    if (selected['limite_monto']) {
      limite = {
        "Valor minimo": selected['limite_monto'][0] ?? 0,
        "Valor maximo": selected['limite_monto'][1] ?? 0,
      }
    } else {
      limite = {
        "Valor minimo": "0",
        "Valor maximo": "0",
      }
    }
    setlimites(limite)
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
    setlimites({
      "Valor minimo": "0",
      "Valor maximo": "0",
    })
  }, []);

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
    }
    if (body['Valor minimo'] || body['Valor maximo']) {
      delete body['Valor minimo']; delete body['Valor maximo'];
      body['limite_monto'] = [`${[limites['Valor minimo']] ?? 0 }`, `${limites['Valor maximo'] ?? 0}`]
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
          searchTrxs();
          handleClose();
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
          return `${selected ? "Edicion" : "Creación"} fallida`;
        },
      }
    )
  }, [handleClose, searchTrxs, selected, referencias, limites])

  const descargarPlantilla = useCallback(() => {
    descargarCSV('Ejemplo_de_archivo_recaudo', res)
  }, [res]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de Recaudos Directo</h1>
      <ButtonBar>
        <Button type={"submit"} onClick={() => setShowModal(true)} >
          Crear Convenio</Button>
      </ButtonBar>
      <DataTable
        title="Convenios de Recaudos"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
          "Estado",
          "Fecha creación",
        ]}
        data={listRecaudos.map(
          ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
            estado,
            fecha_creacion,
          }) => {
            fecha_creacion = changeDateFormat(fecha_creacion)
            return {
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              estado: estado ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "ninguna",
            }
          }
        )}
        onClickRow={(_, index) => {
          setShowModal(true);
          setSelected(listRecaudos[index]);
        }}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={10}
              onChangeLimit={(limit) => {
                setSingleFilter("limit", limit);
                setSingleFilter("page", 1)
              }}
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSingleFilter("page", (oldPage) =>
                  isNextPage ? oldPage + 1 : oldPage
                )
              }
              onClickPrev={(_) =>
                setSingleFilter("page", (oldPage) =>
                  oldPage > 1 ? oldPage - 1 : oldPage
                )
              }
            />
          </Fragment>
        }
        onChange={(ev) => {
          setSearchFilters2((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name, ev.target.value
              )
              .set("page", 1);
            return copy;
          })
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
          maxLength={"4"}
          onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
          autoComplete="off"
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"ean13"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onInput={(ev) => { ev.target.value = onChangeEan13Number(ev); }}
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
      </DataTable>
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> {selected ? "Editar" : "Crear"} convenio</h2>
        <Form onSubmit={crearModificarConvenioRecaudo} grid >
          {selected && (
            <Input
              id={"Codigo_convenio"}
              label={"Codigo convenio"}
              name={"pk_id_convenio_directo"}
              autoComplete="off"
              defaultValue={selected?.pk_id_convenio_directo ?? ""}
              disabled={selected ? true : false}
              required
            />
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
            defaultValue={selected?.nit ?? ""}
            onInput={(ev) => { ev.target.value = onChangeNit(ev); }}
            autoComplete="off"
            required
          />
          <Select
            className="place-self-stretch"
            id={"Tipo de convenio"}
            label={"Tipo de convenio"}
            name={"fk_id_tipo_convenio"}
            options={[{ label: "", value: "" }, ...tipoConvenio]}
            defaultValue={selected?.fk_id_tipo_convenio ?? ""}
            // onInput={(e) => { setSinBaseDatos(e.target.value === 3 ? true : false) }}
            required
            disabled={selected ? true : false}
          />
          <Input
            id={"codigo_ean_iac"}
            label={"Código EAN o IAC"}
            name={"ean13"}
            type='tel'
            maxLength={"13"}
            onInput={(ev) => { ev.target.value = onChangeEan13Number(ev); }}
            defaultValue={selected?.ean13 ?? ""}
            autoComplete="off"
          />
          <Fieldset legend={"Valores"}>
            <Select
              className="place-self-stretch mb-1"
              id={"Tipo modificación"}
              label={"Tipo modificación"}
              name={"fk_modificar_valor"}
              options={[{ label: "", value: "" }, ...tipoModificacion]}
              defaultValue={selected?.fk_modificar_valor ?? ""}
              required
            />
            {Object.entries(limites).map(([keyLimit, valLimit], index) => {
              return (
                <MoneyInput
                  key={keyLimit}
                  className={"mb-1"}
                  id={`${keyLimit}_${index}`}
                  name={keyLimit}
                  label={keyLimit}
                  autoComplete="off"
                  value={valLimit}
                  equalError={false}
                  onInput={(e, valor) => {
                    const copyRef = { ...limites };
                    copyRef[keyLimit] = valor;
                    setlimites(copyRef);
                  }}
                  required
                />
              )
            })}
          </Fieldset>
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
                    }
                  }}
                >Añadir referencia</Button>
              </ButtonBar>
            }
          </Fieldset>
          <TextArea
            id={"Observaciones"}
            label={"Observaciones"}
            name={"observaciones"}
            type="text"
            autoComplete="off"
            defaultValue={selected?.observaciones ?? ""}
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
              defaultChecked={selected?.estado ?? ""}
            />
          )}
          <ButtonBar>
            <Button type={"submit"} >
              {selected ? "Realizar cambios" : "Crear Convenio"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment >
  )
}

export default RecaudoDirecto