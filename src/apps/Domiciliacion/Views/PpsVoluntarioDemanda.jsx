import React, { useCallback, useState, useEffect, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import Voucher from "../../LoteriaBog/components/Voucher/Voucher";
import { useReactToPrint } from "react-to-print";
import Form from "../../../components/Base/Form";
import Tickets from "../../../components/Base/Tickets";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const PpsVoluntarioDemanda = ({ ced }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState(ced);
  const [numCelular, setNumCelular] = useState("");
  const [datosRespuesta, setDatosRespuesta] = useState("");
  const [valorAportar, setValorAportar] = useState();
  const [showModal, setShowModal] = useState(true);
  const [showModalVoucher, setShowModalVoucher] = useState(false);
  const { quotaInfo, roleInfo, infoTicket } = useAuth();

  console.log(quotaInfo);
  const [cupoLogin, setCupoLogin] = useState(quotaInfo?.["quota"]);
  const [idComercio, setIdComercio] = useState(roleInfo?.["id_comercio"]);
  const [idusuario, setIdUsuario] = useState(roleInfo?.["id_usuario"]);
  const [iddispositivo, setIddispositivo] = useState(
    roleInfo["id_dispositivo"]
  );
  const [tipoComercio, setTipoComercio] = useState(roleInfo["tipo_comercio"]);
  const [esPropio, setEsPropio] = useState(false);
  const [voucher, setVoucher] = useState(false);

  const [disabledBtn, setDisabledBtn] = useState(false);

  const navigate = useNavigate();

  const [cantNum, setCantNum] = useState(0);

  const url = process.env.REACT_APP_URL_COLPENSIONES;

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
    navigate(`/domiciliacion`);
  }, []);
  const handleClose2 = useCallback(() => {
    setShowModal(false);
  }, []);

  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
  useEffect(() => {
    cantidadNumero(numCelular);
  }, [numCelular]);

  function cantidadNumero(numero) {
    let contador = 0;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    /*    console.log(cantNum); */
  }

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        }).format(new Date()),
      },
      commerceName: tipoComercio,
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": datosRespuesta?.[0]?.["inserted_id"] /* "22" */,
      }),
      trxInfo: [
        ["Proceso", "Aporte Voluntario A Demanda"],
        ["VALOR", formatMoney.format(valorAportar)],
        ["N° Planilla", /* "33" */ datosRespuesta?.[1]?.["planillaCode"]],
      ],

      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [
    roleInfo,
    valorAportar,
    datosRespuesta,
    tipoComercio /* respPinCancel, roleInfo, valor */,
  ]);

  useEffect(() => {
    infoTicket(datosRespuesta?.[0]?.["inserted_id"], 57, tickets)
      .then((resTicket) => {
        console.log(resTicket);
      })
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [infoTicket, tickets]);

  const enviar = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    /*  setShowModal(false); */
    if (cupoLogin >= valorAportar) {
      if (tipoComercio === "OFICINAS PROPIAS") {
        console.log("entre");
        setEsPropio(true);
        fetchData(
          `${url}/crearplanillademandaofpropias`,
          "POST",
          {},
          {
            TipoId: tipoIdentificacion,
            Identificacion: numDocumento,
            financialInstitutionCode: "96",
            CanalCode: "20",
            OperadorCode: "84",
            trazabilityFinancialInstitutionCode: "1",
            ValueAmount: parseInt(valorAportar),
            Celular: numCelular,
            id_comercio: idComercio,
            id_dispositivo: iddispositivo,
            id_usuario: idusuario,
            /* es_Propio: esPropio, */
          },
          {},
          true
        )
          .then((respuesta) => {
            console.log(respuesta);
            if (
              respuesta?.msg?.["respuesta_colpensiones"] ===
              "El aportante no existe."
            ) {
              notifyError("El aportante no existe.");
              navigate(`/domiciliacion`);
            }
            if (
              respuesta?.msg === "El Valor Aportado Debe ser Exacto ej: 5000"
            ) {
              notifyError("El Valor Aportado Debe ser Exacto ej: 5000");
              /* navigate(`/domiciliacion`); */
              setDisabledBtn(false);
            }
            if (respuesta?.msg === "Lo Sentimos, Falló el Registro Del Cupo") {
              notifyError("Lo Sentimos, Falló el Registro Del Cupo");
              navigate(`/domiciliacion`);
            }
            if (
              respuesta?.msg?.["respuesta_colpensiones"] ===
              "Cotizante no existe."
            ) {
              notifyError("Cotizante no existe.");
              navigate(`/domiciliacion`);
            }

            if (
              respuesta?.msg ===
              "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000"
            ) {
              notifyError(
                "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000."
              );
              /* navigate(`/domiciliacion`); */
              setDisabledBtn(false);
            }
            if (
              respuesta?.msg?.["RESPUESTA COLPENSIONES"] ===
              "Lo Sentimos, Falló el Servicio De Colpensiones"
            ) {
              notifyError("Lo Sentimos, Falló el Servicio De Colpensiones");
              navigate(`/domiciliacion`);
            }
            /* if (respuesta?.msg === "Lo Sentimos, Falló el Registro Del Cupo") {
              notifyError("Lo Sentimos, Falló el Registro Del Cupo");
              navigate(`/domiciliacion`);
            } */
            if (
              (respuesta?.msg ===
                "La transaccion ha sido creada exitosamente") &
              (respuesta?.obj.length > 1)
            ) {
              setShowModalVoucher(true);
              setDatosRespuesta(respuesta?.obj);
            }
          })
          .catch((err) => {
            console.log(err);
            notifyError("Error al Pagar Planilla Voluntaria a Demanda");
            navigate(`/domiciliacion`);
          });
      } else {
        if (cantNum == 10) {
          console.log("Comercio");
          setEsPropio(true);
          fetchData(
            `${url}/crearplanillademandacomercios`,
            "POST",
            {},
            {
              TipoId: tipoIdentificacion,
              Identificacion: numDocumento,
              financialInstitutionCode: "96",
              CanalCode: "20",
              OperadorCode: "84",
              trazabilityFinancialInstitutionCode: "1",
              ValueAmount: parseInt(valorAportar),
              Celular: numCelular,
              id_comercio: idComercio,
              id_dispositivo: iddispositivo,
              id_usuario: idusuario,
              /* es_Propio: esPropio, */
            },
            {},
            true
          )
            .then((respuesta) => {
              console.log(respuesta);
              if (
                respuesta?.msg?.["respuesta_colpensiones"] ===
                "El aportante no existe."
              ) {
                notifyError("El aportante no existe.");
                navigate(`/domiciliacion`);
              }
              if (
                respuesta?.msg === "El Valor Aportado Debe ser Exacto ej: 5000"
              ) {
                notifyError("El valor a aportar debe ser múltiplo de 100");
                /* navigate(`/domiciliacion`); */
                setDisabledBtn(false);
              }
              if (
                respuesta?.msg?.["respuesta_colpensiones"] ===
                "Cotizante no existe."
              ) {
                notifyError("Cotizante no existe.");
                navigate(`/domiciliacion`);
              }

              if (
                respuesta?.msg ===
                "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000"
              ) {
                notifyError(
                  "El valor aportado ingresado esta fuera del rango de 5000 y 149000."
                );
                /* navigate(`/domiciliacion`); */
                setDisabledBtn(false);
              }
              if (
                (respuesta?.msg ===
                  "La transaccion ha sido creada exitosamente") &
                (respuesta?.obj.length > 1)
              ) {
                setShowModalVoucher(true);
                setDatosRespuesta(respuesta?.obj);
              }
            })
            .catch((err) => {
              console.log(err);
              notifyError("Error al pagar planilla voluntaria a demanda");
              navigate(`/domiciliacion`);
            });
        } else {
          notifyError("Ingrese un número de célular valido");
          setNumCelular("");
          setDisabledBtn(false);
        }
      }
    } else {
      notifyError("No tiene el cupo suficiente para el aporte a colpensiones.");
      navigate(`/domiciliacion`);
    }
  };

  return (
    <div>
      <Modal show={showModal} handleClose={handleClose}>
        <LogoPDP small></LogoPDP>
        <Form onSubmit={(e) => enviar(e)}>
          <Fieldset
            legend="Formulario Aporte Voluntario"
            /* className="lg:col-span-3" */
          >
            <Select
              onChange={(event) => setTipoIdentificacion(event?.target?.value)}
              id="comissionType"
              label="Tipo Identificación"
              required
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
            ></Select>
            <Input
              label={"N° Documento"}
              placeholder={"Ingrese su Numero Documento"}
              value={numDocumento}
              minLength="6"
              maxLength="11"
              onInput={(e) => {
                const num = e.target.value || "";
                setNumDocumento(num.toString());
              }}
              type={"text"}
              required
            ></Input>

            <Input
              label={"N° Celular"}
              placeholder={"Ingrese su Numero Celular"}
              value={numCelular}
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
          </Fieldset>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button
                type="submit"
                disabled={disabledBtn} /* onClick={(e) => enviar(e)} */
              >
                Realizar Aporte
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </Form>
      </Modal>
      {showModalVoucher === true ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets}></Tickets>
            <Button onClick={handlePrint}>Imprimir</Button>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default PpsVoluntarioDemanda;
