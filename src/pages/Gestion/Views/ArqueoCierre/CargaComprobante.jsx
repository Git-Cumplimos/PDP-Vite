import { useState, useCallback, useEffect, Fragment } from "react";
//import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import FileInput from "../../../../components/Base/FileInput";
import TextArea from "../../../../components/Base/TextArea";
import Button from "../../../../components/Base/Button";
import { notify, notifyError } from "../../../../utils/notify";
import {
  createUrlFile,
  registerReceipt,
  buscarCompañias,
} from "../../utils/fetchCaja";
import useForm from "../../../../hooks/useForm";
import { useAuth } from "../../../../hooks/AuthHooks";
import ButtonBar from "../../../../components/Base/ButtonBar";

const CargaComprobante = () => {
  const [label, setLabel] = useState(" ");
  const [tipoCons, setTipoCons] = useState("");
  const [attributes, setAttributes] = useState(false);
  const [transportadora, setTransportadora] = useState([]);
  const [file, setFile] = useState([]);
  const [data, handleChange] = useForm({
    transport: "",
    bank: "",
    account: "",
    nro: "",
    valor: "",
    obs: "",
  });

  //const navigate = useNavigate();

  const { roleInfo } = useAuth();

  const onFileChange = useCallback((files) => {
    files = Array.from(files);
    setFile(files);
  }, []);

  useEffect(() => {
    const number = tipoCons === "2" || tipoCons === "3" ? 2 : 0;
    const queries = { tipo: number };
    buscarCompañias(queries)
      .then((res) => {
        setTransportadora(res?.obj?.results);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [tipoCons]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const formData = new FormData();
      if (file?.length > 0) {
        if (data?.valor?.length > 2) {
          const query = {
            filename: file?.[0]?.name,
            contentType: file?.[0]?.type,
            location: tipoCons,
          };
          createUrlFile(query)
            .then((res) => {
              console.log(res);
              for (const key in res?.obj?.fields) {
                formData.set(`${key}`, `${res?.obj?.fields[key]}`);
              }
              formData.set("file", file[0]);
              fetch(`${res?.obj?.url}`, { method: "POST", body: formData })
                .then((res) => {})
                .catch((err) => {
                  setFile([]);
                  setAttributes(false);
                });
              const regex = /(\d+)/g;
              const comma = /(,+)/g;
              if (tipoCons > 1) {
                let body = {
                  id_comercio: roleInfo?.id_comercio,
                  id_usuario: roleInfo?.id_usuario,
                  id_terminal: roleInfo?.id_dispositivo,
                  valor: parseInt(
                    String(data?.valor?.match(regex))?.replace(comma, "")
                  ),
                  archivo: formData.get("key"),
                  obs_cajero: data?.obs,
                  compañia: data?.transport,
                  status: "PENDIENTE",
                };
                registerReceipt(body)
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                let body = {
                  id_comercio: roleInfo?.id_comercio,
                  id_usuario: roleInfo?.id_usuario,
                  id_terminal: roleInfo?.id_dispositivo,
                  valor: parseInt(
                    String(data?.valor?.match(regex))?.replace(comma, "")
                  ),
                  archivo: file?.[0]?.name,
                  obs_cajero: data?.obs,
                  compañia: data?.transport,
                  cuenta: data?.account,
                  nro_comprobante: "",
                };
                console.log(body, roleInfo);
                registerReceipt(body)
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            })
            .catch((err) => {
              throw err;
            });
        } else {
          notify("Reporte un valor para poder continuar");
        }
      } else {
        notifyError("Por favor adjunte un archivo");
      }
      handleChange();
    },
    [
      data?.account,
      data?.obs,
      data?.transport,
      data?.valor,
      file,
      handleChange,
      roleInfo,
      tipoCons,
    ]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Transportadora y Consignaciones</h1>
      <Form onSubmit={onSubmit} grid>
        <Select
          id="searchByType"
          name="tipoComp"
          label="Tipo"
          options={[
            { value: 0, label: "" },
            { value: 1, label: "Consignación bancaria" },
            { value: 1, label: "Entrega transportadora" },
            { value: 1, label: "Recibido transportadora" },
          ]}
          onChange={(e) => {
            handleChange(e);
            setTipoCons(e.target.value);
            if (e.target.value === "1") {
              setLabel("Valor consignado");
              setAttributes(true);
            }
            if (e.target.value === "2") {
              setLabel("Valor entregado");
              setAttributes(true);
            }
            if (e.target.value === "3") {
              setLabel("Valor recibido");
              setAttributes(true);
            }
          }}
        />
        {attributes ? (
          <div>
            {tipoCons === "2" || tipoCons === "3" ? (
              <Select
                id="searchByTransport"
                name="transport"
                label="Transportadora"
                options={[
                  { value: "", label: "" },
                  ...(transportadora?.map(({ nombre_compañia }) => {
                    const name = nombre_compañia ? nombre_compañia : "";
                    return {
                      value: `${name}`,
                      label: `${name}`,
                    };
                  }) ?? []),
                ]}
                onChange={(e) => {
                  handleChange(e);
                  console.log(e.target.value);
                }}
                required
              />
            ) : (
              tipoCons === "1" && <></>
            )}
            {tipoCons !== "1" ? (
              <Fragment>
                <MoneyInput
                  id="valorCons"
                  name="valor"
                  onChange={handleChange}
                  label={label}
                  required
                ></MoneyInput>
                <TextArea
                  id="obsCashier"
                  name="obs"
                  label="Observación"
                  type="input"
                  minLength="1"
                  maxLength="160"
                  autoComplete="off"
                  onInput={handleChange}
                ></TextArea>
                <FileInput
                  label={"Elegir archivo plataforma"}
                  onGetFile={onFileChange}
                  name="file"
                  accept=".png,.jpg,.jpeg"
                  allowDrop={true}
                />
                {file.length > 0 && (
                  <>
                    <h6 className="text-center">Nombre: {file?.[0]?.name}</h6>
                    <Button type="submit" className="text-center">
                      Subir archivo para revisión
                    </Button>
                  </>
                )}
              </Fragment>
            ) : (
              <h1 className="text-center">Sin acceso</h1>
            )}
          </div>
        ) : (
          <ButtonBar />
        )}
      </Form>
    </Fragment>

  );
};

export default CargaComprobante;
