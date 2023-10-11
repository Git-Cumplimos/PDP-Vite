import React, { useState, useCallback, useEffect, Fragment } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  crearPltExterno,
  buscarPlataformaExt,
  editarExterno,
} from "../../utils/fetchCaja";
import { notifyError, notifyPending } from "../../../../utils/notify";
// import { useAuth } from "../../../../hooks/AuthHooks";


const ParametrizacionRecaudo = () => {
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [maxpages, setMaxPages] = useState(2);
  const [data, setData] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ pk_nombre_plataforma: "" });
  const [selectedEntity, setSelectedEntity] = useState(null);
  // const { roleInfo} = useAuth();

  const buscarPlataforma = useCallback(() => {
    buscarPlataformaExt({ ...pageData, ...searchFilters })
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

  const closeModal = useCallback(() => {
    buscarPlataforma();
    setShowModal(false);
    setSelectedEntity(null);
  }, []);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData)).map(([key, val]) => {return [key,val];}));
      notifyPending(
        crearPltExterno(body),
        {
          render: () => {
            return "Procesando peticion";
          },
        },
        {
          render: ({ data: res }) => {
            closeModal();
            buscarPlataforma();
            return res?.msg;
          },
        },
        {
          render: ({ data: err }) => {
            if (err?.cause === "custom") {
              return 'Plataforma Duplicada';
            }
            return "Peticion fallida";
          },
        }
      );
    },
    [closeModal, buscarPlataforma]
  );

  const handleSubmitUpdate = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData)).map(([key, val]) => {return [key,val];}));
      selectedEntity.pk_nombre_plataforma = body.pk_nombre_plataforma
      notifyPending(
        editarExterno(
          {
            pk_id_plataforma: "",
            pk_nombre_plataforma: "",
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
            buscarPlataforma();
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
    [closeModal, buscarPlataforma,selectedEntity]
  );

  useEffect(() => {
    buscarPlataforma();
  }, [buscarPlataforma]);

  // const handleInput = (e) => {
  //   selectedEntity[e.target.name]=e.target.value.toUpperCase()
  // }

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Creación Plataforma Externos</h1>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear externo
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Plataformas Externas"
        headers={["Id","Nombre Plataforma"]}
        maxPage={maxpages}
        onSetPageData={setPageData}
        data={
          data?.map(({ pk_id_plataforma, pk_nombre_plataforma}) => ({
            pk_id_plataforma,
            pk_nombre_plataforma,
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
          id="pk_nombre_plataforma"
          name="pk_nombre_plataforma"
          label={"Plataforma"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
        <ButtonBar />
      </TableEnterprise>

      <Modal show={showModal || selectedEntity} handleClose={closeModal}>
        <h1 className="text-2xl mb-6 text-center font-semibold">
          Creación Plataforma Externos
        </h1>
        {!selectedEntity ? (
          <Form onSubmit={handleSubmit} grid>
            <Fragment>
              <Input
                id="pk_nombre_plataforma"
                name="pk_nombre_plataforma"
                label={`Nombre de la plataforma`}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
                autoComplete="off"
                maxLength={"30"}
                required
              />
              <ButtonBar>
                <Button type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Tercero
                </Button>
              </ButtonBar>
            </Fragment>
          </Form>
        ) : (
          <Form onSubmit={handleSubmitUpdate} grid>
            <Input
              id="pk_nombre_plataforma"
              name="pk_nombre_plataforma"
              label={'Nombre Plataforma'}
              defaultValue={selectedEntity?.pk_nombre_plataforma ?? ""}
              onChange={(e) => {
                 e.target.value = e.target.value.toUpperCase();
              }}
              // onChange={(e) => {
              //   handleInput(e);
              // }}
            />
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
