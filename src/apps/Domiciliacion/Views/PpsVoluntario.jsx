import React, { useCallback, useState, useEffect } from "react";
import Button from "../../../components/Base/Button";
import classes from "./PpsVoluntario.module.css";
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
import MoneyInput from "../../../components/Base/MoneyInput";

const PpsVoluntario = ({ datosConsulta }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState(null);

  const [idComercio, setIdComercio] = useState(datosConsulta?.id_comercio);
  const [idusuario, setIdUsuario] = useState(datosConsulta?.id_usuario);
  const [iddispositivo, setIddispositivo] = useState(
    datosConsulta?.id_dispositivo
  );
  const [numCelular, setNumCelular] = useState("");
  const [invalidCelular, setInvalidCelular] = useState("");
  const [datosBusqueda, setDatosBusqueda] = useState("");
  const [estado, setEstado] = useState(true);
  const [valorAportar, setValorAportar] = useState();
  const [numPagosPdp, setNumPagosPdp] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const { contenedorImagen } = classes;
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const url = process.env.REACT_APP_URL_COLPENSIONES;
  /*   const url = "http://127.0.0.1:7000"; */

  useEffect(() => {}, [numCelular]);
  useEffect(() => {
    buscarNumCedula(numDocumento);
  }, [numDocumento]);

  function buscarNumCedula(numero) {
    fetchData(
      `${url}/domicilio`,
      "GET",
      { identificacion: numDocumento },
      {},
      {},
      {}
    )
      .then((respuesta) => {
        console.log("r1", respuesta?.obj?.results.length);
        setDatosBusqueda(respuesta?.obj?.results);
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error al consultar identificación");
      });
  }

  //------------------Funcion Para Subir El Formulario---------------------//
  const enviar = (e) => {
    e.preventDefault();
    if (valorAportar >= 5000 && valorAportar <= 149000) {
      console.log("r2", datosBusqueda?.length);
      if (datosBusqueda?.length <= 0) {
        if (String(numCelular).charAt(0) === "3") {
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
              console.log("r3", respuesta);
              if (
                respuesta?.msg ==
                "Exception: No fue posible hacer una conexion a la base de datos"
              ) {
                notifyError(
                  "No fue posible hacer una conexion a la base de datos"
                );
              }
              if (
                respuesta?.msg == "El Valor Aportado Debe ser Exacto ej: 5000"
              ) {
                notifyError("El valor a aportar debe ser múltiplo de 100");
              }
              if (
                respuesta?.msg?.respuesta_colpensiones == "Estructura inválida."
              ) {
                notifyError("Estructura inválida.");
              }
              if (
                respuesta?.msg ==
                "SchemaError: Key 'num_pago_pdp' error:\nint('') raised ValueError(\"invalid literal for int() with base 10: ''\")"
              ) {
                notifyError("Seleccione un número de pagos");
              } else {
                if (
                  respuesta?.msg ==
                  "Se ha creado el comercio domiciliado voluntario exitosamente"
                ) {
                  notify(
                    "Se ha creado el comercio domiciliado voluntario exitosamente"
                  );
                  setShowModal(false);
                  navigate(`/domiciliacion`);
                }
              }
            })
            .catch((err) => {
              console.log(err);
              notifyError("Error al subir Formulario");
            });
        } else {
          console.log("no es 3");
          notifyError(
            "Numero invalido, el N° de celular debe comenzar con el número 3."
          );
          /* setDisabledBtn(false); */
        }

        // setShowModal(false);
        // navigate(`/domiciliacion`);
      } else {
        notifyError("Número de cédula ya domiciliado.");
      }
      /*   notify("Valor Correcto"); */
    } else {
      notifyError(
        "El valor aportado ingresado esta fuera del rango de 5000 y 149000."
      );
    }
  };
  const onCedChange = (e) => {
    const formData = new FormData(e.target.form);
    const cedula = (
      (formData.get("N° Identificación") ?? "").match(/\d/g) ?? []
    ).join("");
    setNumDocumento(cedula);
  };
  const onCelChange = (e) => {
    const formData = new FormData(e.target.form);
    const phone = ((formData.get("celular") ?? "").match(/\d/g) ?? []).join("");
    setNumCelular(phone);

    if (e.target.value.length == 1) {
      if (e.target.value[0] == 3) {
        setInvalidCelular("");
      } else {
        setInvalidCelular("numero invalido");
      }
    }
  };
  return (
    <div>
      {showModal && datosConsulta ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className={contenedorImagen}>
            <LogoPDP xsmall></LogoPDP>
          </div>
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
                  "Cédula de Ciudadania": "1",
                  "Cédula de Extranjeria": "2",
                  "Tarjeta de Identidad": "4",
                  "Registro Civil": "5",
                  "Pasaporte ": "6",
                  "Carnét Diplomático": "7",
                  "Salvo conducto permanencia": "8",
                  "Permiso especial permanencia": "9",
                }}
                required
              ></Select>
              {/*               <Input
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
              ></Input> */}

              <Input
                name="N° Identificación"
                label="N° Identificación"
                type="tel"
                autoComplete="off"
                minLength={"5"}
                maxLength={"10"}
                /* invalid={invalidCedula} */
                value={numDocumento ?? ""}
                onChange={onCedChange}
                required
              />
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
                id="celular"
                name="celular"
                label="Celular: "
                type="tel"
                autoComplete="off"
                minLength="10"
                maxLength="10"
                value={numCelular ?? ""}
                onInput={(e) => {
                  const num = parseInt(e.target.value) || "";
                  if (e.target.value.length === 1) {
                    if (e.target.value != 3) {
                      notifyError(
                        "Número inválido, el N° de celular debe comenzar con el número 3. "
                      );
                    }
                  }
                  setNumCelular(num);
                }}
                required
              />

              {/*               <Input
                name="celular"
                label="Celular"
                type="tel"
                autoComplete="off"
                minLength={"10"}
                maxLength={"10"}
                invalid={invalidCelular}
                value={numCelular ?? ""}
                onChange={onCelChange}
                required
              /> */}
              <MoneyInput
                label={"Valor Aportar"}
                placeholder={"Ingrese Valor Aportar"}
                value={valorAportar}
                minLength="6"
                maxLength="9"
                onInput={(e) => {
                  const num = e.target.value.replace(".", "") || "";
                  setValorAportar(num.replace("$", ""));
                }}
                /*    onInput={(e, valor) =>
                setValorAportar((old) => {
                  return {
                    ...old,
                    valorAportar: valor,
                  };
                })
              } */
                type={"text"}
                required
              ></MoneyInput>
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
