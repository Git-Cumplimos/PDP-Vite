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

  useEffect(() => {
    getConveniosPinesTiposValores()
      .then((res) =>
        setTiposValores(
          res?.obj?.map(({ pk_id_tipo_valor, nombre_tipo_valor }) => ({
            label: nombre_tipo_valor,
            valor: pk_id_tipo_valor,
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

  const handleClose = useCallback(() => {
    if (!loading) {
      setShowModal(false);
      setSelected(null);
      setUploadMasivo(false);
    }
  }, [loading]);

  const addConvenio = useCallback((ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    const body = Object.fromEntries(formData);
    console.log(body);
    notifyPending(
      addConveniosPinesList(body),
      {
        render() {
          setLoading(true);
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          console.log(res);
          return "Convenio agregado exitosamente";
        },
      },
      {
        render({ data: err }) {
          if (err?.cause === "custom") {
            return err?.message;
          }
          console.error(err?.message);
          return "Creacion fallida";
        },
      }
    );
  }, []);

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
        headers={[
          "Id error",
          "Codigo de error",
          "Codigo de error base 64",
          "Mensaje de error",
        ]}
        data={listaConveniosPines.map(
          ({ error_code, error_code_b64, error_msg, pk_error_id }, index) => ({
            pk_error_id,
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
        {!selected ? (
          uploadMasivo ? (
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
                Crear convenio
              </h1>
              <Form onSubmit={addConvenio} grid>
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
                  required
                />
                <Input
                  id={"nombre_convenio"}
                  label={"Nombre del Convenio"}
                  name={"nombre_convenio"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                  required
                />
                <Select
                  className="place-self-stretch"
                  id={"fk_tipo_valor"}
                  label={"Modificar valor"}
                  name={"fk_tipo_valor"}
                  options={[{ label: "", value: "" }, ...tiposValores]}
                  required
                />
                <Input
                  id={"referencia_1"}
                  label={"Referencia 1"}
                  name={"referencia_1"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                  required
                />
                <Input
                  id={"referencia_2"}
                  label={"Referencia 2"}
                  name={"referencia_2"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                />
                <Input
                  id={"referencia_3"}
                  label={"Referencia 3"}
                  name={"referencia_3"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                />
                <Input
                  id={"referencia_4"}
                  label={"Referencia 4"}
                  name={"referencia_4"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                />
                <Input
                  id={"referencia_5"}
                  label={"Referencia 5"}
                  name={"referencia_5"}
                  type="text"
                  autoComplete="off"
                  maxLength={"255"}
                />
                <ButtonBar>
                  <Button type={"submit"} disabled={loading}>
                    Crear convenio pin
                  </Button>
                </ButtonBar>
              </Form>
            </Fragment>
          )
        ) : (
          ""
        )}
      </Modal>
    </Fragment>
  );
};

export default ConveniosPines;
