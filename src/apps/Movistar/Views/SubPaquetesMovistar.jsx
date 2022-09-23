import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom"; //son hook usados para la routes
import { useReactToPrint } from "react-to-print";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchCustom,
  ErrorCustom,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../utils/fetchPaquetesMovistar";

const dataInputInitial = {
  celular: "",
};
const tipo_operacion = 104;
const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/paquetes`;
const url_compra_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/comprar`;

const SubPaquetesMovistar = () => {
  const { pathname: urlLocation } = useLocation(); //Hook para averiguar en que URL est
  const [tipodeoferta, setTipodeoferta] = useState("");
  const [maxPage, setMaxPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageData, setPageData] = useState(1);
  const [dataServiceConsult, setDataServiceConsult] = useState(null);
  const [dataPackage, setDataPackage] = useState(null);
  const [inputData, setInputData] = useState(dataInputInitial);
  const [invalidCelular, setInvalidCelular] = useState("");
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { roleInfo, infoTicket: guardarTicket } = useAuth();
  const navigateValid = useNavigate();
  const [loadingPeticionGetPaquetes, PeticionGetPaquetes] =
    useFetch(fetchCustom);
  const [loadingPeticionCompraPaquetes, PeticionCompraPaquetes] =
    useFetch(fetchCustom);

  useEffect(() => {
    let arrayParamts = [];
    if (urlLocation == "/movistar/paquetes-movistar/combo") {
      arrayParamts.push("tipodeoferta=combo");
      setTipodeoferta("COMBOS");
    } else if (urlLocation == "/movistar/paquetes-movistar/paquete-voz") {
      arrayParamts.push("tipodeoferta=paquetedevoz");
      setTipodeoferta("PAQUETES DE VOZ");
    } else if (urlLocation == "/movistar/paquetes-movistar/paquete-datos") {
      arrayParamts.push("tipodeoferta=paquetededatos");
      setTipodeoferta("PAQUETES DE DATOS");
    }

    arrayParamts.push(`page=${pageData}&limit=${limit}`);
    const params = arrayParamts.length > 0 ? `?${arrayParamts.join("&")}` : "";

    PeticionGetPaquetes(url_get_paquetes + params, "GET", "paquetes")
      .then((response) => {
        if (response?.status == true) {
          setDataServiceConsult(response?.obj?.result?.results);
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(`consulta paquetes no exitoso: ${error.message}`);
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
        } else {
          notifyError("consulta paquetes no exitoso");
        }
      });
  }, [urlLocation, pageData, limit]);

  function onChangeInput(e) {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      setInvalidCelular("Número inválido");
      if (valueInput.length == 1 && inputData.celular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
      }
    } else {
      setInvalidCelular("");
    }

    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  const AdquirirPaquete = () => {
    setTypeInfo("AdquirirPaquete");
  };

  function onSubmitCheck(e) {
    e.preventDefault();
    // validar datos
    if (inputData.celular[0] != "3") {
      notifyError(
        "Número inválido, el No. de celular debe comenzar con el número 3"
      );
      return;
    }
    setShowModal(true);
    setTypeInfo("ResumenTrx");
  }
  const ComprarPaquete = () => {
    let oficinaPropia;
    if (roleInfo.tipo_comercio != "OFICINASPROPIAS") {
      oficinaPropia = false;
    }
    const data = {
      celular: inputData.celular,
      valor: dataPackage.valordelaoferta,
      codigo_comercio: roleInfo.id_comercio,
      tipo_comercio: roleInfo.tipo_comercio,
      id_dispositivo: roleInfo.id_dispositivo,
      id_usuario: roleInfo.id_usuario,
      direccion: roleInfo.direccion,
      ciudad: roleInfo.ciudad,
      codigo_dane: roleInfo.codigo_dane,
      codigodelaoferta: parseInt(dataPackage.codigodelaoferta),
    };

    PeticionCompraPaquetes(
      url_compra_paquetes,
      "POST",
      "/compra-paquetes/comprar",
      data
    )
      .then((response) => {
        if (response?.status == true) {
          CompraPaquetesExitosa(response?.obj?.result);
        }
      })
      .catch((error) => {
        if (error instanceof ErrorCustom) {
        } else if (error instanceof ErrorCustomBackend) {
          notifyError(`Pago de terceros no exitoso: ${error.message}`);
        } else if (error instanceof msgCustomBackend) {
          notify(`${error.message}`);
        } else {
          notifyError("Pago de terceros no exitoso");
        }
        HandleCloseFirst();
      });
  };

  function CompraPaquetesExitosa(result_) {
    const voucher = {
      title: "Recibo de pago de terceros ",
      timeInfo: {
        "Fecha de venta": result_.fecha,
        Hora: result_.hora,
      },
      commerceInfo: [
        ["Id Comercio", roleInfo.id_comercio],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Municipio", roleInfo.ciudad],
        ["Dirección", roleInfo.direccion],
        ["Id Trx", result_.pk_trx],
        ["Id Transacción", result_.id_trx],
      ],
      commerceName: "PAGO DE TERCEROS",
      trxInfo: [
        ["Celular", inputData.celular],
        ["", ""],
        ["Valor", formatMoney.format(dataPackage.valordelaoferta)],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };

    notify("Pago de terceros exitoso");
    setInfTicket(voucher);
    setTypeInfo("InfRecibo");
    guardarTicket(result_.id_trx, tipo_operacion, voucher)
      .then((resTicket) => {
        console.log("Ticket guardado exitosamente");
      })
      .catch((err) => {
        console.error("Error guardando el ticket");
      });
  }

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
  });

  const HandleCloseFirst = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDataPackage(null);
    setInputData(dataInputInitial);
  }, []);

  const HandleCloseResRecibo = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(dataInputInitial);
    navigateValid("/movistar/paquetes-movistar");
  }, []);

  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl mt-6">Paquetes Movistar</h1>
      <br></br>

      <TableEnterprise
        title={tipodeoferta}
        maxPage={maxPage}
        headers={[
          "Código de la Oferta",
          "Descripción Corta",
          "Valor de la Oferta",
        ]}
        data={
          dataServiceConsult?.map((inf) => ({
            "Código de la Oferta": inf.codigodelaoferta,
            "Descripción Corta": inf.descripcioncorta,
            "Valor de la Oferta": formatMoney.format(inf.valordelaoferta),
          })) ?? []
        }
        onSelectRow={(e, i) => {
          setDataPackage(dataServiceConsult?.[i]);
          setShowModal(true);
          setTypeInfo("ResumenPaquete");
        }}
        onSetPageData={(pagedata) => {
          setPageData(pagedata.page);
          setLimit(pagedata.limit);
        }}
      ></TableEnterprise>

      <Modal show={showModal} handleClose={HandleCloseFirst}>
        {/******************************Resumen del paquete*******************************************************/}
        {typeInfo == "ResumenPaquete" && (
          <PaymentSummary title="Paquete movistar " subtitle="Resumen">
            <label className="whitespace-pre-line">
              {dataPackage?.descripciondelaoferta}
            </label>
            <ButtonBar>
              <Button onClick={AdquirirPaquete}>Comprar</Button>
              <Button onClick={HandleCloseFirst}>Cancelar</Button>
            </ButtonBar>
          </PaymentSummary>
        )}
        {/******************************Resumen del paquete*******************************************************/}

        {/******************************Adquirir del paquete*******************************************************/}
        {typeInfo == "AdquirirPaquete" && (
          <PaymentSummary
            title="Ingresar el número de celular"
            subtitle=""
            summaryTrx={{
              Valor: formatMoney.format(dataPackage.valordelaoferta),
            }}
          >
            <Form onChange={onChangeInput} onSubmit={onSubmitCheck}>
              <Input
                name="celular"
                label="Número de celular"
                type="tel"
                autoComplete="off"
                minLength={"10"}
                maxLength={"10"}
                invalid={invalidCelular}
                value={inputData.celular}
                required
              />
              <br></br>
              <ButtonBar>
                <Button type={"submit"} onClick={ComprarPaquete}>
                  Comprar
                </Button>
                <Button onClick={HandleCloseFirst}>Cancelar</Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
        {/******************************Adquirir del paquete*******************************************************/}

        {/******************************Resumen de trx*******************************************************/}
        {typeInfo == "ResumenTrx" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transaccion?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              celular: inputData.celular,
              Valor: formatMoney.format(dataPackage.valordelaoferta),
              "Tipo de Oferta": dataPackage.tipodeoferta,
              "Descripción Corta": dataPackage.descripcioncorta,
              "Código de la Oferta": dataPackage.codigodelaoferta,
            }}
          >
            {!loadingPeticionCompraPaquetes ? (
              <>
                <ButtonBar>
                  <Button onClick={ComprarPaquete}>Aceptar</Button>
                  <Button onClick={HandleCloseFirst}>Cancelar</Button>
                </ButtonBar>
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Procesando . . .</h1>
            )}
          </PaymentSummary>
        )}
        {/******************************Resumen de trx *******************************************************/}

        {/******************************inf recibo *******************************************************/}
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center">
          {infTicket && typeInfo == "InfRecibo" && (
            <Fragment>
              <Tickets refPrint={printDiv} ticket={infTicket} />
              <ButtonBar>
                <Button onClick={handlePrint}>Imprimir</Button>
                <Button onClick={HandleCloseResRecibo}>Cerrar</Button>
              </ButtonBar>
            </Fragment>
          )}
        </div>
        {/******************************inf recibo *******************************************************/}
      </Modal>
    </div>
  );
};

export default SubPaquetesMovistar;
