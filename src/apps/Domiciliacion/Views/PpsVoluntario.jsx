import React, { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";

import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import fetchData from "../../../utils/fetchData";
import { notifyError } from "../../../utils/notify";

const PpsVoluntario = () => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  const [idComercio, setIdComercio] = useState("");
  const [numCelular, setNumCelular] = useState("");
  const [estado, setEstado] = useState(true);
  const [valorAportar, setValorAportar] = useState();
  const [numPagosPdp, setNumPagosPdp] = useState("");
  const [showModal, setShowModal] = useState(true);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const url = "http://127.0.0.1:7000";
  //------------------Funcion Para Subir El Formulario---------------------//
  const enviar = (e) => {
    e.preventDefault();
    fetchData(
      `${url}/domicilio`,
      "POST",
      {},
      {
        tipo_id: "cc",
        identificacion: numDocumento,
        financial_institution_code: "96",
        canal_code: "20",
        operador_code: "84",
        trazability_financial_institution_code: "1",
        value_amount: valorAportar,
        celular: numCelular,
        id_comercio: idComercio,
        estado: "activo",
        tipo_pps: "voluntario",
        num_pago_pdp: numPagosPdp,
      },
      {},
      {}
    )
      .then((respuesta) => {
        console.log(respuesta);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al subir Formulario");
      });
  };
  return (
    <div>
      {showModal ? (
        <Modal show={showModal} handleClose={handleClose}>
          <LogoPDP small></LogoPDP>
          <Fieldset
            legend="Formulario Aporte Voluntario"
            /* className="lg:col-span-3" */
          >
            <Select
              onChange={(event) => setTipoIdentificacion(event?.target?.value)}
              id="comissionType"
              label="Tipo de Identificación"
              options={{
                "": "",
                "C.C Cedula de Ciudadania": "cc",
                "C.E Cedula de Extranjeria": "ce",
              }}
            ></Select>
            <Input
              label={"N° Documento"}
              placeholder={"Ingrese su Numero Documento"}
              value={numDocumento}
              onChange={(e) => setNumDocumento(e.target.value)}
              type={"number"}
            ></Input>
            <Input
              label={"Id Comercio"}
              placeholder="Ingrese Id Comercio"
              value={idComercio}
              onChange={(e) => setIdComercio(e.target.value)}
              type={"number"}
            ></Input>
            <Input
              label={"N° Celular"}
              placeholder={"Ingrese su Numero Celular"}
              value={numCelular}
              onChange={(e) => setNumCelular(e.target.value)}
              type={"number"}
            ></Input>
            <Input
              label={"Valor Aportar"}
              placeholder={"Ingrese Valor Aportar"}
              value={valorAportar}
              onChange={(e) => setValorAportar(e.target.value)}
              type={"number"}
            ></Input>
            <Select
              onChange={(event) => setNumPagosPdp(event?.target?.value)}
              id="comissionType"
              label="N° Pagos Punto Pago"
              options={{
                0: 0,
                1: 1,
                2: 2,
                3: 3,
              }}
            ></Select>
          </Fieldset>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" onClick={(e) => enviar(e)}>
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

export default PpsVoluntario;
