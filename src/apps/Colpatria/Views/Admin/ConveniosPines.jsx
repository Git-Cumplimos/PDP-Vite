import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import FileInput from "../../../../components/Base/FileInput";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { onChangeNumber } from "../../../../utils/functions";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  getConveniosPinesList,
  addConveniosPinesList,
  modConveniosPinesList,
  getConveniosPinesTiposValores,
} from "../../utils/fetchFunctions";

const ConveniosPines = () => {
  const [listaConveniosPines, setListaConveniosPines] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploadMasivo, setUploadMasivo] = useState(false);

  const [tiposValores, setTiposValores] = useState([]);

  const [loading, setLoading] = useState(false);

  const getConvPines = useCallback(() => {
    getConveniosPinesList({ ...pageData })
      .then((res) => {
        setListaConveniosPines(res?.obj?.results ?? []);
        setMaxPages(res?.obj?.maxPages ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, [pageData]);

  useEffect(() => {
    getConveniosPinesTiposValores()
      .then((res) =>
        setTiposValores(
          res?.obj?.map(({ pk_id_tipo_valor, nombre_tipo_valor }) => ({
            label: nombre_tipo_valor,
            value: pk_id_tipo_valor,
          }))
        )
      )
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, []);
  useEffect(() => {
    getConvPines();
  }, [getConvPines]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setShowModal(false);
      setSelected(null);
      setUploadMasivo(false);
    }
  }, [loading]);

  const handleConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(formData);
      console.log(body);
      notifyPending(
        selected
          ? modConveniosPinesList({ pk_codigo_convenio: "" }, body)
          : addConveniosPinesList(body),
        {
          render() {
            setLoading(true);
            return "Enviando solicitud";
          },
        },
        {
          render({ data: res }) {
            setLoading(false);
            console.log(res);
            handleClose();
            getConvPines();
            return `Convenio ${
              selected ? "modificado" : "agregado"
            } exitosamente`;
          },
        },
        {
          render({ data: err }) {
            setLoading(false);
            if (err?.cause === "custom") {
              return err?.message;
            }
            console.error(err?.message);
            return `${selected ? "Edicion" : "Creacion"} fallida`;
          },
        }
      );
    },
    [handleClose, getConvPines, selected]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenio de pines de recaudo Colpatria</h1>
      <ButtonBar>
        <Button type={"submit"} onClick={() => setShowModal(true)}>
          Crear nuevo convenio
        </Button>
        <Button
          type={"submit"}
          onClick={() => {
            setShowModal(true);
            setUploadMasivo(true);
          }}
        >
          Crear convenios (masivo)
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Convenios de pines"
        headers={["Codigo convenio", "Codigo pin", "Nombre convenio", "Estado"]}
        data={listaConveniosPines.map(
          ({
            pk_codigo_convenio,
            codigo_pin,
            nombre_convenio,
            fk_tipo_valor,
            activo,
          }) => ({
            pk_codigo_convenio,
            codigo_pin,
            nombre_convenio,
            activo: activo ? "Activo" : "No activo",
          })
        )}
        maxPage={maxPages}
        onSetPageData={setPageData}
        onSelectRow={(e, i) => {
          setShowModal(true);
          setSelected(listaConveniosPines[i]);
        }}
      ></TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        {uploadMasivo ? (
          <Form grid>
            <FileInput
              label={"Archivo masivo"}
              onGetFile={() => {}}
              allowDrop={false}
            />
            <ButtonBar>
              <Button type={"submit"}>Realizar carge</Button>
            </ButtonBar>
          </Form>
        ) : (
          <Fragment>
            <h1 className="text-3xl mx-auto text-center mb-4">
              {selected ? "Editar" : "Crear"} convenio
            </h1>
            <Form onSubmit={handleConvenio} grid>
              <Input
                id={"pk_codigo_convenio"}
                label={"Codigo de convenio"}
                name={"pk_codigo_convenio"}
                type="tel"
                autoComplete="off"
                maxLength={"6"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={selected?.pk_codigo_convenio ?? ""}
                // disabled={selected ?? false}
                required
              />
              <Input
                id={"codigo_pin"}
                label={"Codigo pin"}
                name={"codigo_pin"}
                type="tel"
                autoComplete="off"
                maxLength={"4"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={selected?.codigo_pin ?? ""}
                required
              />
              <Input
                id={"nombre_convenio"}
                label={"Nombre del Convenio"}
                name={"nombre_convenio"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.nombre_convenio ?? ""}
                required
              />
              <Select
                className="place-self-stretch"
                id={"fk_tipo_valor"}
                label={"Modificar valor"}
                name={"fk_tipo_valor"}
                options={[{ label: "", value: "" }, ...tiposValores]}
                defaultValue={selected?.fk_tipo_valor ?? ""}
                required
              />
              <Input
                id={"referencia_1"}
                label={"Referencia 1"}
                name={"referencia_1"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.referencia_1 ?? ""}
                required
              />
              <Input
                id={"referencia_2"}
                label={"Referencia 2"}
                name={"referencia_2"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.referencia_2 ?? ""}
              />
              <Input
                id={"referencia_3"}
                label={"Referencia 3"}
                name={"referencia_3"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.referencia_3 ?? ""}
              />
              <Input
                id={"referencia_4"}
                label={"Referencia 4"}
                name={"referencia_4"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.referencia_4 ?? ""}
              />
              <Input
                id={"referencia_5"}
                label={"Referencia 5"}
                name={"referencia_5"}
                type="text"
                autoComplete="off"
                maxLength={"255"}
                defaultValue={selected?.referencia_5 ?? ""}
              />
              <ButtonBar>
                <Button type={"submit"} disabled={loading}>
                  {selected ? "Realizar cambios" : "Crear convenio pin"}
                </Button>
              </ButtonBar>
            </Form>
          </Fragment>
        )}
      </Modal>
    </Fragment>
  );
};

export default ConveniosPines;
