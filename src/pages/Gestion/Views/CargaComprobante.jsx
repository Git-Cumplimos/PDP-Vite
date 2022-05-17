import { useState, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../../../components/Base/Form";
import MoneyInput from "../../../components/Base/MoneyInput";
import Select from "../../../components/Base/Select";
import FileInput from "../../../components/Base/FileInput";
import Input from "../../../components/Base/Input";
import TextArea from "../../../components/Base/TextArea";
import Button from "../../../components/Base/Button";
import { notify, notifyError } from "../../../utils/notify";
import { createUrlFile, registerReceipt } from "../utils/fetchCaja";
import useForm from "../../../hooks/useForm";
import { useAuth } from "../../../hooks/AuthHooks";

const CargaComprobante = () => {
  const [label, setLabel] = useState(" ");
  const [tipoCons, setTipoCons] = useState("");
  const [attributes, setAttributes] = useState(false);
  const [number, setNumber] = useState("");
  const [file, setFile] = useState([]);
  const [data, handleChange] = useForm({
    transport: "",
    bank: "",
    account: "",
    nro: "",
    valor: "",
    obs: "",
  });

  const navigate = useNavigate();

  const { roleInfo } = useAuth();

  const onFileChange = useCallback((files) => {
    files = Array.from(files);
    setFile(files);
  });

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setAttributes(false);
    const formData = new FormData();
    if (file?.length > 0) {
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
            });
        })
        .catch((err) => {
          throw err;
        });
      const regex = /(\d+)/g;
      const comma = /(\,+)/g;
      if (tipoCons > 1) {
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
        };
        console.log(body, roleInfo);
        registerReceipt(body)
          .then((res) => {
            console.log(res);
            navigate("/gestion/");
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
          nro_comprobante: number,
        };
        console.log(body, roleInfo);
        registerReceipt(body)
          .then((res) => {
            console.log(res);
            navigate("/gestion/");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      notifyError("Por favor adjunte un archivo");
    }
    handleChange();
  });

  return (
    <div className="flex items-center mx-auto">
      <Form onSubmit={onSubmit} grid>
        <Select
          id="searchByType"
          name="tipoComp"
          label="Tipo"
          options={[
            { value: 0, label: "" },
            { value: 1, label: "Consignación bancaria" },
            { value: 2, label: "Entrega transportadora" },
            { value: 3, label: "Recibido transportadora" },
          ]}
          onChange={(e) => {
            handleChange(e);
            console.log(e.target.value);
            setTipoCons(e.target.value);
            if (e.target.value === "1") {
              setLabel("Valor consignado");
              setAttributes(true);
            }
            if (e.target.value === "2") {
              setLabel("Valor entregado");
              setAttributes(true);
            }
            if (e.target.value === "0") {
              setLabel("");
              setAttributes(false);
            }
          }}
        />
        {attributes && (
          <div>
            {tipoCons == 2 || tipoCons == 3 ? (
              <Select
                id="searchByTransport"
                name="transport"
                label="Transportadora"
                options={[
                  {
                    value: 0,
                    label: "",
                  },
                  { value: 1, label: "Prueba transportadora" },
                ]}
                onChange={(e) => {
                  handleChange(e);
                  console.log(e.target.value);
                }}
              />
            ) : (
              <>
                <Select
                  id="searchByAccount"
                  name="bank"
                  label="Banco"
                  options={[
                    {
                      value: 0,
                      label: "",
                    },
                    { value: 1, label: "Prueba bancos NOMBRE LARGO" },
                  ]}
                  onChange={(e) => {
                    handleChange(e);
                    console.log(e.target.value);
                  }}
                />
                <Select
                  id="searchByAccountId"
                  name="account"
                  label="Cuenta bancaria"
                  options={[
                    {
                      value: 0,
                      label: "",
                    },
                    { value: 1, label: "CTA CORRIENTE-123456789" },
                    { value: 2, label: "CTA AHORROS-123456789" },
                  ]}
                  onChange={(e) => {
                    handleChange(e);
                    console.log(e.target.value);
                  }}
                />
                <Input
                  id="nroComp"
                  name="nro"
                  label="Número comprobante"
                  type="text"
                  autoComplete="off"
                  value={number}
                  onInput={(e) => {
                    if (!isNaN(e.target.value)) {
                      const num = e.target.value;
                      setNumber(num);
                    }
                  }}
                ></Input>
              </>
            )}
            <MoneyInput
              id="valorCons"
              name="valor"
              onChange={handleChange}
              label={label}
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
              label={"Elegir archivo"}
              onGetFile={onFileChange}
              name="file"
              accept=".png,.jpg,.jpeg"
              allowDrop={true}
            />
            {file && <h6 className="text-center">Nombre: {file?.[0]?.name}</h6>}
            <Button type="submit">Subir archivos</Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default CargaComprobante;
