import { useState } from "react";

import Magnifier from "react-magnifier";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import TextArea from "../../../components/Base/TextArea";
import Select from "../../../components/Base/Select";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { saveAs } from "file-saver";
import PanelConsignaciones from "./PanelConsignaciones";
import { updateReceipts } from "../utils/fetchCaja";
import { notify, notifyError } from "../../../utils/notify";

const ValidarComprobante = ({ data, setShowModal }) => {
  const [status, setStatus] = useState("");
  const [observation, setObservation] = useState("");
  const updateReceipt = () => {
    const query = { id_comprobante: data?.id_comprobante };
    const body = { obs_analista: observation, status: status };
    updateReceipts(query, body)
      .then((res) => {
        notify(res?.msg);
        setShowModal(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const saveFile = () => {
    saveAs(data?.archivo);
  };
  console.log(data);
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-xl">Validación de comprobante</h1>
      </div>
      <Form Grid>
        {[data].map((row) => {
          return (
            <>
              <Input label="Banco" value={row?.compañia} disabled></Input>
              <Input label="Cuenta" value={row?.cuenta} disabled></Input>
              <Input
                label="# Consignación"
                value={row.nro_comprobante}
                disabled
              ></Input>
              <MoneyInput
                label="Valor"
                value={row?.valor}
                disabled
              ></MoneyInput>
              <Input label="Fecha" value={row?.created} disabled></Input>
              <Select
                id="searchByAgreement"
                label="Estado"
                options={[
                  { value: 0, label: "" },
                  { value: 1, label: "RECHAZADO" },
                  { value: 2, label: "APROBADO" },
                ]}
                onChange={(e) => {
                  console.log(e.target.value);
                  if (e.target.value === "1") {
                    setStatus("RECHAZADO");
                  } else if (e.target.value === "2") {
                    setStatus("APROBADO");
                  }
                }}
              />
              <Magnifier src={row?.archivo} zoomFactor={2} />
            </>
          );
        })}

        <Button type="button" onClick={saveFile}>
          Descargar imagen
        </Button>
        <TextArea
          id="obs"
          label="Observación"
          type="input"
          minLength="1"
          maxLength="160"
          autoComplete="off"
          onChange={(e) => {
            setObservation(e.target.value);
          }}
        ></TextArea>
        <ButtonBar>
          <Button type="button" onClick={() => updateReceipt()}>
            Guardar
          </Button>
          <Button type="button" onClick={() => setShowModal(false)}>
            Salir
          </Button>
        </ButtonBar>
      </Form>
    </>
  );
};

export default ValidarComprobante;
