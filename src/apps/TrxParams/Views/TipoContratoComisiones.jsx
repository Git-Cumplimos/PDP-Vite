import { Fragment, useCallback, useMemo, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MultipleSelect from "../../../components/Base/MultipleSelect";
import { notify, notifyError } from "../../../utils/notify";
import {
  putTiposContratosComisiones,
  postTiposContratosComisiones,
} from "../utils/fetchTiposContratosComisiones";
import TiposContratosTable from "../components/Commerce/TiposContratosTable";
import { onChangeNumber } from "../../../utils/functions";

const TipoContratoComisiones = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState(null);
  const [reloadDataContratos, setReloadDataContratos] = useState(
    () => () => {}
  );
  
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedTipoContrato(null);
    reloadDataContratos?.();
  }, [reloadDataContratos]);

  const onSelectTipoContrato = useCallback((tipoContrato) => {
    setShowModal(true);
    setSelectedTipoContrato(tipoContrato);
  }, []);

  const onChangeTipoContrato = useCallback(
    (ev) =>
      setSelectedTipoContrato((old) => ({
        ...old,
        id_tipo_contrato: old?.id_tipo_contrato || -1,
        [ev.target.name]: ["iva", "rete_fuente", "rete_ica"].includes(
          ev.target.name
        )
          ? onChangeNumber(ev)
          : ev.target.value,
      })),
    []
  );

  const onChangeMultipleCheck = useCallback((oldData) => {
    setSelectedTipoContrato((old) => ({
      ...old,
      iva: oldData?.iva ? old?.iva || "" : 0,
      rete_fuente: oldData?.rete_fuente ? old?.rete_fuente || "" : 0,
      rete_ica: oldData?.rete_ica ? old?.rete_ica || "" : 0,
    }));
  }, []);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        selectedTipoContrato?.id_tipo_contrato &&
        selectedTipoContrato?.id_tipo_contrato !== -1
      ) {
        putTiposContratosComisiones(
          { id_tipo_contrato: selectedTipoContrato?.id_tipo_contrato },
          {
            nombre_contrato: selectedTipoContrato?.nombre_contrato,
            iva: selectedTipoContrato?.iva || 0,
            rete_fuente: selectedTipoContrato?.rete_fuente || 0,
            rete_ica: selectedTipoContrato?.rete_ica || 0,
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        postTiposContratosComisiones({
          nombre_contrato: selectedTipoContrato?.nombre_contrato,
          iva: selectedTipoContrato?.iva || 0,
          rete_fuente: selectedTipoContrato?.rete_fuente || 0,
          rete_ica: selectedTipoContrato?.rete_ica || 0,
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [selectedTipoContrato, handleClose]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear contrato de comision
        </Button>
        {/* <Button type="submit" onClick={() => setShowModal(true)}>
          Crear convenio masivo
        </Button> */}
      </ButtonBar>
      <TiposContratosTable
        onSelectContract={onSelectTipoContrato}
        setReloadCallback={setReloadDataContratos}
      />
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={onChangeTipoContrato} grid>
          <Input
            id="nombre_contrato"
            name="nombre_contrato"
            label={"Nombre de contrato"}
            type="text"
            autoComplete="off"
            defaultValue={selectedTipoContrato?.nombre_contrato}
            required
          />
          <MultipleSelect
            label="Opciones de comisiones"
            options={useMemo(
              () => ({
                iva: selectedTipoContrato?.iva !== 0,
                rete_fuente: selectedTipoContrato?.rete_fuente !== 0,
                rete_ica: selectedTipoContrato?.rete_ica !== 0,
              }),
              [selectedTipoContrato]
            )}
            onChange={onChangeMultipleCheck}
          />
          {selectedTipoContrato?.iva !== 0 && (
            <Input
              id="iva"
              name="iva"
              label={"IVA"}
              type="tel"
              autoComplete="off"
              defaultValue={selectedTipoContrato?.iva}
              required
            />
          )}
          {selectedTipoContrato?.rete_fuente !== 0 && (
            <Input
              id="rete_fuente"
              name="rete_fuente"
              label={"Rete Fuente"}
              type="tel"
              autoComplete="off"
              defaultValue={selectedTipoContrato?.rete_fuente}
              required
            />
          )}
          {selectedTipoContrato?.rete_ica !== 0 && (
            <Input
              id="rete_ica"
              name="rete_ica"
              label={"Rete ICA"}
              type="tel"
              autoComplete="off"
              defaultValue={selectedTipoContrato?.rete_ica}
              required
            />
          )}
          {!selectedTipoContrato?.id_tipo_contrato ||
          selectedTipoContrato?.id_tipo_contrato === -1 ? (
            <ButtonBar>
              <Button type="submit">Crear contrato</Button>
              <Button type="button" onClick={handleClose}>
                Cancelar
              </Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
                <Button type="submit">Editar contrato</Button>
                <Button type="button" onClick={handleClose}>
                  Cancelar
                </Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default TipoContratoComisiones;
