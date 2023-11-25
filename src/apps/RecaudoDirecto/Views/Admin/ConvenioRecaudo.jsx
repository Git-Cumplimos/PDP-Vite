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
import MoneyInput from "../../../../components/Base/MoneyInput";
import { notifyError, notifyPending } from "../../../../utils/notify";
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

const limitesMontos = {
  max: 9999999,
  min: 1,
};

const RecaudoDirecto = () => {
  const [listRecaudos, setListRecaudos] = useState([])
  // const [sinBaseDatos, setSinBaseDatos] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showModal, setShowModal] = useState(false)
  const [isNextPage, setIsNextPage] = useState(false);
  const [permiteRefExtra, setPermiteRefExtra] = useState(false);
  const [selecTipoConvenio, setSelecTipoConvenio] = useState(false);
  const [correos, setCorreos] = useState([]);
  const [limites, setlimites] = useState({
    "Valor mínimo": "0",
    "Valor máximo": "0",
  })
  const [referencias, setReferencias] = useState([{
    "Nombre de Referencia": "",
    "Longitud mínima": "",
    "Longitud máxima": "",
  }])
  const [referenciaExtra, setReferenciaExtra] = useState({
    "Longitud mínima ext": "",
    "Longitud máxima ext": "",
  })

  const [res] = useState([
    ["REFERENCIA_1", "REFERENCIA_2", "TOTAL_PAGAR", "FECHA_VENCIMIENTO"],
    [332421116, 432422226, 50000, "8/12/2023"],
    [332421117, 432422227, 80000, "16/10/2023"],
    [332421118, 432422228, 1250000, "12/11/2023"],
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
    { label: "Interno sin valor a pagar", value: 4 },
  ]
  const tipoArchivoConciliacion = [
    { label: "Reporte Genérico csv", value: "Reporte Generico csv" },
    { label: "Asobancaria 2001", value: "Asobancaria 2001" }
  ]
  const tipoReferenciaExtra = [
    { label: "Número Documento", value: 1 },
    { label: "Número Celular", value: 2 },
    { label: "Datos Extra Cliente", value: 3 },
  ]

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListRecaudos(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist);
    }, []),
    onError: useCallback((error) => {
      if (!error instanceof DOMException) console.error(error)
    }, []),
  }, { delay: 2000 });

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters);
    const url = getUrlRecaudosList()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [fetchTrxs, searchFilters]);

  useEffect(() => {
    searchTrxs();
  }, [searchTrxs]);

  useEffect(() => {
    let referencia = []
    let refExtra = false
    let limiteRefExtra = {}
    let limite = {}

    if (selected['referencias']) {
      for (let i in selected['referencias']) {
        referencia.push({
          "Nombre de Referencia": selected['referencias'][i]['nombre_referencia'],
          "Longitud mínima": selected['referencias'][i]['length'][0],
          "Longitud máxima": selected['referencias'][i]['length'][1],
        })
      }
    }
    else {
      referencia = [{
        "Nombre de Referencia": "",
        "Longitud mínima": "",
        "Longitud máxima": "",
      }]
    }

    if (selected['limite_monto']) {
      limite = {
        "Valor mínimo": selected['limite_monto'][0] ?? 0,
        "Valor máximo": selected['limite_monto'][1] ?? 0,
      }
    } else {
      limite = {
        "Valor mínimo": "0",
        "Valor máximo": "0",
      }
    }

    if (selected['limite_ref_extra']) {
      limiteRefExtra = {
        "Longitud mínima ext": selected['limite_ref_extra'][0] ?? 0,
        "Longitud máxima ext": selected['limite_ref_extra'][1] ?? 0,
      }
    } else {
      limiteRefExtra = {
        "Longitud mínima ext": "",
        "Longitud máxima ext": "",
      }
    }

    if (selected['permite_referencia_extra']) refExtra = true

    setlimites(limite)
    setReferencias(referencia)
    setReferenciaExtra(limiteRefExtra)
    setPermiteRefExtra(refExtra)
  }, [selected])

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false)
    setPermiteRefExtra(false)
    setReferencias([{
      "Nombre de Referencia": "",
      "Longitud mínima": "",
      "Longitud máxima": "",
    }])
    setlimites({
      "Valor mínimo": "0",
      "Valor máximo": "0",
    })
    setReferenciaExtra({
      "Longitud mínima ext": "",
      "Longitud máxima ext": "",
    })
    setCorreos([])
  }, []);

  const crearModificarConvenioRecaudo = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    let validacion = true
    if (data['Nombre de Referencia']) {
      delete data['Nombre de Referencia']; delete data['Longitud mínima']; delete data['Longitud máxima']
      let allReferencias = []
      for (let i in referencias) {
        if (parseInt(referencias[i]["Longitud mínima"]) > parseInt(referencias[i]["Longitud máxima"])) validacion = false
        allReferencias.push({
          "nombre_referencia": referencias[i]["Nombre de Referencia"],
          "length": [referencias[i]["Longitud mínima"], referencias[i]["Longitud máxima"],]
        })
      }
      if (!validacion) notifyError("En la restriccion de referencias, la longitud máxima debe ser mayor a la longitud mínima")
      data['referencias'] = allReferencias
    }
    if (data['Valor mínimo'] || data['Valor máximo']) {
      delete data['Valor mínimo']; delete data['Valor máximo'];
      data['limite_monto'] = [`${[limites['Valor mínimo']] ?? 0}`, `${limites['Valor máximo'] ?? 0}`]
      if (parseInt(data['limite_monto'][0]) > parseInt(data['limite_monto'][1])) {
        notifyError("En la restriccion de valores, el valor máximo debe ser mayor al valor mínima")
        validacion = false
      }
    }
    if (data['Longitud mínima ext'] || data['Longitud máxima ext']) {
      data['limite_ref_extra'] = [`${referenciaExtra['Longitud mínima ext'] ?? 0}`, `${referenciaExtra['Longitud máxima ext'] ?? 0}`]
      if (parseInt(data['limite_ref_extra'][0]) > parseInt(data['limite_ref_extra'][1])) {
        notifyError("En la restriccion de limites de datos extra, el limite máximo debe ser mayor al limite mínimo")
        validacion = false
      }
      delete data['Longitud mínima ext']; delete data['Longitud máxima ext'];
    }
    const correos = Object.entries(data).filter(([key]) => key.startsWith('correo_')).map(([, value]) => value);
    Object.entries(data)
    .filter(([key]) => key.startsWith('correo_'))
    .forEach(([key]) => delete data[key]);
    if (correos.length > 0) {
      data.correos = correos;
    }
    const filteredBody = Object.entries(data).filter(([key, value]) => value !== "");
    const body = Object.fromEntries(filteredBody);
    if (validacion) {
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
    }
  }, [handleClose, searchTrxs, selected, referencias, limites, referenciaExtra])

  const descargarPlantilla = useCallback(() => {
    descargarCSV('Ejemplo_de_archivo_recaudo', res)
  }, [res]);

  const handleConvenio = useCallback((e) => {
    setSelecTipoConvenio(e.target.value)
  }, []);

  const handleEliminarCorreo = (index) => {
    const copyCorreos = [...correos];
    copyCorreos.splice(index, 1);
    setCorreos(copyCorreos);
  };

  const handleAgregarCorreo = () => {
    if (correos.length < 6) {
      setCorreos([...correos, '']);
    }
  };

  const handleChangeCorreo = (index, value) => {
    const copyCorreos = [...correos];
    copyCorreos[index] = value;
    setCorreos(copyCorreos);
  };

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
          setCorreos(listRecaudos[index]["correos"] === null?[]:listRecaudos[index]["correos"])
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
          setSearchFilters((old) => {
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
            maxLength={"60"}
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
            onInput={(e) => {handleConvenio(e)}}
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
              options={selecTipoConvenio !== "4"? [{ label: "", value: "" }, ...tipoModificacion]:[{ label: "Valor mayor", value: 3 },]}
              defaultValue={selected?.fk_modificar_valor ?? ""}
              required
            />
            {Object.entries(limites).map(([keyLimit, valLimit], index) => {
              return (
                <MoneyInput
                  key={`${keyLimit}_${index}`}
                  className={"mb-1"}
                  id={`${keyLimit}_${index}`}
                  name={keyLimit}
                  label={keyLimit}
                  autoComplete="off"
                  maxLength={"11"}
                  min={limitesMontos.min}
                  max={limitesMontos.max}
                  // value={valLimit}
                  defaultValue={selected ? selected.limite_monto[index] : valLimit}
                  onInput={(e, valor) => {
                    const copyRef = { ...limites };
                    copyRef[keyLimit] = valor;
                    setlimites(copyRef);
                  }}
                  equalError={false}
                  equalErrorMin={false}
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
                        type={`${keyRef.includes("Longitud") ? "tel" : "text"}`}
                        maxLength={`${keyRef.includes("Longitud") ? "2" : "40"}`}
                        autoComplete="off"
                        value={valRef}
                        onInput={(ev) => {
                          if (keyRef.includes("Longitud")) (ev.target.value = onChangeNumber(ev))
                          const copyRef = [...referencias];
                          copyRef[index][keyRef] = ev.target.value;
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
                        "Longitud mínima": "",
                        "Longitud máxima": "",
                      })
                      setReferencias(copyRef)
                    }
                  }}
                >Añadir referencia</Button>
              </ButtonBar>
            }
          </Fieldset>
          <Fieldset legend={"Datos Extra"}>
            <Select
              className="place-self-stretch mb-1"
              id={"Tipo_referencia_extra"}
              label={"Tipo referencia"}
              name={"fk_id_tipo_referencia_extra"}
              options={[{ label: "", value: "" }, ...tipoReferenciaExtra]}
              defaultValue={selected?.fk_id_tipo_referencia_extra ?? ""}
              required={permiteRefExtra}
            />
            {Object.entries(referenciaExtra).map(([keyRef, valRef], index) => {
              return (
                <Input
                  key={keyRef}
                  className={"mb-4"}
                  id={`${keyRef}_${index}`}
                  name={keyRef}
                  label={keyRef.replace("ext", "")}
                  type={`tel`}
                  maxLength={`2`}
                  autoComplete="off"
                  value={valRef}
                  onInput={(ev, valor) => {
                    if (keyRef.includes("Longitud")) (valor = onChangeNumber(ev))
                    const copyRef = { ...referenciaExtra };
                    copyRef[keyRef] = valor;
                    setReferenciaExtra(copyRef);
                  }}
                  required={permiteRefExtra}
                />
              );
            })}
          </Fieldset>
          <Fieldset legend="Correos">
            {correos.map((correo, index) => (
              <div key={index}>
                <Input
                  className="mb-4"
                  id={`correo_${index}`}
                  name={`correo_${index}`}
                  label={`Correo ${index + 1}`}
                  type="email"
                  autoComplete="off"
                  value={correo}
                  onInput={(ev) => handleChangeCorreo(index, ev.target.value)}
                  required
                />
                {correos.length > 0 && (
                  <ButtonBar>
                    <Button type="button" onClick={() => handleEliminarCorreo(index)}>
                      Eliminar correo
                    </Button>
                  </ButtonBar>
                )}
              </div>
            ))}
            {correos.length < 6 && (
              <ButtonBar>
                <Button type="button" onClick={handleAgregarCorreo}>
                  Añadir correo
                </Button>
              </ButtonBar>
            )}
          </Fieldset>
          <Select
            className="place-self-stretch mb-1"
            id={"Tipo_archivo"}
            label={"Tipo archivo Conciliación"}
            name={"fk_nombre_tipo_archivo"}
            options={[{ label: "", value: "" }, ...tipoArchivoConciliacion]}
            defaultValue={selected?.fk_nombre_tipo_archivo ?? ""}
            required
          />
          <TextArea
            id={"Observaciones"}
            label={"Observaciones"}
            name={"observaciones"}
            type="text"
            maxLength={"130"}
            autoComplete="off"
            defaultValue={selected?.observaciones ?? ""}
          />
          <ToggleInput
            id={"permite_vencidos"}
            label={"Permite vencidos"}
            name={"permite_vencidos"}
            defaultChecked={selected?.permite_vencidos ?? ""}
          />
          <ToggleInput
            id={"permite_referencia_extra"}
            label={"Permite datos extra"}
            name={"permite_referencia_extra"}
            defaultChecked={selected?.permite_referencia_extra ?? ""}
            onChange={() =>
              setPermiteRefExtra((old) => !old)
            }
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