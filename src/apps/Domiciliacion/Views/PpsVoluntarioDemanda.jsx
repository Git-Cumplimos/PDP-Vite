import React, { useCallback, useState, useEffect } from "react";
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

const PpsVoluntarioDemanda = ({ ced }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState(ced);
  const [numCelular, setNumCelular] = useState("");
  const [valorAportar, setValorAportar] = useState();
  const [showModal, setShowModal] = useState(true);
  const [showModalVoucher, setShowModalVoucher] = useState(false);
  const { quotaInfo, roleInfo } = useAuth();

  const [cupoLogin, setCupoLogin] = useState(quotaInfo["quota"]);
  const [idComercio, setIdComercio] = useState(roleInfo["id_comercio"]);
  const [idusuario, setIdUsuario] = useState(roleInfo["id_usuario"]);
  const [iddispositivo, setIddispositivo] = useState(
    roleInfo["id_dispositivo"]
  );
  const [tipoComercio, setTipoComercio] = useState(roleInfo["tipo_comercio"]);
  const [esPropio, setEsPropio] = useState(false);
  const [voucher, setVoucher] = useState(false);

  const navigate = useNavigate();

  const [cantNum, setCantNum] = useState(0);

  const url = process.env.REACT_APP_URL_COLPENSIONES;
  const url2 = "http://127.0.0.1:7000";

  const printDiv = useRef();
  const voucherInfo = {};

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });
  voucherInfo["Fecha de venta"] = Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date());
  voucherInfo["Hora"] = Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).format(new Date());

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
    console.log(cantNum);
  }

  const enviar = (e) => {
    e.preventDefault();
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
          {
            /* "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS */
          },
          true
        )
          .then((respuesta) => {
            console.log(respuesta /* ?.msg?.["respuesta_colpensiones"] */);
            /*  if (
              respuesta?.msg?.["respuesta_colpensiones"] ===
              "El aportante no existe."
            ) {
              console.log("hola mundo");
            } */
          })
          .catch((err) => {
            console.log(err);
            notifyError("Error al Pagar Planilla Voluntaria a Demanda");
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
                respuesta?.msg ===
                "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000"
              ) {
                notifyError(
                  "El Valor Aportado Ingresado Esta Fuera Del Rango De 5000 y 149000."
                );
                navigate(`/domiciliacion`);
              }
              if (
                (respuesta?.msg ===
                  "La transaccion ha sido creada exitosamente") &
                (respuesta?.obj.length > 1)
              ) {
                voucherInfo["Id Trx"] = 3333;
                voucherInfo["Estado"] = "Activo";
                voucherInfo["Nombre"] = "respuestamujer?.obj[]";
                voucherInfo["Documento"] = "respuestamujer?.obj.Documento";
                voucherInfo["pin"] = "respuestamujer?.obj.Pin";
                voucherInfo["Valordesembolso"] = "respuestamujer?.ob";
                voucherInfo["idtrx"] = "respuestamujer?.obj";
                setShowModalVoucher(true);
              }
            })
            .catch((err) => {
              console.log(err);
              notifyError("Error al Pagar Planilla Voluntaria a Demanda");
            });
        } else {
          notifyError("Ingrese un numero de Celular Valido");
          setNumCelular("");
        }
      }
    } else {
      notifyError("No Tiene el Cupo Suficiente Para el Aporte a Colpensiones.");
    }
  };
  console.log(voucherInfo);
  return (
    <div>
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
              "C.C Cedula de Ciudadania": "1",
              "C.E Cedula de Extranjeria": "2",
            }}
          ></Select>
          <Input
            label={"N° Documento"}
            placeholder={"Ingrese su Numero Documento"}
            value={numDocumento}
            onChange={(e) => setNumDocumento(e.target.value)}
            type={"number"}
            disabled
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
        </Fieldset>
        <ButtonBar className={"lg:col-span-2"} type="">
          {
            <Button type="submit" onClick={(e) => enviar(e)}>
              Guardar Datos
            </Button>
            /*  ) : null */
          }
        </ButtonBar>
      </Modal>
      {showModalVoucher === true ? (
        <Modal show={showModal} handleClose={handleClose}>
          <div className="flex flex-col justify-center items-center">
            <Voucher {...voucherInfo} refPrint={printDiv} />
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
