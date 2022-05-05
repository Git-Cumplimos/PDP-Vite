import React, { useCallback, useState } from "react";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Button from "../../../components/Base/Button";

import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import FileInput from "../../../components/Base/FileInput";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
const PpsObligatorio = ({ datosConsulta }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  const [idComercio, setIdComercio] = useState("");
  const [numPagosPdp, setNumPagosPdp] = useState("");
  const [estado, setEstado] = useState(true);
  const [valorAportar, setValorAportar] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [archivos1, setArchivos1] = useState([]);
  console.log(datosConsulta);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const enviar = () => {
    console.log("hola obligatorio");
  };
  const agregarSoporte = () => {
    console.log("agregarSoporte");
  };

  //------------------Guardar Archivos PDF---------------------//
  const onFileChange = useCallback((files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      setArchivos1(files);
    }
  }, []);
  return (
    <div>
      {" "}
      {showModal ? (
        <Modal show={showModal} handleClose={handleClose}>
          <LogoPDP small></LogoPDP>
          <Fieldset
            legend="Formulario Aporte Obligatorio"
            /* className="lg:col-span-3" */
          >
            <Select
              onChange={(event) => setTipoIdentificacion(event?.target?.value)}
              id="comissionType"
              label="Tipo de Identificación"
              options={{
                "": "",
                "C.C Cedula de Ciudadania": "CC",
                "C.E Cedula de Extranjeria": "CE",
              }}
            ></Select>
            <Input
              label={"N° Documento"}
              placeholder={"Ingrese su Numero Documento"}
              value={numDocumento}
              onChange={(e) => setNumDocumento(e.target.value)}
              type={"number"}
              disable
            ></Input>
            <Input
              label={"Id Comercio"}
              placeholder="Ingrese Id Comercio"
              value={idComercio}
              onChange={(e) => setIdComercio(e.target.value)}
              type={"number"}
            ></Input>
            <Select
              onChange={(event) => setNumPagosPdp(event?.target?.value)}
              id="comissionType"
              label="N° Pagos Punto Pago"
              options={{
                "": "",
                1: "1",
                2: "2",
                3: "3",
              }}
            ></Select>
          </Fieldset>
          <FileInput
            className="lg:col-span-2"
            label={"Subir archivo Soporte de Aceptación"}
            onGetFile={onFileChange}
            accept=".pdf"
            allowDrop={false}
            /* required */
          />
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" onClick={() => enviar()}>
                Enviar Formulario
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default PpsObligatorio;
