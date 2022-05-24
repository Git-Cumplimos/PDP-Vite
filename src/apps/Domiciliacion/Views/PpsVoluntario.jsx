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
import { notify, notifyError } from "../../../utils/notify";
import { useNavigate } from "react-router-dom";

const PpsVoluntario = ({ datosConsulta }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState("");
  const [idComercio, setIdComercio] = useState(datosConsulta?.id_comercio);
  const [idusuario, setIdUsuario] = useState(datosConsulta?.id_usuario);
  const [iddispositivo, setIddispositivo] = useState(
    datosConsulta?.id_dispositivo
  );
  const [numCelular, setNumCelular] = useState("");
  const [estado, setEstado] = useState(true);
  const [valorAportar, setValorAportar] = useState();
  const [numPagosPdp, setNumPagosPdp] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const url = process.env.REACT_APP_URL_TRXS_TRX;
  //------------------Funcion Para Subir El Formulario---------------------//
  const enviar = (e) => {
    e.preventDefault();
    fetchData(
      `${url}/domicilio`,
      "POST",
      {},
      {
        tipo_id: tipoIdentificacion,
        identificacion: numDocumento,
        financial_institution_code: "96",
        canal_code: "20",
        operador_code: "84",
        trazability_financial_institution_code: "1",
        value_amount: valorAportar,
        celular: numCelular,
        id_comercio: idComercio,
        id_dispositivo: iddispositivo,
        id_usuario: idusuario,
        estado: "activo",
        estado_pago: "",
        tipo_pps: "voluntario",
        num_pago_pdp: numPagosPdp,
      },
      {},
      {}
    )
      .then((respuesta) => {
        console.log(respuesta);
        if (
          respuesta?.msg ==
          "Exception: No fue posible hacer una conexion a la base de datos"
        ) {
          notifyError("No fue posible hacer una conexion a la base de datos");
        }
        if (
          respuesta?.msg ==
          "SchemaError: Key 'num_pago_pdp' error:\nint('') raised ValueError(\"invalid literal for int() with base 10: ''\")"
        ) {
          notifyError("Selecciones un Numero de Pagos");
        } else {
          if (
            respuesta?.msg ==
            "Se ha creado el comercio domiciliado voluntario exitosamente"
          ) {
            notify(
              "Se ha creado el comercio domiciliado voluntario exitosamente"
            );
          }
        }
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al subir Formulario");
      });
    setShowModal(false);
    navigate(`/domiciliacion`);
  };
  return (
    <div>
      {showModal && datosConsulta ? (
        <Modal show={showModal} handleClose={handleClose}>
          <LogoPDP small></LogoPDP>
          <Form onSubmit={(e) => enviar(e)}>
            <Fieldset
              legend="Formulario Aporte Voluntario"
              /* className="lg:col-span-3" */
            >
              <Select
                onChange={(event) =>
                  setTipoIdentificacion(event?.target?.value)
                }
                id="comissionType"
                label="Tipo de Identificación"
                options={{
                  "": "",
                  "C.C Cedula de Ciudadania": "1",
                  "C.E Cedula de Extranjeria": "2",
                }}
                required
              ></Select>
              <Input
                label={"N° Documento"}
                placeholder={"Ingrese su Numero Documento"}
                value={numDocumento}
                minLength="6"
                maxLength="11"
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  setNumDocumento(num.toString());
                }}
                type={"text"}
                required
              ></Input>
              <Input
                label={"Id Comercio"}
                placeholder="Ingrese Id Comercio"
                value={idComercio}
                onChange={(e) => setIdComercio(e.target.value)}
                type={"number"}
                disabled
              ></Input>
              <Input
                label={"Id Dispositivo"}
                placeholder="Ingrese Id Dispositivo"
                value={iddispositivo}
                onChange={(e) => setIddispositivo(e.target.value)}
                type={"number"}
                disabled
              ></Input>
              <Input
                label={"N° Celular"}
                placeholder={"Ingrese su Numero Celular"}
                value={numCelular}
                /* onChange={(e) => setNumCelular(e.target.value)} */
                /* onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  setNumCelular(num);
                }} */
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";

                  if (parseInt(String(num)[0]) == 3) {
                    const num = parseInt(e.target.value) || "";
                    setNumCelular(num);
                  } else {
                    if (parseInt(String(num)[0]) != 3) {
                      notifyError("El Primer Digito debe ser 3");
                    }
                  }
                }}
                minLength="10"
                maxLength="10"
                type={"text"}
                required
              ></Input>
              <Input
                label={"Valor Aportar"}
                placeholder={"Ingrese Valor Aportar"}
                value={valorAportar}
                minLength="4"
                maxLength="6"
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  setValorAportar(num);
                }}
                type={"text"}
                required
              ></Input>
              <Select
                onChange={(event) => setNumPagosPdp(event?.target?.value)}
                id="comissionType"
                label="N° Pagos Punto Pago"
                value={numPagosPdp}
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
                <Button type="submit" /* onClick={(e) => enviar(e)} */>
                  Enviar Formulario
                </Button>
                /*  ) : null */
              }
            </ButtonBar>
          </Form>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default PpsVoluntario;
