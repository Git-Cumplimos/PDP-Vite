import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../../components/Base/Form/Form";
import Input from "../../../../../components/Base/Input/Input";
import Modal from "../../../../../components/Base/Modal/Modal";
import { useParams, Navigate } from "react-router-dom";
import useFetchDebounce from "../../../../../hooks/useFetchDebounce";
import { notifyError } from "../../../../../utils/notify";

import SelectorConvenios from "./components/SelectorConvenios";

const urlGruposConvenios = process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;

const EditGruposConvenios = () => {
  const { id: id_grupo_convenio } = useParams();

  const [showModal, setShowModal] = useState(false);
  const [nombreGrupoConvenio, setNombreGrupoConvenio] = useState("");
  const [updateCurrentConvs, setUpdateCurrentConvs] = useState(() => () => {});
  

  const handleClose = useCallback(() => {
    setShowModal(false);
    updateCurrentConvs();
  }, [updateCurrentConvs]);

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlGruposConvenios}/servicio-grupo-convenios/consultar-grupo-convenio-unico?pk_tbl_grupo_convenios=${id_grupo_convenio}`,
        [id_grupo_convenio]
      ),
      fetchIf: !!id_grupo_convenio,
    },
    {
      onSuccess: useCallback(
        (res) => setNombreGrupoConvenio(res?.obj?.nombre_grupo_convenios),
        []
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    }
  );

  if (!id_grupo_convenio) {
    return <Navigate to={"/params-operations/navconvenios"} />
  }

  return (
    <Fragment>
      <h1 className="text-3xl text-center">Actualizar grupo convenios</h1>
      <Form grid>
        <Input
          id="nombre_grupo_convenios"
          name="nombre_grupo_convenios"
          label="Nombre grupo de convenios"
          type="text"
          autoComplete="off"
          value={nombreGrupoConvenio}
          disabled
        />
        <ButtonBar>
          <Button type="button" onClick={() => setShowModal(true)}>
            Agregar convenios
          </Button>
        </ButtonBar>
      </Form>

      <SelectorConvenios
        type="SEARCH_TABLE_DELETE"
        id_grupo_convenio={id_grupo_convenio}
        setUpdateCurrentConvs={setUpdateCurrentConvs}
      />

      <Modal show={showModal} handleClose={handleClose}>
        <SelectorConvenios
          type="SEARCH_TABLE_ASSIGN"
          id_grupo_convenio={id_grupo_convenio}
          onSuccesUpdate={handleClose}
        />
      </Modal>
    </Fragment>
  );
};

export default EditGruposConvenios;
