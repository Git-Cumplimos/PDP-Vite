import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom"; //son hook usados para la routes
import { useReactToPrint } from "react-to-print";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Tickets from "../../../../components/Base/Tickets";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { notify, notifyError } from "../../../../utils/notify";
import { toPhoneNumber } from "../../../../utils/functions";
import { fetchCustom, ErrorCustom } from "../utils/fetchMovistarGeneral";
import { useFetchMovistar } from "../hook/useFetchMovistar";

//----------constantes------------
const tipo_operacion = 104;
const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/paquetes`;
const url_paquetes_movistar = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/metodo1/comprar`;
const inputDataInitial = {
  celular: "",
};
const inputDataInitialSearch = {
  tipodeoferta: null,
  codigodelaoferta: "",
  descripcioncorta: "",
  valordelaoferta: "",
};
const fetchGetPaquetes = fetchCustom(
  url_get_paquetes,
  "GET",
  "consulta paquetes"
);
//----------------------------------

const SubPaquetesMovistar = () => {
  const { pathname: urlLocation } = useLocation(); //Hook para averiguar en que URL est
  const [tipodeoferta, setTipodeoferta] = useState("");
  const [maxPage, setMaxPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageData, setPageData] = useState(1);
  const [dataServiceConsult, setDataServiceConsult] = useState(null);
  const [dataPackage, setDataPackage] = useState(null);
  const [inputData, setInputData] = useState(inputDataInitial);
  const [inputDataSearch, setInputDataSearch] = useState(
    inputDataInitialSearch
  );
  const [infTicket, setInfTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [typeInfo, setTypeInfo] = useState("Ninguno");
  const { roleInfo, infoTicket: guardarTicket } = useAuth();
  const navigateValid = useNavigate();
  const [loadingPeticionGetPaquetes, PeticionGetPaquetes] =
    useFetch(fetchGetPaquetes);
  const [loadingPeticionCompraPaquetes, PeticionCompraPaquetes] =
    useFetchMovistar(url_paquetes_movistar, "compra paquetes movistar");

  useEffect(() => {
    let paramsGetPaquetes = {};
    if (urlLocation === "/movistar/paquetes-movistar/combo") {
      paramsGetPaquetes["tipodeoferta"] = "combo";
      setTipodeoferta("Combos");
    } else if (urlLocation === "/movistar/paquetes-movistar/paquete-voz") {
      paramsGetPaquetes["tipodeoferta"] = "paquetedevoz";
      setTipodeoferta("Paquetes de voz");
    } else if (urlLocation === "/movistar/paquetes-movistar/paquete-datos") {
      paramsGetPaquetes["tipodeoferta"] = "paquetededatos";
      setTipodeoferta("Paquetes de datos");
    } else if (urlLocation === "/movistar/paquetes-movistar/prepagada") {
      paramsGetPaquetes["tipodeoferta"] = "prepagada";
      setTipodeoferta("Prepagada");
    }

    if (inputDataSearch.codigodelaoferta != "") {
      paramsGetPaquetes["codigodelaoferta"] = inputDataSearch.codigodelaoferta;
    }
    if (inputDataSearch.descripcioncorta != "") {
      paramsGetPaquetes["descripcioncorta"] = inputDataSearch.descripcioncorta;
    }

    if (
      inputDataSearch.valordelaoferta != "" &&
      inputDataSearch.valordelaoferta != 0
    ) {
      paramsGetPaquetes["valordelaoferta"] = inputDataSearch.valordelaoferta;
    }

    paramsGetPaquetes["page"] = pageData;
    paramsGetPaquetes["limit"] = limit;

    PeticionGetPaquetes(paramsGetPaquetes, {})
      .then((response) => {
        console.log(response);
        if (response?.status == true) {
          setDataServiceConsult(response?.obj?.result?.results);
          setMaxPage(response?.obj?.result?.maxPages);
        }
      })
      .catch((error) => {
        let msg = "consulta paquetes no exitoso";
        if (error instanceof ErrorCustom) {
          switch (error.name) {
            case "ErrorCustomBackend":
              notifyError(`${msg}: ${error.message}`);
              break;
            default:
              if (error.notificacion == null) {
                notifyError(`${msg}: ${error.message}`);
              }
              break;
          }
        } else {
          notifyError(msg);
        }
      });
  }, [urlLocation, pageData, limit, inputDataSearch]);

  function onChangeInput(e) {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && inputData.celular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }

    setInputData((anterior) => ({
      ...anterior,
      [e.target.name]: valueInput,
    }));
  }

  function ValidarAntesCompraPaquete(e) {
    e.preventDefault();
    //RealizarCompra
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

    PeticionCompraPaquetes(data)
      .then((response) => {
        if (response?.status == true) {
          CompraPaquetesExitosa(response?.obj?.result);
        }
      })
      .catch((error) => {
        HandleCloseFirst();
        let msg = "compra de paquetes no exitosa";
        if (error instanceof ErrorCustom) {
          switch (error.name) {
            case "ErrorCustomBackend":
              msg = `${msg}: ${error.message}`;
              const error_msg_key = Object.keys(error.error_msg);
              const find = error_msg_key.find(
                (keyInd) => keyInd == "ErrorTrxRefuse"
              );
              msg = find != undefined ? error.message : msg;
              notifyError(msg);
              break;
            default:
              if (error.notificacion == null) {
                console.log("hola");
                notifyError(`${msg}: ${error.message}`);
              }
              break;
          }
        } else {
          notifyError(msg);
        }
      });
  };

  function CompraPaquetesExitosa(result_) {
    const voucher = {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de venta": result_.fecha_final_ptopago,
        Hora: result_.hora_final_ptopago,
      },
      commerceInfo: [
        ["Id Transacción", result_.transaccion_ptopago],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Id Movistar", result_.pk_trx],
        ["Id Comercio", roleInfo.id_comercio],
        ["Comercio", roleInfo["nombre comercio"]],
        ["", ""],
        ["Municipio", roleInfo.ciudad],
        ["", ""],
        ["Dirección", roleInfo.direccion],
        ["", ""],
        // ["Id Trx", result_.pk_trx],
      ],
      commerceName: "PAQUETES MOVISTAR",
      trxInfo: [
        ["Tipo paquete", tipodeoferta],
        ["", ""],
        ["Número celular", toPhoneNumber(inputData.celular)],
        ["", ""],
        ["Valor paquete", formatMoney.format(dataPackage.valordelaoferta)],
        ["", ""],
        ["Código paquete", dataPackage.codigodelaoferta],
        ["", ""],
        ["Descripción", dataPackage.descripcioncorta],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (Chatbot)",
    };

    notify("Compra de paquetes exitosa");
    setInfTicket(voucher);
    setTypeInfo("InfRecibo");
    guardarTicket(result_.transaccion_ptopago, tipo_operacion, voucher)
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
    setInputData(inputDataInitial);
  }, []);

  const HandleCloseSecond = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setDataPackage(null);
    setInputData(inputDataInitial);
    notify("Compra cancelada");
  }, []);

  const HandleCloseResRecibo = useCallback(() => {
    setTypeInfo("Ninguno");
    setShowModal(false);
    setInputData(inputDataInitial);
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
      >
        <Input
          name="codigodelaoferta"
          label="Código de la oferta"
          type="text"
          autoComplete="off"
          value={inputDataSearch.codigodelaoferta}
          onChange={(e) => {
            setInputDataSearch((anterior) => ({
              ...anterior,
              [e.target.name]: e.target.value,
            }));
          }}
        />

        <Input
          name="descripcioncorta"
          label="Descripción"
          type="text"
          autoComplete="off"
          value={inputDataSearch.descripcioncorta}
          onChange={(e) => {
            setInputDataSearch((anterior) => ({
              ...anterior,
              [e.target.name]: e.target.value,
            }));
          }}
        />

        <MoneyInput
          name="valordelaoferta"
          label="Valor"
          autoComplete="off"
          value={inputDataSearch.valordelaoferta}
          onInput={(e, value) => {
            setInputDataSearch((anterior) => ({
              ...anterior,
              [e.target.name]: value,
            }));
          }}
          required
        />
      </TableEnterprise>

      <Modal
        show={showModal}
        handleClose={
          typeInfo === "InfRecibo"
            ? HandleCloseResRecibo
            : loadingPeticionCompraPaquetes
            ? () => {}
            : HandleCloseFirst
        }
      >
        {/******************************ResumenPaquete*******************************************************/}
        {typeInfo === "ResumenPaquete" && (
          <PaymentSummary title="Paquete Movistar" subtitle={tipodeoferta}>
            <label className="whitespace-pre-line">
              {dataPackage?.descripciondelaoferta}
            </label>
            <label>
              {`Valor: ${formatMoney.format(dataPackage.valordelaoferta)}`}
            </label>
            <Form onChange={onChangeInput} onSubmit={ValidarAntesCompraPaquete}>
              <Input
                name="celular"
                label="Número de celular"
                type="tel"
                autoComplete="off"
                minLength={"10"}
                maxLength={"10"}
                value={inputData.celular}
                required
              />
              <ButtonBar>
                <Button type={"submit"}>Comprar</Button>
                <Button onClick={HandleCloseFirst}>Cancelar</Button>
              </ButtonBar>
            </Form>
          </PaymentSummary>
        )}
        {/******************************Adquirir del paquete*******************************************************/}

        {/******************************Resumen de trx*******************************************************/}
        {typeInfo === "ResumenTrx" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: toPhoneNumber(inputData.celular),
              Valor: formatMoney.format(dataPackage.valordelaoferta),
              "Tipo de Oferta": tipodeoferta,
              "Descripción Corta": dataPackage.descripcioncorta,
              "Código de la Oferta": dataPackage.codigodelaoferta,
            }}
          >
            {!loadingPeticionCompraPaquetes ? (
              <>
                <ButtonBar>
                  <Button type={"submit"} onClick={ComprarPaquete}>
                    Aceptar
                  </Button>
                  <Button onClick={HandleCloseSecond}>Cancelar</Button>
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
          {infTicket && typeInfo === "InfRecibo" && (
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
