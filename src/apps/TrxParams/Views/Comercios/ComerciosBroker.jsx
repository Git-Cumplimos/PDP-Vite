import { Fragment, useState, useCallback, useEffect } from 'react'
import useFetchDispatchDebounce, { ErrorPDPFetch } from "../../../../hooks/useFetchDispatchDebounce";
import { getListCommerce, updateCommerce } from "../../utils/fecthBrokerComercios";
import { onChangeNumber } from "../../../../utils/functions";
import { useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import useMap from "../../../../hooks/useMap";
import SearchTables from "./SearchTables";
import DataTable from "../../../../components/Base/DataTable";
import Form from "../../../../components/Base/Form";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import Modal from "../../../../components/Base/Modal";

const initialSearchFilters = new Map([
  ["pk_comercio", ""],
  ["nombre_comercio", ""],
  ["ascendente", "false"],
  ["page", 1],
  ["limit", 10],
]);

const ComerciosBroker = () => {
  const navigate = useNavigate()

  const [comercios, setComercios] = useState([])
  const [selected, setSelected] = useState(null);
  const [isNextPage, setIsNextPage] = useState(false);
  const [showModal, setShowModal] = useState(false)
  const [searchType, setSearchType] = useState(null);
  const [searchSelectFunction, setSearchSelectFunction] = useState(null);

  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);


  const handleClose = useCallback((err = null) => {
    if (err) setSearchType(null);
    else {
      setSearchType(null);
      setShowModal(false);
      setSelected(null);
    }
  }, []);


  const [fetchCommerce] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setComercios(data?.obj?.results ?? []);
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

  const searchCommerces = useCallback(() => {
    const tempMap = new Map(searchFilters);
    const url = getListCommerce()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchCommerce(`${url}?${queries}`);
  }, [fetchCommerce, searchFilters]);

  useEffect(() => {
    searchCommerces();
  }, [searchCommerces]);

  const filterAndAddToArray = useCallback((old, property, data) => {
    return [
      ...(old[property] ?? []),
      data
    ].filter((value, index, self) => index === self.findIndex((item) => value === item));
  }, []);

  const onSelectGroup = useCallback(
    (selectedGroup) => {
      console.log(selected)
      console.log(selectedGroup)
      setSelected((old) => ({
        ...old,
        permisos_broker: filterAndAddToArray(old, 'permisos_broker', selectedGroup?.pk_permiso_broker.toString()),
        nombres_permisos_broker: filterAndAddToArray(old, 'nombres_permisos_broker', selectedGroup?.tipo_trx),
      }));
      handleClose(true);
    },

    [handleClose, filterAndAddToArray,selected]
  );

  const modifyCommerce = useCallback((e) => {
    e.preventDefault();
    console.log(selected)
    const body = {
      pk_grupo_permiso_broker: selected?.permisos_broker
    }
    notifyPending(
      updateCommerce({ pk_comercio: selected?.pk_comercio, }, body),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          handleClose();
          navigate('/params-operations/comercios-params')
          return `Comercio actualizado exitosamente`;
        },
      },
      {
        render({ data: err }) {
          if (err?.cause === "custom") {
            return err?.message;
          }
          return `Edicion fallida`;
        },
      }
    )
  }, [handleClose, navigate, selected])

  return (
    <Fragment>
      <DataTable
        title="Convenios de Recaudos"
        headers={[
          "Código convenio",
          "Nombre convenio",
        ]}
        data={comercios.map(
          ({
            pk_comercio,
            nombre_comercio,
          }) => ({
            pk_comercio,
            nombre_comercio,
          })
        )}
        onClickRow={(_, index) => {
          setShowModal(true)
          setSelected(comercios[index])
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
        <Input
          id={"pk_comercio"}
          label={"Código de convenio"}
          name={"pk_comercio"}
          type="tel"
          maxLength={"4"}
          onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
          autoComplete="off"
        />
        <Input
          id={"nombre_comercio"}
          label={"Nombre del comercio"}
          name={"nombre_comercio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
        <Select
          id="ascendente"
          name="ascendente"
          label="Orden ascendente"
          options={[
            { value: "true", label: "true" },
            { value: "false", label: "false" },
          ]}
          onChange={(ev) => {
            setSearchFilters((old) => {
              const copy = new Map(old)
                .set("ascendente", ev.target.value);
              return copy;
            });
          }}
          defaultValue={"false"}
        />
      </DataTable>
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={modifyCommerce} grid>
          <ButtonBar className={"lg:col-span-2"}>
            {selected?.nombres_permisos_broker?.length > 0 ? (
              selected?.nombres_permisos_broker?.map((index, ind) => (
                <button
                  type="button"
                  className="rounded-md bg-primary-light px-4 py-2 my-2 text-base text-white"
                  title={index}
                  key={index}
                >
                  {index} &nbsp;&nbsp;
                  <span
                    className="bi bi-x-lg pointer-events-auto"
                    onClick={() =>
                      setSelected((old) => {
                        const copy = structuredClone(old);
                        copy.nombres_permisos_broker.splice(ind, 1);
                        return copy;
                      })
                    }
                  />
                </button>
              ))
            ) : (
              <h1 className="text-xl text-center my-auto">
                No hay grupos relacionados
              </h1>
            )}
          </ButtonBar>
          <ButtonBar className={"lg:col-span-2"}>
            <Button
              type="button"
              onClick={() => {
                setSearchType("groups");
                setSearchSelectFunction(() => onSelectGroup);
              }}
            >
              Agregar grupos
            </Button>
            <Button type="submit">
              Actualizar comercios
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
      <Modal show={searchType} handleClose={() => { handleClose(true) }}>
        {searchType && (
          <SearchTables
            onSelectItem={searchSelectFunction}
          />
        )}
      </Modal>
    </Fragment>
  )
}

export default ComerciosBroker