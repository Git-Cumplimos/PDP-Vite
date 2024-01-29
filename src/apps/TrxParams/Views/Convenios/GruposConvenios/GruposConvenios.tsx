import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../../components/Base/Form/Form";
import Input from "../../../../../components/Base/Input/Input";
import Modal from "../../../../../components/Base/Modal/Modal";
import { useNavigate } from "react-router-dom";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import TablaGruposConvenios from "./components/TablaGruposConvenios";

const urlGruposConvenios =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const GruposConvenios = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [nombreNuevoGrupo, setNombreNuevoGrupo] = useState("");
  const [reloadConvGroups, setReloadConvGroups] = useState(() => () => {});

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleCloseReload = useCallback(() => {
    handleClose();
    reloadConvGroups();
    setNombreNuevoGrupo("");
  }, [handleClose, reloadConvGroups]);

  const [updateGroupsConvenios, loadingUpdate] = useFetchDebounce(
    {
      url: `${urlGruposConvenios}/servicio-grupo-convenios/crear-grupo-convenios`,
      options: useMemo(() => {
        const dataBody = {
          nombre_grupo_convenios: nombreNuevoGrupo,
        };
        return {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataBody),
        };
      }, [nombreNuevoGrupo]),
      autoDispatch: false,
    },
    {
      onPending: useCallback(() => "Creando grupo de convenios", []),
      onSuccess: useCallback(() => {
        handleCloseReload();
        return "Creacion de grupo de convenios exitosa";
      }, [handleCloseReload]),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          return error.message;
        } else {
          console.error(error);
          return "Error creando el grupo de convenio";
        }
      }, []),
    },
    { notify: true }
  );

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      updateGroupsConvenios();
    },
    [updateGroupsConvenios]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear grupo de convenios
        </Button>
      </ButtonBar>
      <TablaGruposConvenios
        onSelect={useCallback(
          (convGroup) =>
            navigate(
              `/params-operations/convenios-recaudo/grupos-convenios/edit/${convGroup.pk_tbl_grupo_convenios}`
            ),
          [navigate]
        )}
        setReloadFunction={setReloadConvGroups}
      />

      <Modal
        show={showModal}
        handleClose={loadingUpdate ? () => {} : handleClose}
      >
        <h1 className="text-3xl text-center">Crear grupo convenios</h1>
        <Form onSubmit={onSubmit} grid>
          <Input
            id="nombre_grupo_convenios"
            name="nombre_grupo_convenios"
            label="Nombre grupo de convenios"
            type="text"
            autoComplete="off"
            maxLength={30}
            required
            disabled={loadingUpdate}
          />
          <ButtonBar>
            <Button
              type="button"
              onClick={handleClose}
              disabled={loadingUpdate}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loadingUpdate}>
              Crear grupo convenios
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default GruposConvenios;
