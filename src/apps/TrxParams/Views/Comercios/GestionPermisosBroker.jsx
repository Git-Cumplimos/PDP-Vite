import React from 'react'
import { Fragment, useCallback, useEffect, useState } from "react";
import DataTable from "../../../../components/Base/DataTable";
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import { notifyError, notifyPending } from "../../../../utils/notify";
import SearchTables from "./SearchTables";
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
  ["nombre_grupo", ""],
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
  const [searchType, setSearchType] = useState(null);
  const [searchSelectFunction, setSearchSelectFunction] = useState(null);
  const [permisos, setPermisos] = useState({})



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


  const handleClose = useCallback((err = null) => {
    if (err) setSearchType(null);
    else {
      setSearchType(null);
      setShowModal(false);
      setSelected(null);
    }
  }, []);

  const onSelectGroup = useCallback(
    (selectedGroup) => {
      try {
        let type = selectedGroup?.nombre_operacion;
        let pk_permission = selectedGroup?.id_tipo_op.toString();
        setPermisos((old) => {
          const copy = structuredClone(old);
          copy[pk_permission] = type;
          return copy;
        })
        handleClose(true);
      }catch (e){
        console.log(e)
        notifyError("Error interno");
      }
    },

    [handleClose]
  );

  const crearModificarGrupo = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let body = Object.fromEntries(Object.entries(Object.fromEntries(formData)))
    
    body["tipos_op"] = Object.keys(permisos) ?? []
    
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

  }, [handleClose, searchPermisions, selected, permisos])


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
        headers={["Id del grupo", "Nombre del grupo", "Tipo"]}
        data={listPermissions.map(
          ({
            pk_permiso_broker,
            nombre_grupo,
            tipo_grupo,
          }) => ({
            pk_permiso_broker,
            nombre_grupo,
            tipo_grupo,
          })
        )}
        onClickRow={(_, index) => {
          setShowModal(true);
          setSelected(listPermissions[index])
          setPermisos(Object.keys(listPermissions[index]?.list_operations)[0] === "0" ? {} : listPermissions[index]?.list_operations)
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
            onChange={(ev) => { ev.target.value = onChangeNumber(ev); }}
            autoComplete="off"
          />
          <Input
            id="nombre_grupo"
            name="nombre_grupo"
            label={"Nombre del grupo"}
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
              onChange={(ev) => { ev.target.value = onChangeNumber(ev); }}
              disabled={selected ? true : false}
              required
            />
          )}
          <Input
            id={"nombre_grupo"}
            name={"nombre_grupo"}
            label={"Nombre del grupo"}
            type="text"
            maxLength={"60"}
            defaultValue={selected?.nombre_grupo ?? ""}
            autoComplete="off"
            required
          />
          <Input
            id={"tipo_grupo"}
            name={"tipo_grupo"}
            label={"Tipo del grupo"}
            type="text"
            maxLength={"60"}
            defaultValue={selected?.tipo_grupo ?? ""}
            autoComplete="off"
            required
          />

          {/* <Fieldset legend={"Paths"}>
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
                        maxLength={"60"}
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
            {paths.length < 50 &&
              <ButtonBar>
                <Button
                  type='button'
                  onClick={() => {
                    let copyRef = [...paths]
                    if (copyRef.length < 50) {
                      copyRef.push({
                        "Path": "",
                      })
                      setPaths(copyRef)
                    }
                  }}
                >Añadir path</Button>
              </ButtonBar>
            }
          </Fieldset> */}
          <Fieldset legend={"Tipos Operaciones"}>


            <ButtonBar className={"lg:col-span-2"}>
              {Object.keys(permisos).length > 0 ? (
                Object.entries(permisos).map((index, ind) => (
                  <button
                    type="button"
                    className="rounded-md bg-primary-light px-4 py-2 my-2 text-base text-white"
                    title={index[1]}
                    key={index[1]}
                  >
                    {index[1]} &nbsp;&nbsp;
                    <span
                      className="bi bi-x-lg pointer-events-auto"
                      onClick={() => {
                        setPermisos((old) => {
                          const key = parseInt(index[0])
                          const copy = structuredClone(old);
                          delete copy[key]
                          return copy;
                        })
                      }
                      }
                    />
                  </button>
                ))
              ) : (
                <h1 className="text-xl text-center my-auto">
                  No hay tipos de operaciones relacionados
                </h1>
              )}
            </ButtonBar>
            <ButtonBar className={"lg:col-span-2"}>
              <Button
                type="button"
                onClick={() => {
                  setSearchType("operations");
                  setSearchSelectFunction(() => onSelectGroup);
                }}
              >
                Agregar tipos de operaciones
              </Button>
            </ButtonBar>
          </Fieldset>
          <ButtonBar>
            <Button type={"submit"} >
              {selected ? "Realizar cambios" : "Crear Grupo"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
      <Modal show={searchType} handleClose={() => { handleClose(true) }}>
        {searchType && (
          <SearchTables
            onSelectItem={searchSelectFunction}
            type_search = {searchType} 
          />
        )}
      </Modal>
    </Fragment>
  );
};



export default GestionPermisosBroker


