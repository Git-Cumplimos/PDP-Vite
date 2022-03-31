import { useState, useEffect, Fragment, useCallback } from "react";
import Table from "../../../components/Base/Table";
import Button from "../../../components/Base/Button";
import fetchData from "../../../utils/fetchData";
import Pagination from "../../../components/Compound/Pagination";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import { notify, notifyError } from "../../../utils/notify";
import Form from "../../../components/Base/Form";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import useQuery from "../../../hooks/useQuery";
import ToggleInput from "../../../components/Base/ToggleInput";
import InputX from "../../../components/Base/InputX/InputX";
import { button } from "aws-amplify";
import React, { useRef } from "react";
import classes from "../Views/AsesoresComerciales.module.css";

const url = process.env.REACT_APP_URL_SERVICE_COMMERCE;

const AsesoresComerciales = () => {
  const { contenedorPrincipal, contendorBoton } = classes;
  const [{ page = 1 }] = useQuery();

  const [asesoresComerciales, setAsesoresComerciales] = useState([]);
  const [cantidadPaginas, setCantidadPaginas] = useState(0);
  const [responsables, setResponsables] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [linkAsesor, setLinkAsesor] = useState("");

  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelected(null);
    setLinkAsesor("");
  }, []);

  const fetchAsesores = useCallback(() => {
    fetchData(`${url}/asesores`, "GET", { page })
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          return;
        }
        setAsesoresComerciales(res?.obj?.results);
        setCantidadPaginas(res?.obj?.maxPages);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al cargar Datos Asesores");
      });
  }, [page]);

  const onCrearAsesor = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      fetchData(
        `${url}/asesores`,
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
        notify("El Asesor Ha Sido Creado Con Exito.");
        fetchAsesores();
        handleClose();
      });
    },
    [handleClose, fetchAsesores]
  );

  const onEditAsesor = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.target);

      const body = Object.fromEntries(formData.entries());
      const { id_asesor } = body;
      delete body.id_asesor;

      fetchData(
        `${url}/asesores`,
        "PUT",
        {
          id_asesor,
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
        notify("El Asesor Ha Sido Editado Con Exito.");
        fetchAsesores();
        handleClose();
      });
    },
    [handleClose, fetchAsesores]
  );

  useEffect(() => {
    fetchAsesores();
  }, [fetchAsesores]);

  useEffect(() => {
    fetchData(`${url}/responsables`, "GET", {
      limit: 0,
    }).then((respuesta) =>
      setResponsables(
        Object.fromEntries([
          ["", ""],
          ...respuesta?.obj?.results?.map(({ nombre, id_responsable }) => [
            nombre,
            id_responsable,
          ]),
        ])
      )
    );
  }, []);
  const GenerarLinkAsesor = () => {
    const link = `https://certificacion.puntodepagopruebas.com/solicitud-enrolamiento/formulario/${window.btoa(
      selected.id_asesor
    )}`;
    setLinkAsesor(link);
  };
  /*   const GenerarLinkAsesor = () => {
    const link = `http://localhost:3000/public/solicitud-enrolamiento/formulario/${window.btoa(
      selected.id_asesor
    )}`;
    setLinkAsesor(link);
  }; */

  let inputRef = HTMLInputElement | null;
  const copyLink = () => {
    navigator.clipboard.writeText(inputRef.defaultValue);
    notify("Copia Exitosa.");
    /*    console.log("INPUT VALUE: ", inputRef?.value); */
  };

  console.log("Rendering");
  return (
    <Fragment>
      <ButtonBar>
        <Button type="" onClick={() => setShowModal(true)}>
          Agregar Asesor
        </Button>
      </ButtonBar>
      <Pagination maxPage={cantidadPaginas} grid></Pagination>
      {Array.isArray(asesoresComerciales) && asesoresComerciales.length > 0 ? (
        <Table
          headers={["Id Asesor", "Nombre Asesor", "Estado", "Responsable"]}
          data={asesoresComerciales.map(
            ({ id_asesor, nom_asesor, estado, responsable }) => {
              return {
                id_asesor,
                nom_asesor,
                estado: estado ? "Activo" : "Inactivo",
                responsable: responsable?.nombre ?? "",
              };
            }
          )}
          onSelectRow={(e, i) => {
            setSelected(asesoresComerciales[i]);
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
              title="Editar asesor"
              subtitle="Datos asesor"
              summaryTrx={{ "Nombre asesor": selected?.nom_asesor ?? "" }}
            ></PaymentSummary>
            <Form onSubmit={onEditAsesor} grid>
              <input
                type="hidden"
                name="id_asesor"
                value={selected?.id_asesor}
              />
              <Select
                id="id_responsable_crear_asesor"
                name="id_responsable"
                label={`Seleccione Responsable`}
                options={responsables}
                value={selected?.responsable?.id_responsable ?? ""}
                onChange={(ev) =>
                  setSelected((old) => ({
                    ...old,
                    responsable: {
                      ...old?.responsable,
                      id_responsable: ev.target.value,
                    },
                  }))
                }
                required
              />
              <ToggleInput
                id="estadoAsesorEdit"
                label={"Activo"}
                name="estado"
                defaultChecked={selected?.estado ?? false}
              />

              <ButtonBar>
                <Button type={"submit"}>Editar asesor</Button>
              </ButtonBar>
            </Form>
            <ButtonBar>
              <Button
                onClick={() => {
                  GenerarLinkAsesor();
                }}
              >
                Generar Link
              </Button>
            </ButtonBar>
            {linkAsesor ? (
              <div className={contenedorPrincipal}>
                <div>
                  <input
                    size="58"
                    ref={(node) => {
                      inputRef = node;
                    }}
                    type="text"
                    id="link"
                    defaultValue={linkAsesor}
                  />
                </div>
                <div>
                  <button className={contendorBoton} onClick={copyLink}>
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </Fragment>
        ) : (
          /* <InputX value={linkAsesor}></InputX> */
          <Fragment>
            <PaymentSummary
              title="Crear asesor"
              subtitle="Datos asesor"
            ></PaymentSummary>
            <Form onSubmit={onCrearAsesor} grid>
              <Input
                label={"Nombre Asesor"}
                id="nom_asesor_crear_asesor"
                name="nom_asesor"
                type={"text"}
                required
              />
              <Select
                id="id_responsable_crear_asesor"
                name="id_responsable"
                label={`Seleccione Responsable`}
                options={responsables}
                required
              />

              <ButtonBar>
                <Button type={"submit"}>Crear asesor</Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};
export default AsesoresComerciales;
