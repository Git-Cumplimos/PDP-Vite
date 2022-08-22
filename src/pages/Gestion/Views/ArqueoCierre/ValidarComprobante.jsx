import { Fragment, useState } from "react";

import Magnifier from "react-magnifier";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import MoneyInput from "../../../../components/Base/MoneyInput";
import TextArea from "../../../../components/Base/TextArea";
import Select from "../../../../components/Base/Select";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
// import { saveAs } from "file-saver";
import { updateReceipts } from "../../utils/fetchCaja";
import { notify } from "../../../../utils/notify";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

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

  console.log(data);

  return (
    <Fragment>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-2xl font-semibold">Validación de comprobante</h1>
      </div>
      <Form Grid>
        {[data].map((row) => {
          const tempDate = new Date(row?.created);
          tempDate.setHours(tempDate.getHours() + 5);
          const fechaHora = dateFormatter.format(tempDate);
          return (
            <Fragment>
              <Input label="Empresa" value={row?.compañia} disabled />
              <Input label="Cuenta" value={row?.cuenta} disabled />
              <Input
                label="# Consignación"
                value={row.nro_comprobante}
                disabled
              />
              <MoneyInput label="Valor" value={row?.valor} disabled />
              <Input label="Fecha" value={fechaHora} disabled />
              {data?.status === "PENDIENTE" ? (
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
              ) : (
                ""
              )}
              <div className="my-4 mx-auto md:mx-4 gap-4">
                <Magnifier src={row?.archivo} zoomFactor={2} />
              </div>
            </Fragment>
          );
        })}

        <a href={data?.archivo} target="_blank" rel="noopener noreferrer">
          <Button type="button">Descargar imagen</Button>
        </a>
        {data?.status === "PENDIENTE" ? (
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
        ) : (
          ""
        )}
        <ButtonBar>
          {data?.status === "PENDIENTE" ? (
            <Button type="button" onClick={() => updateReceipt()}>
              Guardar
            </Button>
          ) : (
            ""
          )}
          <Button type="button" onClick={() => setShowModal(false)}>
            Salir
          </Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default ValidarComprobante;
