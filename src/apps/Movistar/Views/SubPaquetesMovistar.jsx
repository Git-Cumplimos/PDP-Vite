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
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Tickets from "../../../components/Base/Tickets";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchCompraPaquetes,
  fetchCustom,
  ErrorCustom,
  ErrorCustomBackend,
  msgCustomBackend,
} from "../utils/fetchPaquetesMovistar";

const inputDataInitial = {
  celular: "",
};
const inputDataInitialSearch = {
  tipodeoferta: null,
  codigodelaoferta: "",
  descripcioncorta: "",
  valordelaoferta: "",
};
const tipo_operacion = 104;
const url_get_paquetes = `${process.env.REACT_APP_URL_MOVISTAR}/movistar/compra-paquetes/paquetes`;

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
    useFetch(fetchCustom);
  const [loadingPeticionCompraPaquetes, PeticionCompraPaquetes] =
    useFetch(fetchCompraPaquetes);

  useEffect(() => {
    let arrayParamts = [];
    if (urlLocation == "/movistar/paquetes-movistar/combo") {
      arrayParamts.push("tipodeoferta=combo");
      setTipodeoferta("Combos");
    } else if (urlLocation == "/movistar/paquetes-movistar/paquete-voz") {
      arrayParamts.push("tipodeoferta=paquetedevoz");
      setTipodeoferta("Paquetes de voz");
    } else if (urlLocation == "/movistar/paquetes-movistar/paquete-datos") {
      arrayParamts.push("tipodeoferta=paquetededatos");
      setTipodeoferta("Paquetes de datos");
    } else if (urlLocation == "/movistar/paquetes-movistar/prepagada") {
      arrayParamts.push("tipodeoferta=prepagada");
      setTipodeoferta("Prepagada");
    }

    if (inputDataSearch.codigodelaoferta != "") {
      arrayParamts.push(`codigodelaoferta=${inputDataSearch.codigodelaoferta}`);
    }
    if (inputDataSearch.descripcioncorta != "") {
      arrayParamts.push(`descripcioncorta=${inputDataSearch.descripcioncorta}`);
    }

    if (
      inputDataSearch.valordelaoferta != "" &&
      inputDataSearch.valordelaoferta != 0
    ) {
      arrayParamts.push(`valordelaoferta=${inputDataSearch.valordelaoferta}`);
    }

    arrayParamts.push(`page=${pageData}&limit=${limit}`);
    const params = arrayParamts.length > 0 ? `?${arrayParamts.join("&")}` : "";

    PeticionGetPaquetes(url_get_paquetes + params, "GET", "paquetes")
      .then((response) => {
        if (response?.status == true) {
          setDataServiceConsult(response?.obj?.result?.results);
          setMaxPage(response?.obj?.result?.maxPages);
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

    PeticionCompraPaquetes(data)
      .then((response) => {
        const response_obj = response?.obj;
        const result = response_obj?.result;
        if (response?.status == true) {
          CompraPaquetesExitosa(response?.obj?.result);
        } else {
          HandleCloseFirst();
          switch (response_obj?.identificador) {
            case "00":
              notifyError(
                "Compra de paquete no exitosa, datos de entrada al servicio erróneos (Error:00)"
              );
              break;
            case "01":
              notifyError(
                "Compra de paquete no exitosa, el servicio transaccional se encuentra caído (Error:01)"
              );
              break;
            case "02":
              notify("No tiene cupo");
              break;
            case "03":
              notifyError(
                "Compra de paquete no exitosa, error con la conexión inicial a la base de datos (Error:03)"
              );
              break;
            case "04":
              notifyError(
                "Compra de paquete no exitosa, error con la trama enviada  (Error:04)]"
              );
              break;
            case "06":
              notifyError(
                "Compra de paquete no exitosa, error con la conexión (Error:06)]"
              );
              break;
            case "11":
              notifyError(result.descripcion_codigo_error);
              break;
            default:
              break;
          }
        }
      })
      .catch((error) => {
        notifyError("Falla en el sistema >> " + error);
        HandleCloseFirst();
      });
  };

  function CompraPaquetesExitosa(result_) {
    const voucher = {
      title: "Recibo de compra de paquetes movistar",
      timeInfo: {
        "Fecha de venta": result_.fecha_final_ptopago,
        Hora: result_.hora_final_ptopago,
      },
      commerceInfo: [
        ["Id Comercio", roleInfo.id_comercio],
        ["No. terminal", roleInfo.id_dispositivo],
        ["Municipio", roleInfo.ciudad],
        ["Dirección", roleInfo.direccion],
        ["Id Trx", result_.pk_trx],
        ["Id Transacción", result_.transaccion_ptopago],
      ],
      commerceName: `${tipodeoferta} MOVISTAR`,
      trxInfo: [
        ["Celular", inputData.celular],
        ["Valor", formatMoney.format(dataPackage.valordelaoferta)],
        ["Código paquete", dataPackage.codigodelaoferta],
        ["", ""],
        ["Descripción", dataPackage.descripcioncorta],
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
          typeInfo == "InfRecibo"
            ? HandleCloseResRecibo
            : loadingPeticionCompraPaquetes
            ? () => {}
            : HandleCloseFirst
        }
      >
        {/******************************ResumenPaquete*******************************************************/}
        {typeInfo == "ResumenPaquete" && (
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
        {typeInfo == "ResumenTrx" && (
          <PaymentSummary
            title="¿Está seguro de realizar la transacción?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Celular: inputData.celular,
              Valor: formatMoney.format(dataPackage.valordelaoferta),
              "Tipo de Oferta": tipodeoferta,
              "Descripción Corta": dataPackage.descripcioncorta,
              "Código de la Oferta": dataPackage.codigodelaoferta,
            }}
          >
            {!loadingPeticionCompraPaquetes ? (
              <>
                <ButtonBar>
                  <Button onClick={ComprarPaquete}>Aceptar</Button>
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
