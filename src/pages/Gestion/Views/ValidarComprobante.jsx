import React from "react";

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

const mock = {
  Banco: "Davivienda",
  Cuenta: "123456789012345",
  No_Consignacion: "1",
  Valor: "1000000",
  Fecha: "04/03/2022",
  Estado: "Pendiente",
};

const ValidarComprobante = ({ data, setShowModal }) => {
  console.log(data.url);
  const saveFile = () => {
    saveAs(data.url);
  };
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-xl">Validación de comprobante</h1>
      </div>
      <Form Grid>
        {[data].map((row) => {
          return (
            <>
              <Input label="Banco" value={row.autorizador} disabled></Input>
              <Input label="Cuenta" value={row.no_cuenta} disabled></Input>
              <Input
                label="# Consignación"
                value={row.no_consignacion}
                disabled
              ></Input>
              <MoneyInput label="Valor" value={row.valor} disabled></MoneyInput>
              <Input label="Fecha" value={row.fecha_ingreso} disabled></Input>
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
                }}
              />
              <Magnifier src={row.url} zoomFactor={2} />
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
        ></TextArea>
        <ButtonBar>
          <Button type="submit">Guardar</Button>
          <Button type="button" onClick={() => setShowModal(false)}>
            Salir
          </Button>
        </ButtonBar>
      </Form>
    </>
  );
};

export default ValidarComprobante;
