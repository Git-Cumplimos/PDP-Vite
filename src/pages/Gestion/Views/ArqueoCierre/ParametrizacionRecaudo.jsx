import React, { useState, useCallback, useEffect, Fragment } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  crearEntidad,
  buscarEntidades,
  editarEntidades,
} from "../../utils/fetchCaja";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset";

const ParametrizacionRecaudo = () => {
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState(null);
  const [maxpages, setMaxPages] = useState(2);
  const [data, setData] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ pk_nombre_entidad: "" });
  const [selectedEntity, setSelectedEntity] = useState(null);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setType(null);
    setSelectedEntity(null);
  }, []);

  const buscarEnt = useCallback(() => {
    buscarEntidades({ ...pageData, ...searchFilters })
      .then((res) => {
        setMaxPages(res?.obj?.maxPages);
        setData(res?.obj?.results);
      })
      .catch((error) => {
        if (error?.cause === "custom") {
          notifyError(error?.message);
          return;
        }
        console.error(error?.message);
        notifyError("Busqueda fallida");
      });
  }, [pageData, searchFilters]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData)).map(([key, val]) => [
          key,
          key === "pk_is_transportadora"
            ? val === "2"
            : key === "pk_nombre_entidad"
            ? val.trim()
            : val,
        ])
      );
      notifyPending(
        crearEntidad(body),
        {
          render: () => {
            return "Procesando peticion";
          },
        },
        {
          render: ({ data: res }) => {
            closeModal();
            buscarEnt();
            return res?.msg;
          },
        },
        {
          render: ({ data: err }) => {
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Peticion fallida";
          },
        }
      );
    },
    [closeModal, buscarEnt]
  );

  const handleSubmitUpdate = useCallback(
    (ev) => {
      ev.preventDefault();
      notifyPending(
        editarEntidades(
          {
            pk_nombre_entidad: "",
            pk_is_transportadora: "",
          },
          selectedEntity
        ),
        {
          render: () => {
            return "Procesando peticion";
          },
        },
        {
          render: ({ data: res }) => {
            closeModal();
            buscarEnt();
            return res?.msg;
          },
        },
        {
          render: ({ data: err }) => {
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return "Peticion fallida";
          },
        }
      );
    },
    [closeModal, buscarEnt, selectedEntity]
  );

  useEffect(() => {
    buscarEnt();
  }, [buscarEnt]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear cuenta
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Bancos/Transportadoras"
        headers={["Nombre entidad", "Tipo entidad"]}
        maxPage={maxpages}
        onSetPageData={setPageData}
        data={
          data?.map(({ pk_nombre_entidad, pk_is_transportadora }) => ({
            pk_nombre_entidad,
            pk_is_transportadora: pk_is_transportadora
              ? "TRANSPORTADORA"
              : "BANCO",
          })) ?? []
        }
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
        onSelectRow={(e, i) => {
          setSelectedEntity(data[i]);
        }}
      >
        <Input
          id="pk_nombre_entidad"
          name="pk_nombre_entidad"
          label={"Entidad"}
          type="text"
          autoComplete="off"
          maxLength={"20"}
        />
        <ButtonBar />
      </TableEnterprise>
      <Modal show={showModal || selectedEntity} handleClose={closeModal}>
        {!selectedEntity ? (
          <Form onSubmit={handleSubmit} grid>
            <Select
              id="pk_is_transportadora"
              name="pk_is_transportadora"
              label="Tipo de entidad"
              options={[
                { value: "", label: "" },
                { value: "1", label: "Bancos" },
                { value: "2", label: "Transportadora" },
              ]}
              onChange={(e) =>
                setType(
                  e.target.value === "1"
                    ? false
                    : e.target.value === "2"
                    ? true
                    : null
                )
              }
              required
            />
            {type !== null && (
              <Fragment>
                <Input
                  id="pk_nombre_entidad"
                  name="pk_nombre_entidad"
                  label={`Nombre ${type ? "transportadora" : "banco"}`}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  autoComplete="off"
                  maxLength={"20"}
                  required
                />
                <ButtonBar>
                  <Button type="button" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear {type ? "transportadora" : "banco"}
                  </Button>
                </ButtonBar>
              </Fragment>
            )}
          </Form>
        ) : (
          <Form onSubmit={handleSubmitUpdate} grid>
            <Input
              id="pk_nombre_entidad"
              name="pk_nombre_entidad"
              label={`Nombre ${
                selectedEntity?.pk_is_transportadora === null
                  ? "entidad"
                  : selectedEntity?.pk_is_transportadora
                  ? "transportadora"
                  : "banco"
              }`}
              value={selectedEntity?.pk_nombre_entidad ?? ""}
              readOnly
            />
            <Fieldset legend={"Parámetros"}>
              {Object.entries(selectedEntity?.parametros ?? {}).map(
                ([key, val], ind) => (
                  <div
                    className="grid grid-cols-auto-fit-md place-items-center place-content-end"
                    key={ind}
                  >
                    <Input
                      id={`paramero_llave_${ind}`}
                      name={`paramero_llave_${ind}`}
                      label="Llave"
                      value={key}
                      onChange={(e) =>
                        setSelectedEntity((old) => {
                          const parametros = new Map(
                            Object.entries(old?.parametros ?? {})
                          );
                          parametros.delete(key);
                          parametros.set(e.target.value, val);
                          return {
                            ...old,
                            parametros: Object.fromEntries(parametros),
                          };
                        })
                      }
                      autoComplete="off"
                      maxLength={"20"}
                      required
                    />
                    <Input
                      id={`paramero_valor_${ind}`}
                      name={`paramero_valor_${ind}`}
                      label="Valor"
                      value={val}
                      onChange={(e) =>
                        setSelectedEntity((old) => {
                          const parametros = new Map(
                            Object.entries(old?.parametros ?? {})
                          );
                          parametros.set(key, e.target.value);
                          return {
                            ...old,
                            parametros: Object.fromEntries(parametros),
                          };
                        })
                      }
                      autoComplete="off"
                      maxLength={"20"}
                      required
                    />
                    <ButtonBar className={"lg:col-span-2"}>
                      <Button
                        type="button"
                        onClick={() =>
                          setSelectedEntity((old) => {
                            const parametros = new Map(
                              Object.entries(old?.parametros ?? {})
                            );
                            parametros.delete(key);
                            return {
                              ...old,
                              parametros: Object.fromEntries(parametros),
                            };
                          })
                        }
                      >
                        Eliminar parámetro
                      </Button>
                    </ButtonBar>
                  </div>
                )
              )}
              <ButtonBar>
                <Button
                  type="button"
                  onClick={() =>
                    setSelectedEntity((old) => {
                      const parametros = new Map(
                        Object.entries(old?.parametros ?? {})
                      );
                      parametros.set("", "");
                      return {
                        ...old,
                        parametros: Object.fromEntries(parametros),
                      };
                    })
                  }
                >
                  Agregar parámetro
                </Button>
              </ButtonBar>
            </Fieldset>
            <ButtonBar>
              <Button type="submit">Actualizar información</Button>
              <Button type="button" onClick={closeModal}>
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        )}
      </Modal>
    </Fragment>
  );
};

export default ParametrizacionRecaudo;
