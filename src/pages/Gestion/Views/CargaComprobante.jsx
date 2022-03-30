import React, { useState } from "react";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import Select from "../../../components/Base/Select";
import FileInput from "../../../components/Base/FileInput";
import TextArea from "../../../components/Base/TextArea";

const CargaComprobante = () => {
  const [label, setLabel] = useState(" ");
  const [tipoCons, setTipoCons] = useState("");
  const [attributes, setAttributes] = useState(false);
  console.log(tipoCons, label, attributes);
  return (
    <>
      <div className="flex flex-col justify-center items-center mx-auto container">
        <Form grid>
          <Select
            id="searchByTrx"
            label="Tipo"
            options={[
              { value: 0, label: "" },
              { value: 1, label: "Consignación bancaria" },
              { value: 2, label: "Entrega transportadora" },
            ]}
            onChange={(e) => {
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
            <>
              <Select
                id="searchByAccount"
                label="Autorizador"
                options={[{ value: 0, label: "" }]}
                onChange={(e) => {
                  console.log(e.target.value);
                }}
              />
              <Select
                id="searchByAgreement"
                label="Cuenta"
                options={[{ value: 0, label: "" }]}
                onChange={(e) => {
                  console.log(e.target.value);
                }}
              />

              <MoneyInput id="valorCons" label={label}></MoneyInput>
              <TextArea
                id="obs"
                label="Observación"
                type="input"
                minLength="1"
                maxLength="160"
                autoComplete="off"
              ></TextArea>
              <FileInput
                label={"Elegir archivo"}
                accept=".png,.jpg,.jpeg"
                allowDrop={false}
              />
            </>
          )}
        </Form>
      </div>
    </>
  );
};

export default CargaComprobante;
