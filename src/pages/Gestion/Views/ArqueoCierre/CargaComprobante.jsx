import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Fragment,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Select from "../../../../components/Base/Select";
import FileInput from "../../../../components/Base/FileInput";
import Fieldset from "../../../../components/Base/Fieldset";
import TextArea from "../../../../components/Base/TextArea";
import Button from "../../../../components/Base/Button";
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
import Magnifier from "react-magnifier";

const CargaComprobante = () => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  const formRef = useRef(null);

  const [tiposComprobantes, setTiposComprobantes] = useState([]);

  const [movementType, setMovementType] = useState("");
  const [foundEntities, setFoundEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [EntityIndex, setEntityIndex] = useState([]);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [comprobanteNumber, setComprobanteNumber] = useState("");
  const [valorComprobante, setValorComprobante] = useState(0.0);
  const [observaciones, setObservaciones] = useState("");
  const [limitesMontos, setLimitesMontos] = useState({
    max: 100000000,
    min: 5000,
  });

  const onChangeMoney = useMoney({
    limits: [limitesMontos.min, limitesMontos.max],
  });

  const staticInfo = useMemo(
    () => ({
      "Id comercio": roleInfo?.id_comercio ?? 59,
      "Id usuario": roleInfo?.id_usuario ?? 8202,
    }),
    [roleInfo?.id_comercio, roleInfo?.id_usuario]
  );

  const searchEntities = useCallback((is_transport) => {
    buscarEntidades({
      pk_is_transportadora: is_transport,
      limit: 50,
    })
      .then((res) => {
        if (Array.isArray(res?.obj?.results)) {
          for (const element of res?.obj?.results) {
            if (element.pk_numero_cuenta !== null) {
              let NumCuentas = element.pk_numero_cuenta.pk_numero_cuenta1===undefined?[]:[element.pk_numero_cuenta.pk_numero_cuenta1]
              if(element.pk_numero_cuenta.pk_numero_cuenta2 !== undefined)
                NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta2)
              if(element.pk_numero_cuenta.pk_numero_cuenta3 !== undefined)
                NumCuentas.push(element.pk_numero_cuenta.pk_numero_cuenta3)
              element.pk_numero_cuenta=NumCuentas
            }
          }
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
        filename: `comprobantes/${roleInfo?.id_comercio};${
          roleInfo?.id_comercio
        }_${roleInfo?.id_usuario}_${roleInfo?.id_dispositivo}_comprobante.${
          file?.name?.split(/\./)?.[1]
        }`,
        contentType: file?.type,
      });

      /**
       * Armar peticion para subir a s3
       */
      const { url, fields } = resFile.obj;
      const filename = fields.key;

      /**
       * Subir informaacion a db
       */
      const reqBody = {
        fk_nombre_entidad: selectedEntity,
        fk_tipo_comprobante: movementType,
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nro_comprobante: comprobanteNumber,
        valor_movimiento: valorComprobante,
        observaciones: observaciones,
        archivo: filename,
      };
      if (movementType === "Consignación Bancaria") {
        reqBody["nro_cuenta"] = accountNumber;
      }
      /* const resComprobante =  */ await agregarComprobante(reqBody);

      const formData = new FormData();
      for (var key in fields) {
        formData.append(key, fields[key]);
      }
      formData.set("file", file);
      const resUploadFile = await fetch(url, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      console.log(resFile);
      console.log(resUploadFile);
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
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(_files[0]);
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
          (res?.obj ?? []).map(({ nombre_comprobante }) => ({
            value: nombre_comprobante,
            label: nombre_comprobante,
          }))
        );
      })
      .catch((err) => {
        if (err?.cause === "custom") {
          notifyError(err?.message);
        }
        console.error(err?.message);
        notifyError("Peticion fallida");
      });
  }, []);

  return (
    <Fragment>
      <h1 className="text-3xl mt-10 mb-8">Transportadora y Consignaciones</h1>
      <Form grid>
        <Select
          id="searchByType"
          name="tipoComp"
          label="Tipo de movimiento"
          options={[{ value: "", label: "" }, ...tiposComprobantes]}
          onChange={(e) => {
            const val = e.target.value ?? "";
            formRef.current?.reset?.();
            setSelectedEntity(null);
            setMovementType(val);
            searchEntities(val !== "Consignación Bancaria");
          }}
        />
        <ButtonBar />
      </Form>
      {Boolean(movementType) && (
        <Form onSubmit={onSubmit} ref={formRef} grid>
          <Fieldset
            legend={"Información del movimiento"}
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
            <Select
              id="searchEntities"
              name="tipoComp"
              label={`Buscar ${
                movementType === "Consignación Bancaria"
                  ? "bancos"
                  : "transportadoras"
              }`}
              options={[
                { value: "", label: "" },
                ...foundEntities.map(({ pk_nombre_entidad }) => ({
                  value: pk_nombre_entidad,
                  label: pk_nombre_entidad,
                })),
              ]}
              value={selectedEntity}
              onChange={(e) => {
                const tempMap = new Map(
                  foundEntities.map(({ pk_nombre_entidad, parametros }) => [
                    pk_nombre_entidad,
                    parametros,
                  ])
                );
                if (foundEntities[e?.target?.selectedIndex-1]?.pk_numero_cuenta != null) {
                  setEntityIndex(foundEntities[e?.target?.selectedIndex-1]?.pk_numero_cuenta)
                }else{setEntityIndex([])}
                setSelectedEntity(e.target.value);
                setLimitesMontos((old) => ({
                  min: tempMap.get(e.target.value)?.monto_minimo ?? old.min,
                  max: tempMap.get(e.target.value)?.monto_maximo ?? old.max,
                }));
              }}
              required
            />
            {movementType === "Consignación Bancaria" && (
                <Select
                id="accountNum"
                name="accountNum"
                label="Número de cuenta"
                options={[
                  { value: "", label: "" },
                  ...EntityIndex.map((pk_numero_cuenta) => ({
                    value: pk_numero_cuenta,
                    label: pk_numero_cuenta,
                  })),
                ]}
                value={accountNumber}
                onChange={(ev) => {
                  setAccountNumber(ev.target.value)
                }}
                required
                type="tel"
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
              info={`Máximo 60 caracteres`}
              required
            />
            {!file ? (
              <FileInput
                label={"Elegir archivo (comprobante)"}
                onGetFile={onFileChange}
                name="file"
                accept=".png,.jpg,.jpeg"
                allowDrop={true}
              />
            ) : (
              <>
                <div className="text-center my-4 mx-auto md:mx-4 flex flex-row flex-wrap justify-around">
                  <div className="">
                    <div className="flex flex-row justify-center">
                      <h3 className="text-sm">{file?.name ?? ""}</h3>
                      <span
                        className="bi bi-x-lg text-2xl ml-5 self-center cursor-pointer"
                        onClick={() => setFile(null)}
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="text-2xl mt-2 mb-3">                            
                    {file && (
                      <div style={{ width: '30%', margin: '0 auto' }}>
                        <Magnifier src={image} zoomFactor={2} alt="Uploaded" style={{ width: '100%' }}/>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            <ButtonBar className="lg:col-span-2">
              <Button type="submit" className="text-center">
                Realizar movimiento
              </Button>
            </ButtonBar>
          </Fieldset>
        </Form>
      )}
    </Fragment>
  );
};

export default CargaComprobante;
