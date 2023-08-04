import { Fragment, useEffect, useState, useCallback } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";
import { onChangeNumber } from "../../../../utils/functions";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

import {
  crearConvenio,
  buscarConvenios,
  actualizarConvenio,
  buscarAutorizadorRecaudo,
} from "./utils";
import Select from "../../../../components/Base/Select";
import { notifyError, notifyPending } from "../../../../utils/notify";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import Fieldset from "../../../../components/Base/Fieldset";
import TextArea from "../../../../components/Base/TextArea";
import ToggleInput from "../../../../components/Base/ToggleInput";

const AdminConveniosPDP = () => {
  const [conveniosPdp, setConveniosPdp] = useState([]);
  const [maxPage, setMaxPage] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio: "",
    nombre_convenio: "",
    tags: "",
    pk_fk_id_autorizador: "",
    id_convenio_autorizador: "",
    estado: "",
  });
  const [autorizadoresRecaudo, setAutorizadoresRecaudo] = useState([]);

  const [selectedConvenio, setSelectedConvenio] = useState(null);
  const [isCreate, setIsCreate] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedConvenio(null);
      setIsCreate(null);
    }
  }, [loading]);

  const lazySearch = useDelayedCallback(
    useCallback(() => {
      buscarConvenios({
        ...pageData,
        ...Object.fromEntries(
          Object.entries(searchFilters)
            .filter(([_, val]) => val)
            .map(([key, val]) => [key, key === "tags" ? val.split(",") : val])
        ),
      })
        .then((res) => {
          setConveniosPdp(res?.obj?.results ?? []);
          setMaxPage(res?.obj?.max_pages ?? []);
        })
        .catch((err) => {
          if (err?.cause === "custom") {
            notifyError(err?.message);
            return;
          }
          console.error(err?.message);
        });
    }, [pageData, searchFilters]),
    300
  );

  useEffect(() => {
    buscarAutorizadorRecaudo({ limit: 0 })
      .then((res) => setAutorizadoresRecaudo(res?.obj?.results ?? []))
      .catch((err) => {
        if (err?.cause === "custom") {
          console.error(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, []);

  useEffect(() => {
    lazySearch();
  }, [lazySearch]);

  const submitConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      const objCopy = structuredClone(selectedConvenio);
      objCopy.relaciones = Object.fromEntries(objCopy.relaciones);
      notifyPending(
        isCreate ? crearConvenio(objCopy) : actualizarConvenio({}, objCopy),
        {
          render: () => {
            setLoading(true);
            return `${isCreate ? "Creando" : "Actualizando"} convenio`;
          },
        },
        {
          render: ({ data: res }) => {
            setLoading(false);
            lazySearch();
            handleClose();
            return res?.msg;
          },
        },
        {
          render: ({ data: err }) => {
            setLoading(false);
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return `${isCreate ? "Creacion" : "Actualizacion"} fallida`;
          },
        }
      );
    },
    [selectedConvenio, isCreate, lazySearch, handleClose]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            setSelectedConvenio({
              nombre_convenio: "",
              descripcion_convenio: "",
              tags: [""],
              relaciones: [],
              ean: [],
            });
            setIsCreate(true);
          }}
        >
          Crear convenio
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Convenios de recaudo"
        headers={["Código convenio", "Nombre convenio", "Estado"]}
        data={conveniosPdp.map(
          ({ pk_id_convenio, nombre_convenio, estado }) => ({
            pk_id_convenio,
            nombre_convenio,
            estado: estado ? "Activo" : "Inactivo",
          })
        )}
        maxPage={maxPage}
        onSetPageData={setPageData}
        onSelectRow={(e, i) => {
          const copy = structuredClone(conveniosPdp[i]);
          copy.relaciones = Object.entries(conveniosPdp[i]?.relaciones);
          setSelectedConvenio(copy);
          setIsCreate(false);
        }}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        <Input
          id={"pk_id_convenio"}
          label={"Código de convenio"}
          name={"pk_id_convenio"}
          type="tel"
          autoComplete="off"
          maxLength={"10"}
          onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
        <Input
          id={"tags"}
          label={"Tags"}
          name={"tags"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
        <Select
          id={"estado"}
          label={"Estado"}
          name={"estado"}
          options={[
            { value: "", label: "" },
            { value: "true", label: "Activo" },
            { value: "false", label: "Inactivo" },
          ]}
        />
        <Select
          id={"pk_fk_id_autorizador"}
          label={"Id autorizador"}
          name={"pk_fk_id_autorizador"}
          options={[
            { value: "", label: "" },
            ...autorizadoresRecaudo.map(
              ({ pk_id_autorizador, nombre_autorizador }) => ({
                value: pk_id_autorizador,
                label: nombre_autorizador,
              })
            ),
          ]}
        />
        <Input
          id={"id_convenio_autorizador"}
          label={"Código de convenio (autorizador)"}
          name={"id_convenio_autorizador"}
          type="tel"
          autoComplete="off"
          maxLength={"15"}
          onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
        />
      </TableEnterprise>
      <Modal
        show={selectedConvenio && isCreate !== null}
        handleClose={handleClose}
      >
        <Form onSubmit={submitConvenio} grid>
          <h1 className="text-3xl text-center">
            {isCreate ? "Crear" : "Actualizar"} convenio
          </h1>
          {!isCreate && (
            <Input
              id="pk_id_convenio"
              label="Id convenio"
              name="pk_id_convenio"
              type="tel"
              autoComplete="off"
              minLength="1"
              maxLength="8"
              defaultValue={selectedConvenio?.pk_id_convenio}
              disabled
            />
          )}
          <Input
            id="nombre_convenio"
            name={"nombre_convenio"}
            label="Nombre de convenio"
            type="text"
            autoComplete="off"
            value={selectedConvenio?.nombre_convenio}
            onChange={(ev) =>
              setSelectedConvenio((old) => {
                const copy = { ...old };
                copy.nombre_convenio = ev.target.value;
                return { ...copy };
              })
            }
            maxLength={30}
            required
          />
          <TextArea
            id="descripcion_convenio"
            label="Descripcion del convenio"
            name={"descripcion_convenio"}
            autoComplete="off"
            value={selectedConvenio?.descripcion_convenio}
            onChange={(ev) =>
              setSelectedConvenio((old) => {
                const copy = { ...old };
                copy.descripcion_convenio = ev.target.value;
                return { ...copy };
              })
            }
            maxLength={120}
            required
          />
          {!isCreate && (
            <ToggleInput
              id={"estado"}
              label={"Estado"}
              name={"estado"}
              checked={selectedConvenio?.estado}
              onChange={() =>
                setSelectedConvenio((old) => {
                  const copy = { ...old };
                  copy.estado = !copy.estado;
                  return { ...copy };
                })
              }
            />
            // <Select
            //   options={[
            //     { value: "", label: "" },
            //     { value: "true", label: "Activo" },
            //     { value: "false", label: "Inactivo" },
            //   ]}
            // />
          )}
          <Fieldset legend={"Tags"}>
            {selectedConvenio?.tags?.map((val, ind) => (
              <div className="flex align-middle justify-center" key={ind}>
                <Input
                  id={`tagsConvenio_${ind}`}
                  name="tags"
                  type="text"
                  autoComplete="off"
                  value={val}
                  maxLength={20}
                  onChange={(ev) =>
                    setSelectedConvenio((old) => {
                      const copy = { ...old };
                      copy.tags[ind] = ev.target.value;
                      return { ...copy };
                    })
                  }
                  required
                />
                {selectedConvenio?.tags.length > 1 && (
                  <ButtonBar className="w-52">
                    <Button
                      type="button"
                      onClick={() => {
                        if (selectedConvenio?.tags.length < 2) {
                          return;
                        }
                        const copy = { ...selectedConvenio };
                        copy?.tags.splice(ind, 1);
                        setSelectedConvenio({ ...copy });
                      }}
                    >
                      Eliminar tag
                    </Button>
                  </ButtonBar>
                )}
              </div>
            ))}
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  const copy = { ...selectedConvenio };
                  copy?.tags.push("");
                  setSelectedConvenio({ ...copy });
                }}
              >
                Añadir tag
              </Button>
            </ButtonBar>
          </Fieldset>
          <Fieldset legend={"Ean"}>
            {selectedConvenio?.ean?.map((val, ind) => (
              <div className="flex align-middle justify-center" key={ind}>
                <Input
                  id={`eanConvenio_${ind}`}
                  name="ean"
                  type="text"
                  autoComplete="off"
                  maxLength={13}
                  minLength={13}
                  value={val}
                  onChange={(ev) =>
                    setSelectedConvenio((old) => {
                      const copy = { ...old };
                      copy.ean[ind] = ev.target.value;
                      return { ...copy };
                    })
                  }
                  required
                />
                <ButtonBar className="w-52">
                  <Button
                    type="button"
                    onClick={() => {
                      // if (selectedConvenio?.ean.length < 2) {
                      //   return;
                      // }
                      const copy = { ...selectedConvenio };
                      copy?.ean.splice(ind, 1);
                      setSelectedConvenio({ ...copy });
                    }}
                  >
                    Eliminar ean
                  </Button>
                </ButtonBar>
              </div>
            ))}
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  const copy = { ...selectedConvenio };
                  copy?.ean.push("");
                  setSelectedConvenio({ ...copy });
                }}
              >
                Añadir ean
              </Button>
            </ButtonBar>
          </Fieldset>
          <Fieldset legend={"Convenios Autorizador"}>
            {selectedConvenio?.relaciones.map(([key, val], relIndex) => {
              const allAuths = autorizadoresRecaudo.map(
                ({ pk_id_autorizador, nombre_autorizador }) => ({
                  value: pk_id_autorizador,
                  label: nombre_autorizador,
                })
              );
              // const allAuths = [
              //   { value: 13, label: "Davivienda CB" },
              //   { value: 14, label: "Scotiabank Colpatria" },
              //   { value: 16, label: "Banco Agrario" },
              //   { value: 17, label: "Grupo Aval" },
              // ];
              const existe = (value) =>
                selectedConvenio?.relaciones
                  .map(([key_local]) => parseInt(key_local))
                  .includes(value);
              const selectorAutorizadores = [
                { value: "", label: "" },
                ...allAuths.filter(
                  ({ value }) =>
                    !existe(value) || (existe(value) && parseInt(key) === value)
                ),
              ];
              return (
                <div
                  className="flex flex-wrap align-middle justify-center"
                  key={relIndex}
                >
                  <Select
                    id={`relaciones_${relIndex}`}
                    label="Autorizador"
                    name="r_keys"
                    options={selectorAutorizadores}
                    // options={[
                    //   { value: "", label: "" },
                    //   { value: 13, label: "Davivienda CB" },
                    //   { value: 14, label: "Scotiabank Colpatria" },
                    //   { value: 16, label: "Banco Agrario" },
                    //   { value: 17, label: "Grupo Aval" },
                    // ]}
                    value={key}
                    onChange={(ev) =>
                      setSelectedConvenio((old) => {
                        const copy = { ...old };
                        copy.relaciones[relIndex] = [
                          parseInt(ev.target.value),
                          val,
                        ];
                        return { ...copy };
                      })
                    }
                    required
                  />
                  <Input
                    id={`relaciones_${relIndex}`}
                    label="Id convenio"
                    name="r_vals"
                    type="text"
                    autoComplete="off"
                    value={val}
                    onChange={(ev) =>
                      setSelectedConvenio((old) => {
                        const copy = { ...old };
                        const temp_value =  onChangeNumber(ev)
                        copy.relaciones[relIndex] = [key, temp_value];
                        return { ...copy };
                      })
                    }
                    maxLength={8}
                    required
                  />
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={() => {
                        const copy = { ...selectedConvenio };
                        copy?.relaciones.splice(relIndex, 1);
                        setSelectedConvenio({ ...copy });
                      }}
                    >
                      Eliminar autorizador
                    </Button>
                  </ButtonBar>
                </div>
              );
            })}
            <ButtonBar>
              {selectedConvenio?.relaciones.length !==
                autorizadoresRecaudo.length && (
                <Button
                  type="button"
                  onClick={() => {
                    const copy = { ...selectedConvenio };
                    copy?.relaciones.push(["", ""]);
                    setSelectedConvenio({ ...copy });
                  }}
                >
                  Añadir autorizador
                </Button>
              )}
            </ButtonBar>
          </Fieldset>
          <ButtonBar>
            <Button type="submit">
              {isCreate ? "Crear" : "Actualizar"} convenio
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AdminConveniosPDP;
