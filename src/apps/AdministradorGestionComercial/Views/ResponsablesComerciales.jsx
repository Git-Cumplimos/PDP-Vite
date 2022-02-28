import { useState, useEffect, Fragment, useCallback } from "react";
import Table from "../../../components/Base/Table/Table";
import Button from "../../../components/Base/Button/Button";
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import { notify, notifyError } from "../../../utils/notify";
import Form from "../../../components/Base/Form/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary/PaymentSummary";
import Input from "../../../components/Base/Input/Input";
import Select from "../../../components/Base/Select/Select";
import useQuery from "../../../hooks/useQuery";
import ToggleInput from "../../../components/Base/ToggleInput/ToggleInput";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const ResponsablesComerciales = () => {
  const [{ page = 1 }] = useQuery();

  const [responsables, setResponsables] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [zonas, setZonas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
  }, []);

  const fetchResponsables = useCallback(() => {
    fetchData(`${url}/responsables`, "GET", { page })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setResponsables(res?.obj?.results);
        setCantidadPaginas(res?.obj?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page]);

  const onCrearResponsable = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      fetchData(
        `${url}/responsables`,
        "POST",
        {},
        {
          ...Object.fromEntries(formData.entries()),
          estado: true,
        }
      ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("El Responsable Ha Sido Creado Con Exito.");
        fetchResponsables();
        handleClose();
      });
    },
    [handleClose, fetchResponsables]
  );

  const onEditResponsable = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const body = Object.fromEntries(formData.entries());
      const { id_responsable } = body;
      delete body.id_responsable;

      fetchData(
        `${url}/responsables`,
        "PUT",
        {
          id_responsable,
        },
        {
          ...body,
          estado: formData.get("estado") ? true : false,
        }
      ).then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        ev.target.reset();
        notify("El Responsable Ha Sido Editado Con Exito.");
        fetchResponsables();
        handleClose();
      });
    },
    [handleClose, fetchResponsables]
  );

  useEffect(() => {
    fetchResponsables();
  }, [fetchResponsables]);

  useEffect(() => {
    fetchData(`${url}/zonas`, "GET", {
      limit: 0
    }).then((respuesta) =>
      setZonas(
        Object.fromEntries([
          ["", ""],
          ...respuesta?.obj?.results?.map(({ zona, id_zona }) => [
            zona,
            id_zona,
          ]),
        ])
      )
    );
  }, []);

  return (
    <Fragment>
      <ButtonBar>
        <Button type="" onClick={() => setShowModal(true)}>
          Agregar Responsable
        </Button>
      </ButtonBar>
      <Pagination maxPage={cantidadPaginas} grid></Pagination>
      {Array.isArray(responsables) && responsables.length > 0 ? (
        <Table
          headers={["Id Responsable", "Nombre Responsable", "Estado"]}
          data={responsables.map(
            ({ id_responsable, nombre, estado }) => {
              return {
                id_responsable,
                nombre,
                estado: estado ? "Activo" : "Inactivo",
              };
            }
          )}
          onSelectRow={(e, i) => {
            setSelected(responsables[i]);
            setShowModal(true);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        {selected ? (
          <Fragment>
            <PaymentSummary
              title="Editar responsable"
              subtitle="Datos responsable"
              summaryTrx={{ "Nombre responsable": selected?.nombre ?? "" }}
            ></PaymentSummary>
            <Form onSubmit={onEditResponsable} grid>
              <input
                type="hidden"
                name="id_responsable"
                value={selected?.id_responsable}
              />
              <Select
                id="id_zona_editar_responsable"
                name="zona_id_zona"
                label={`Seleccione zona`}
                options={zonas}
                value={selected?.zona?.id_zona ?? ""}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    zona: {
                      ...old?.zona,
                      id_zona: ev.target.value,
                    },
                  }))
                }
                required
              />
              <ToggleInput
                id="estadoResponsableEdit"
                label={"Activo"}
                name="estado"
                defaultChecked={selected?.estado ?? false}
              />
              <ButtonBar>
                <Button type={"submit"}>Editar responsable</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        ) : (
          <Fragment>
            <PaymentSummary
              title="Crear responsable"
              subtitle="Datos responsable"
            ></PaymentSummary>
            <Form onSubmit={onCrearResponsable} grid>
              <Input
                label={"Nombre Responsable"}
                id="nom_responsable_crear_responsable"
                name="nombre"
                type={"text"}
                required
              />
              <Select
                id="id_zona_crear_responsable"
                name="zona_id_zona"
                label={`Seleccione zona`}
                options={zonas}
                required
              />
              <ButtonBar>
                <Button type={"submit"}>Crear responsable</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};
export default ResponsablesComerciales;
