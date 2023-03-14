import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import FileInput from "../../../../components/Base/FileInput";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TextArea from "../../../../components/Base/TextArea";
import ToggleInput from "../../../../components/Base/ToggleInput";
import { onChangeNumber } from "../../../../utils/functions";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  getConveniosRecaudoList,
  addConveniosRecaudoList,
  modConveniosRecaudoList,
  getTiposValores,
  getConveniosRecaudoListMassive,
  addConveniosRecaudoListMassive,
} from "../../utils/fetchFunctions";

const ConveniosRecaudo = () => {
  const [listaConveniosRecaudo, setListaConveniosRecaudo] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [searchFilters, setSearchFilters] = useState({
    pk_codigo_convenio: "",
    codigo_ean_iac: "",
    nombre_convenio: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploadMasivo, setUploadMasivo] = useState(false);
  const [massiveFile, setMassiveFile] = useState(null);
  const [uploadingError, setUploadingError] = useState("");

  const [tiposValores, setTiposValores] = useState([]);

  const [loading, setLoading] = useState(false);

  const getConvRecaudo = useCallback(() => {
    getConveniosRecaudoList({
      ...pageData,
      ...Object.fromEntries(
        Object.entries(searchFilters).filter(([, val]) => val)
      ),
    })
      .then((res) => {
        setListaConveniosRecaudo(res?.obj?.results ?? []);
        setMaxPages(res?.obj?.maxPages ?? []);
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
          return;
        }
        console.error(err?.message);
      });
  }, [pageData, searchFilters]);

  useEffect(() => {
    getTiposValores()
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
    getConvRecaudo();
  }, [getConvRecaudo]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setShowModal(false);
      setSelected(null);
      setUploadMasivo(false);
      setMassiveFile(null);
    }
  }, [loading]);

  const handleConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
          .map(([key, val]) => [
            key,
            key.includes("referencia_") && val === ""
              ? null
              : key === "activo"
              ? val === "on"
              : val,
          ])
          .filter(([key, val]) =>
            !selected
              ? val
              : selected[key] !== val || key === "pk_codigo_convenio"
          )
      );
      notifyPending(
        selected
          ? modConveniosRecaudoList({ pk_codigo_convenio: "" }, body)
          : addConveniosRecaudoList(body),
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
            getConvRecaudo();
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
    [handleClose, getConvRecaudo, selected]
  );

  const downloadMasive = useCallback(() => {
    notifyPending(
      getConveniosRecaudoListMassive({
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([, val]) => val)
        ),
      }),
      {
        render() {
          setLoading(true);
          return "Enviando solicitud";
        },
      },
      {
        render({ data: response }) {
          setLoading(false);
          const filename = response.headers
            .get("Content-Disposition")
            .split("; ")?.[1]
            .split("=")?.[1];

          response.blob().then((blob) => {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
              // other browsers
              const exportUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = exportUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(exportUrl);
              document.body.removeChild(a);
            }
          });
          return "Descarga de archivo de convenios exitosa";
        },
      },
      {
        render({ data: err }) {
          setLoading(false);
          if (err?.cause === "custom") {
            return err?.message;
          }
          console.error(err?.message);
          return "Descarga de archivo de convenios fallida";
        },
      }
    );
  }, [searchFilters]);

  const handleUploadMasivo = useCallback(
    (ev) => {
      ev.preventDefault();
      const formData = new FormData();
      formData.set("file", massiveFile);
      notifyPending(
        addConveniosRecaudoListMassive(formData),
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
            getConvRecaudo();
            return `Se han creado ${res?.obj?.stats_creados} y se han modificado ${res?.obj?.stats_modificados} convenios de recaudo de colpatria`;
          },
        },
        {
          render({ data: err }) {
            setLoading(false);
            if (err?.cause === "custom") {
              setUploadingError(err?.message);
              return "Subida de archivo fallida";
              // return err?.message;
            }
            console.error(err?.message);
            return "Subida de archivo fallida";
          },
        }
      );
    },
    [handleClose, getConvRecaudo, massiveFile]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Convenios de recaudo Colpatria</h1>
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
        title="Convenios de recaudo"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
          "Estado",
        ]}
        data={listaConveniosRecaudo.map(
          ({
            pk_codigo_convenio,
            codigo_ean_iac,
            nombre_convenio,
            fk_tipo_valor,
            activo,
          }) => ({
            pk_codigo_convenio,
            codigo_ean_iac,
            nombre_convenio,
            activo: activo ? "Activo" : "No activo",
          })
        )}
        maxPage={maxPages}
        onSetPageData={setPageData}
        onSelectRow={(e, i) => {
          setShowModal(true);
          setSelected(listaConveniosRecaudo[i]);
        }}
        onChange={(ev) =>
          setSearchFilters((old) => ({
            ...old,
            [ev.target.name]: ev.target.value,
          }))
        }
        actions={{
          download: downloadMasive,
        }}
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_codigo_convenio"}
          type="tel"
          autoComplete="off"
          maxLength={"4"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          defaultValue={selected?.pk_codigo_convenio ?? ""}
          readOnly={selected}
          required
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"codigo_ean_iac"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onChange={(ev) => {
            ev.target.value = onChangeNumber(ev);
          }}
          defaultValue={selected?.codigo_ean_iac ?? ""}
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
          defaultValue={selected?.nombre_convenio ?? ""}
          required
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={handleClose}>
        {uploadMasivo ? (
          <Form onSubmit={handleUploadMasivo} grid>
            <FileInput
              label={"Elegir archivo masivo"}
              onGetFile={(files) => {
                if (Array.isArray(files)) {
                  setMassiveFile(files[0]);
                  return;
                } else if (files instanceof FileList) {
                  setMassiveFile(files.item(0));
                  return;
                }
                setMassiveFile(files);
              }}
              allowDrop={false}
              required
            />
            <TextArea
              id={"filename"}
              label={"Archivo seleccionado"}
              value={massiveFile?.name ?? ""}
              disabled
              readOnly
            />
            {uploadingError && (
              <div className="p-4 rounded bg-yellow-300">
                <p className="whitespace-pre-wrap">{uploadingError}</p>
              </div>
            )}
            <ButtonBar>
              <Button type={"submit"}>Realizar cargue</Button>
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
                label={"Código de convenio"}
                name={"pk_codigo_convenio"}
                type="tel"
                autoComplete="off"
                maxLength={"4"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={selected?.pk_codigo_convenio ?? ""}
                readOnly={selected}
                required
              />
              <Input
                id={"codigo_ean_iac"}
                label={"Código EAN o IAC"}
                name={"codigo_ean_iac"}
                type="tel"
                autoComplete="off"
                minLength={"13"}
                maxLength={"13"}
                onChange={(ev) => {
                  ev.target.value = onChangeNumber(ev);
                }}
                defaultValue={selected?.codigo_ean_iac ?? ""}
              />
              <Input
                id={"nombre_convenio"}
                label={"Nombre del Convenio"}
                name={"nombre_convenio"}
                type="text"
                autoComplete="off"
                maxLength={"30"}
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
                maxLength={"30"}
                defaultValue={selected?.referencia_1 ?? ""}
                required
              />
              <Input
                id={"referencia_2"}
                label={"Referencia 2"}
                name={"referencia_2"}
                type="text"
                autoComplete="off"
                maxLength={"30"}
                defaultValue={selected?.referencia_2 ?? ""}
              />
              <Input
                id={"referencia_3"}
                label={"Referencia 3"}
                name={"referencia_3"}
                type="text"
                autoComplete="off"
                maxLength={"30"}
                defaultValue={selected?.referencia_3 ?? ""}
              />
              {selected && (
                <ToggleInput
                  id={"activo"}
                  label={"Se encuentra activo"}
                  name={"activo"}
                  defaultChecked={selected?.activo}
                />
              )}
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

export default ConveniosRecaudo;
