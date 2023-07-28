import React from 'react'
import { Fragment, useCallback, useEffect, useState } from "react";
import DataTable from "../../../../components/Base/DataTable";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { onChangeNumber } from "../../../../utils/functions";
import useMap from "../../../../hooks/useMap";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import { createGroup, updateGroup, getListPermissions } from "../../utils/fecthBrokerComercios";

const initialSearchFilters = new Map([
  ["pk_permiso_broker", ""],
  ["tipo_trx", ""],
  ["page", 1],
  ["limit", 10],
]);

const GestionPermisosBroker = () => {
  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [isNextPage, setIsNextPage] = useState(false);
  const [listPermissions, setListPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(false);

  const [paths, setPaths] = useState([{
    "Path": "",
  }])



  const [fetchCommerce] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListPermissions(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist ?? false);
    }, []),
    onError: useCallback((error) => {
      if (error instanceof ErrorPDPFetch) {
        notifyError(error?.message ?? "Error");
      }
      else if (!(error instanceof DOMException)) {
        notifyError("Error al cargar Datos ");
      }
    }, []),
  });

  const searchPermisions = useCallback(() => {
    const url = getListPermissions();
    const tempMap = new Map(searchFilters);
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchCommerce(`${url}?${queries}`);
  }, [searchFilters, fetchCommerce]);

  useEffect(() => {
    searchPermisions();
  }, [searchPermisions]);

  useEffect(() => {
    let referencia = []
    if (selected['path_permisos']) {
      for (let i in selected['path_permisos']) {
        referencia.push({
          "Path": selected['path_permisos'][i],
        })
      }
    }
    setPaths(referencia)
  }, [selected]);


  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(false);
    setPaths([{
      "Path": "",
    }])
  }, []);

  const crearModificarGrupo = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    let urls = []
    if (body['Path']){
      for (let item in paths){
        urls.push(paths[item]?.Path)
      }
      body["path_permisos"]=urls
      delete body['Path']
    }
    notifyPending(
      selected
        ? updateGroup({ pk_permiso_broker: selected?.pk_permiso_broker ?? '' }, body)
        : createGroup(body),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          searchPermisions()
          handleClose();
          return `Grupo ${selected ? "modificado" : "agregado"
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

  }, [handleClose, searchPermisions, selected, paths])


  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Grupos Permisos Broker</h1>
      <ButtonBar>
        <Button type={"submit"} onClick={() => setShowModal(true)} >
          Crear Grupo
        </Button>
      </ButtonBar>
      <DataTable
        title="Grupos Permisos Broker"
        headers={["Id del grupo", "Tipo de transacción", "Nombre del grupo"]}
        data={listPermissions.map(
          ({
            pk_permiso_broker,
            tipo_trx,
            nombre_grupo_broker,
          }) => ({
            pk_permiso_broker,
            tipo_trx,
            nombre_grupo_broker,
          })
        )}
        onClickRow={(_, index) => {
          setShowModal(true);
          setSelected(listPermissions[index])
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
      >
        <Fragment>
          <Input
            id="id_group"
            name="pk_permiso_broker"
            label={"Id de grupo"}
            type="tel"
            maxLength={10}
            autoComplete="off"
          />
          <Input
            id="tipo_trx"
            name="tipo_trx"
            label={"Tipo de transacción"}
            type="text"
            maxLength={60}
            autoComplete="off"
          />
        </Fragment>
      </DataTable>
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4"> {selected ? "Editar" : "Crear"} grupo</h2>
        <Form onSubmit={crearModificarGrupo} grid >
          {selected && (
            <Input
              id={"pk_permiso_broker"}
              label={"Id grupo"}
              name={"pk_permiso_broker"}
              autoComplete="off"
              defaultValue={selected?.pk_permiso_broker ?? ""}
              onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
              disabled={selected ? true : false}
              required
            />
          )}
          <Input
            id={"nombre_grupo_broker"}
            label={"Nombre grupo"}
            name={"nombre_grupo_broker"}
            type="text"
            maxLength={"60"}
            defaultValue={selected?.nombre_grupo_broker ?? ""}
            autoComplete="off"
            required
          />
          <Input
            id={"tipo_trx"}
            label={"Tipo de Transaccion"}
            name={"tipo_trx"}
            type="text"
            maxLength={"60"}
            defaultValue={selected?.tipo_trx ?? ""}
            autoComplete="off"
            required
          />

          <Fieldset legend={"Paths"}>
            {paths?.map((obj, index) => {
              return (
                <div key={index}>
                  {Object.entries(obj).map(([keyRef, valRef]) => {
                    return (
                      <Input
                        key={keyRef}
                        className={"mb-4"}
                        id={`${keyRef}_${index}`}
                        name={keyRef}
                        label={`${keyRef} ${index + 1}`}
                        type={"text"}
                        maxLength={"40"}
                        autoComplete="off"
                        value={valRef}
                        onInput={(ev) => {
                          const copyRef = [...paths];
                          copyRef[index][keyRef] = ev.target.value;
                          setPaths(copyRef);
                        }}
                        required
                      />
                    );
                  })}
                  {paths.length > 1 &&
                    <ButtonBar>
                      <Button
                        type='button'
                        onClick={() => {
                          let copyRef = [...paths]
                          copyRef = copyRef.filter((item) => item !== copyRef[index])
                          setPaths(copyRef)
                        }}
                      >Eliminar path</Button>
                    </ButtonBar>
                  }
                </div>
              )
            })}
            {paths.length < 10 &&
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    let copyRef = [...paths]
                    if (copyRef.length < 10) {
                      copyRef.push({
                        "Path": "",
                      })
                      setPaths(copyRef)
                    }
                  }}
                >Añadir path</Button>
              </ButtonBar>
            }
          </Fieldset>
          <ButtonBar>
            <Button type={"submit"} >
              {selected ? "Realizar cambios" : "Crear Grupo"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};



export default GestionPermisosBroker


