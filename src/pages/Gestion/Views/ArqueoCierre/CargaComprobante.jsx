import { useState, useCallback, useMemo, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Select from "../../../../components/Base/Select";
import FileInput from "../../../../components/Base/FileInput";
import Fieldset from "../../../../components/Base/Fieldset";
import TextArea from "../../../../components/Base/TextArea";
import Button from "../../../../components/Base/Button";
import InputSuggestions from "../../../../components/Base/InputSuggestions";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { onChangeAccountNumber } from "../../../../utils/functions";
import {
  buscarEntidades,
  subirComprobante,
  agregarComprobante,
  buscarTiposComprobantes,
} from "../../utils/fetchCaja";
import { useAuth } from "../../../../hooks/AuthHooks";
import useMoney from "../../../../hooks/useMoney";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Input from "../../../../components/Base/Input";

const CargaComprobante = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  const [tiposComprobantes, setTiposComprobantes] = useState([]);

  const [movementType, setMovementType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [foundEntities, setFoundEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [file, setFile] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [comprobanteNumber, setComprobanteNumber] = useState("");
  const [valorComprobante, setValorComprobante] = useState(0.0);
  const [observaciones, setObservaciones] = useState("");

  const [limitesMontos, setLimitesMontos] = useState({
    max: 9999999,
    min: 5000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const staticInfo = useMemo(
    () => ({
      "Id comercio": roleInfo?.id_comercio,
      "Id usuario": roleInfo?.id_usuario,
    }),
    [roleInfo?.id_comercio, roleInfo?.id_usuario]
  );

  const searchEntities = useCallback((ev, is_transport) => {
    const _consulta = ev.target.value;
    if (_consulta.length > 1) {
      buscarEntidades({
        pk_nombre_entidad: _consulta,
        pk_is_transportadora: is_transport,
        limit: 5,
      })
        .then((res) => {
          if (Array.isArray(res?.obj?.results)) {
            setFoundEntities(res?.obj?.results);
            if (res?.obj?.results?.length === 0) {
              notifyError("No se encontradon datos de entidades");
            }
            return;
          }
          throw new Error("Objeto recibido erroneo");
        })
        .catch((error) => {
          if (error?.cause === "custom") {
            notifyError(error?.message);
            return;
          }
          console.error(error?.message);
          notifyError("Busqueda fallida");
        });
    }
  }, []);

  const uploadComprobante = useCallback(async () => {
    try {
      if (!selectedEntity) {
        throw new Error("No se ha seleccionado una entidad", {
          cause: "custom",
        });
      }

      if (!file) {
        throw new Error("No se ha seleccionado un archivo", {
          cause: "custom",
        });
      }

      /**
       * Pedir url prefirmada
       */
      const resFile = await subirComprobante({
        filename: `/comprobantes/${roleInfo?.id_comercio};${
          roleInfo?.id_comercio
        }_${roleInfo?.id_usuario}_${roleInfo?.id_dispositivo}_comprobante.${
          file?.name?.split(/\./)?.[1]
        }`,
        contentType: file?.type,
      });

      /**
       * Armar peticion para subir a s3
       */
      const { /* url, */ fields } = resFile.obj;
      const filename = fields.key;
      const formData = new FormData();
      for (var key in fields) {
        formData.append(key, fields[key]);
      }
      formData.set("file", file);
      // const resUploadFile = await fetch(url, {
      //   method: "POST",
      //   body: formData,
      // });
      
      // console.log(resFile);
      // console.log(resUploadFile);

      /**
       * Subir informaacion a db
       */
      /* const resComprobante =  */await agregarComprobante({
        fk_nombre_entidad: selectedEntity,
        fk_tipo_comprobante: movementType,
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_dispositivo: roleInfo?.id_dispositivo,
        nro_cuenta: accountNumber,
        nro_comprobante: comprobanteNumber,
        valor_movimiento: valorComprobante,
        observaciones: observaciones,
        archivo: filename,
      });

      // console.log(resComprobante);
    } catch (error) {
      throw error;
    }
  }, [
    file,
    movementType,
    selectedEntity,
    roleInfo?.id_comercio,
    roleInfo?.id_usuario,
    roleInfo?.id_dispositivo,
    accountNumber,
    comprobanteNumber,
    valorComprobante,
    observaciones,
  ]);

  const onFileChange = useCallback((files) => {
    const _files = Array.from(files);
    if (_files.length > 0) {
      setFile(_files[0]);
    }
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      notifyPending(
        uploadComprobante(),
        {
          render: () => {
            return "Procesando peticion";
          },
        },
        {
          render: () => {
            navigate("/gestion/arqueo");
            return "Comprobante subido exitosamente";
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
    [uploadComprobante, navigate]
  );

  useEffect(() => {
    buscarTiposComprobantes()
      .then((res) => {
        setTiposComprobantes(
          (res?.obj ?? []).map(
            ({ nombre_comprobante }) => ({
              value: nombre_comprobante,
              label: nombre_comprobante,
            })
          )
        );
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          return err?.message;
        }
        console.error(err?.message);
        return "Peticion fallida";
      });
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Transportadora y Consignaciones</h1>
      <Form onSubmit={onSubmit} grid>
        <Select
          id="searchByType"
          name="tipoComp"
          label="Tipo de movimiento"
          options={[{ value: "", label: "" }, ...tiposComprobantes]}
          onChange={(e) => {
            const val = e.target.value ?? "";
            setMovementType(val);
            if (val === "") {
              setSelectedEntity(null);
            }
          }}
        />
        <ButtonBar />
        {Boolean(movementType) && (
          <Fieldset
            legend={"Informacion del movimiento"}
            className="lg:col-span-2"
          >
            {Object.entries(staticInfo).map(([key, val]) => (
              <Input
                key={key}
                id={key}
                label={key}
                type="text"
                value={val}
                disabled
              />
            ))}
            <InputSuggestions
              id={"searchEntities"}
              label={`Buscar ${
                movementType === "Consignación Bancaría" ? "bancos" : "transportadoras"
              }`}
              type={"search"}
              autoComplete="off"
              suggestions={(foundEntities ?? []).map(
                ({ pk_nombre_entidad, parametros }) => (
                  <div
                    className="grid grid-cols-1 place-items-center px-4 py-2"
                    onClick={() => {
                      setSelectedEntity(pk_nombre_entidad);
                      setSearchQuery(pk_nombre_entidad);
                      setLimitesMontos((old) => ({
                        min: parametros?.monto_minimo ?? old.min,
                        max: parametros?.monto_maximo ?? old.max,
                      }));
                    }}
                  >
                    <h1 className="text-base">{pk_nombre_entidad}</h1>
                  </div>
                )
              )}
              value={searchQuery}
              onInput={(ev) => {
                setSearchQuery(ev.target.value);
                setSelectedEntity(null);
              }}
              onLazyInput={{
                callback: (ev) => searchEntities(ev, movementType !== "Consignación Bancaría"),
                timeOut: 500,
              }}
            />
            {movementType === "Consignación Bancaría" && (
              <Input
                id="accountNum"
                name="accountNum"
                label="Número de cuenta"
                type="tel"
                autoComplete="off"
                minLength={"19"}
                maxLength={"19"}
                onInput={(ev) => setAccountNumber(onChangeAccountNumber(ev))}
                required
              />
            )}
            <Input
              id="comprobanteNum"
              name="comprobanteNum"
              label="Número de comprobante"
              type="tel"
              autoComplete="off"
              minLength={"19"}
              maxLength={"19"}
              onInput={(ev) => setComprobanteNumber(onChangeAccountNumber(ev))}
              required
            />
            <Input
              id="valor"
              name="valor"
              label={`Valor ${movementType.split(/\s/)[0].toLowerCase()}`}
              autoComplete="off"
              type="tel"
              minLength={"5"}
              maxLength={"13"}
              onInput={(ev) => setValorComprobante(onChangeMoney(ev))}
              required
            />
            <TextArea
              id="observaciones"
              name="observaciones"
              label="Observaciones"
              className="w-full place-self-stretch"
              autoComplete="off"
              maxLength={"60"}
              onInput={(e) => {
                setObservaciones(e.target.value.trimLeft());
                e.target.value = e.target.value.trimLeft();
              }}
              info={`Maximo 60 caracteres`}
              required
            />
            <FileInput
              label={"Elegir archivo (comprobante)"}
              onGetFile={onFileChange}
              name="file"
              accept=".png,.jpg,.jpeg"
              allowDrop={true}
            />
            <TextArea
              id="tempInput"
              label="Nombre del archivo selecionado"
              className="w-full place-self-stretch"
              value={file?.name ?? ""}
              disabled
            />
            <ButtonBar className="lg:col-span-2">
              <Button type="submit" className="text-center">
                Realizar movimiento
              </Button>
            </ButtonBar>
          </Fieldset>
        )}
      </Form>
    </Fragment>
  );
};

export default CargaComprobante;
