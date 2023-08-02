import React, { Fragment, useCallback, useEffect, useState } from "react";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
// import Input from "../../../../components/Base/Input";
// import { onChangeNumber } from "../../../../utils/functions";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import {
  fetchTrxTypesPages,
  buscarAutorizadorRecaudo,
  crearAutorizadorRecaudo,
  actualizarAutorizadorRecaudo,
} from "./utils";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import { notifyError, notifyPending } from "../../../../utils/notify";

const AutorizadoresRecaudo = () => {
  const [autorizadoresRecaudo, setAutorizadoresRecaudo] = useState([]);
  const [maxPage, setMaxPage] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [/* searchFilters */, setSearchFilters] = useState({
    pk_id_autorizador: "",
    fk_id_tipo_transaccion: "",
  });

  const [selectedAutorizadorRecaudo, setSelectedAutorizadorRecaudo] =
    useState(null);
  const [isCreate, setIsCreate] = useState(null);
  const [searchedAuth, setSearchedAuth] = useState([]);
  const [searchedType, setSearchedType] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedAutorizadorRecaudo(null);
      setIsCreate(null);
    }
  }, [loading]);

  const lazySearch = useDelayedCallback(
    useCallback(() => {
      buscarAutorizadorRecaudo({
        ...pageData,
        // ...Object.fromEntries(
        //   Object.entries(searchFilters)
        //     .filter(([_, val]) => val)
        //     .map(([key, val]) => [key, val])
        // ),
      })
        .then((res) => {
          setAutorizadoresRecaudo(res?.obj?.results ?? []);
          setMaxPage(res?.obj?.max_pages ?? []);
        })
        .catch((err) => {
          if (err?.cause === "custom") {
            notifyError(err?.message);
            return;
          }
          console.error(err?.message);
        });
    }, [pageData/* , searchFilters */]),
    300
  );

  useEffect(() => {
    lazySearch();
  }, [lazySearch]);

  const submitAutorizadorRecaudo = useCallback(
    (ev) => {
      ev.preventDefault();
      const objCopy = structuredClone(selectedAutorizadorRecaudo);
      delete objCopy.nombre_autorizador;
      delete objCopy.nombre_operacion;
      if ("nombre_tipo_transaccion" in objCopy) {
        delete objCopy.nombre_tipo_transaccion;
      }
      notifyPending(
        isCreate
          ? crearAutorizadorRecaudo(objCopy)
          : actualizarAutorizadorRecaudo({}, objCopy),
        {
          render: () => {
            setLoading(true);
            return `${
              isCreate ? "Creando" : "Actualizando"
            } autorizador de recaudo`;
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
    [selectedAutorizadorRecaudo, isCreate, lazySearch, handleClose]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            setSelectedAutorizadorRecaudo({
              pk_id_autorizador: "",
              nombre_autorizador: "",
              fk_id_tipo_transaccion: "",
              nombre_operacion: "",
            });
            setIsCreate(true);
          }}
        >
          Crear autorizador de recaudo
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Autorizadores de recaudo"
        headers={[
          "Id autorizador",
          "Nombre autorizador",
          "Id tipo de transacción",
          "Nombre tipo de transacción",
        ]}
        data={autorizadoresRecaudo.map(
          ({
            pk_id_autorizador,
            fk_id_tipo_transaccion,
            nombre_autorizador,
            nombre_tipo_transaccion,
          }) => ({
            pk_id_autorizador,
            nombre_autorizador,
            fk_id_tipo_transaccion,
            nombre_tipo_transaccion,
          })
        )}
        maxPage={maxPage}
        onSetPageData={setPageData}
        onSelectRow={(e, i) => {
          const copy = structuredClone(autorizadoresRecaudo[i]);
          setSelectedAutorizadorRecaudo({
            ...copy,
            nombre_operacion: copy.nombre_tipo_transaccion,
          });
          setIsCreate(false);
        }}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
      >
        {/* <Input
          id={"pk_id_autorizador"}
          label={"Id de autorizador"}
          name={"pk_id_autorizador"}
          type="tel"
          autoComplete="off"
          maxLength={"10"}
          onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
          required
        />
        <Input
          id={"fk_id_tipo_transaccion"}
          label={"Id tipo transaccion"}
          name={"fk_id_tipo_transaccion"}
          type="tel"
          autoComplete="off"
          maxLength={"10"}
          onChange={(ev) => (ev.target.value = onChangeNumber(ev))}
          required
        /> */}
      </TableEnterprise>
      <Modal
        show={selectedAutorizadorRecaudo && isCreate !== null}
        handleClose={handleClose}
      >
        <Form onSubmit={submitAutorizadorRecaudo} grid>
          <h1 className="text-3xl text-center">
            {isCreate ? "Crear" : "Actualizar"} autorizador de recaudo
          </h1>
          <InputSuggestions
            id="Autorizador"
            name="Autorizador"
            label={"Autorizador"}
            type="search"
            autoComplete="off"
            suggestions={
              searchedAuth.map(({ nombre_autorizador }) => (
                <h1 className="py-2">{nombre_autorizador}</h1>
              )) || []
            }
            onLazyInput={{
              callback: (ev) => {
                if (ev.target.value.length) {
                  fetchAutorizadores({
                    nombre_autorizador: ev.target.value ?? "",
                    limit: 5,
                  })
                    .then((data) => {
                      setSearchedAuth(data?.results);
                      setSelectedAutorizadorRecaudo((old) => {
                        const copy = structuredClone(old);
                        copy.pk_id_autorizador = "";
                        return copy;
                      });
                    })
                    .catch((err) => console.error(err));
                } else {
                  setSearchedAuth([]);
                }
              },
              timeOut: 500,
            }}
            onSelectSuggestion={(i, el) =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.pk_id_autorizador = searchedAuth[i].id_autorizador;
                copy.nombre_autorizador = searchedAuth[i].nombre_autorizador;
                setSearchedAuth([]);
                return copy;
              })
            }
            onClearSearch={() =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.pk_id_autorizador = "";
                return copy;
              })
            }
            value={selectedAutorizadorRecaudo?.nombre_autorizador || ""}
            onChange={(ev) =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.nombre_autorizador = ev.target.value;
                return copy;
              })
            }
            maxLength={30}
            disabled={
              !isCreate || selectedAutorizadorRecaudo?.fk_id_tipo_transaccion
            }
          />
          <InputSuggestions
            id="TipoTrx"
            name="TipoTrx"
            label={"Tipo de transaccion"}
            type="search"
            autoComplete="off"
            suggestions={
              searchedType?.map(({ Nombre }) => (
                <h1 className="py-2">{Nombre}</h1>
              )) || []
            }
            onLazyInput={{
              callback: (ev) => {
                if (ev.target.value.length) {
                  fetchTrxTypesPages({
                    Nombre_operacion: ev.target.value ?? "",
                    Autorizador: selectedAutorizadorRecaudo?.pk_id_autorizador,
                    limit: 5,
                  })
                    // .then((data) => console.log(data))
                    .then((data) => {
                      setSearchedType(data?.obj?.results);
                      setSelectedAutorizadorRecaudo((old) => {
                        const copy = structuredClone(old);
                        copy.fk_id_tipo_transaccion = "";
                        return copy;
                      });
                    })
                    .catch((err) => console.error(err));
                } else {
                  setSearchedType([]);
                }
              },
              timeOut: 500,
            }}
            onSelectSuggestion={(i, el) =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.fk_id_tipo_transaccion = searchedType[i].id_tipo_operacion;
                copy.nombre_operacion = searchedType[i].Nombre;
                setSearchedType([]);
                return copy;
              })
            }
            onClearSearch={() =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.fk_id_tipo_transaccion = "";
                return copy;
              })
            }
            value={selectedAutorizadorRecaudo?.nombre_operacion || ""}
            onChange={(ev) =>
              setSelectedAutorizadorRecaudo((old) => {
                const copy = structuredClone(old);
                copy.nombre_operacion = ev.target.value;
                return copy;
              })
            }
            maxLength={30}
            disabled={!selectedAutorizadorRecaudo?.pk_id_autorizador}
          />
          <ButtonBar>
            <Button type="submit">
              {isCreate ? "Crear" : "Actualizar"} autorizador de recaudo
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AutorizadoresRecaudo;
