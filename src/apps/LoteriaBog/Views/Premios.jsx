import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLoteria } from "../utils/LoteriaHooks";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import { toast } from "react-toastify";
import Modal from "../../../components/Base/Modal";
import FileInput from "../../../components/Base/FileInput/FileInput";
import TicketLot from "../components/TicketsLot/TicketLot";
import { useAuth } from "../../../hooks/AuthHooks";
import { LineasLot_disclamer } from "../utils/enum";
import { useNavigate } from "react-router-dom";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import Fieldset from "../../../components/Base/Fieldset";
import Select from "../../../components/Base/Select";
import { useReactToPrint } from "react-to-print";
import { notify } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import classes from "./Premios.module.css";

const { btnBasura, contenedorArchivosBasura } = classes;

const url_cargueS3 = `${process.env.REACT_APP_URL_LOTERIAS}/documentos_premios`;
const urlAssets = process.env.REACT_APP_ASSETS_URL;

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const fetchUploadFileCustom = async (url, formData) => {
  try {
    const Peticion = await fetch(url, {
      method: "POST",
      body: formData,
      mode: "no-cors",
    });
    return Peticion;
  } catch (error) {
    throw error;
  }
};

const Premios = ({ route }) => {
  const [respuesta, setRespuesta] = useState(false);
  const [estadoTransaccion, setEstadoTransaccion] = useState(false);
  const navigate = useNavigate();
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [totalPagar, setTotalPagar] = useState("");
  const [valorbruto, setValorbruto] = useState("");
  const [valor17, setValor17] = useState("");
  const [valor20, setValor20] = useState("");
  const [serie, setSerie] = useState("");
  const [idLoteria, seIdLoteria] = useState("");
  const [seleccionarFraccion, setSeleccionarFraccion] = useState(0);
  const [hash, setHash] = useState("");
  const [maxPago, setMaxPago] = useState("");
  const [pagaOficina, setPagaOficina] = useState("");
  const [montoSuperior, setMontoSuperior] = useState("");
  const { pdpUser, roleInfo, infoTicket } = useAuth();
  const [respagar, setRespagar] = useState([]);
  const [tipopago, setTipopago] = useState("");
  const [isSelf, setIsSelf] = useState(false);
  const printDiv = useRef();
  const [showTable, setShowTable] = useState(false);
  const [checkBilleteVirtual, setCheckBilleteVirtual] = useState(false);
  const [checkBilleteFisico, setCheckBilleteFisico] = useState(false);
  const [checkDisableVirtual, setCheckDisableVirtual] = useState(false);
  const [checkDisableFisico, setCheckDisableFisico] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const { isWinner, makePayment } = useLoteria();
  const [fraccionesporbillete, setFraccionesporbillete] = useState(1);
  const [fracciones_disponibles, setFracciones_disponibles] = useState([]);
  const [files, setFiles] = useState([]);

  const [showAllmodals, setShowAllmodals] = useState({
    showModalVoucher: false,
    voucherAprobado: false,
    showModalDatosPropietario: false,
    showModalError: false,
    showModalconfirmacionVentaSoat: false,
    showLoading: false,
  });
  const [datosCliente, setDatosCliente] = useState({
    selectFraccion: 0,
    nombre: "",
    apellido: "",
    documento: "",
    direccion: "",
    celular: "",
    idTransaccion: "",
    statusPagoPremio: false,
    tipo_operacion: "",
  });

  const [datosComercio, setDatosComercio] = useState({
    comercio: "",
    terminal: "",
    usuario: "",
    codigo_dane: "",
    nom_loteria: "",
  });

  const deleteField = (e, type) => {
    if (type === "documento") {
      setFiles((old) => ({ ...old, documento: undefined }));
    }
    if (type === "formulario") {
      setFiles((old) => ({ ...old, formulario: undefined }));
    }
  };
  const handleClose = useCallback(() => {
    setSeleccionarFraccion(0);
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        showModalVoucher: false,
        showModalconfirmacionVentaSoat: false,
      };
    });
    navigate(-1);
  }, []);

  const notifyError = (msg) => {
    toast.warn(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const onSubmit = (e) => {
    setShowTable(false);
    setDisabledBtns(true);
    setRespuesta(true);
    e.preventDefault();
    setDatosCliente((old) => {
      return {
        ...old,
        selectFraccion: "0",
        nombre: "",
        apellido: "",
        documento: "",
        direccion: "",
        celular: "",
        idTransaccion: "",
        statusPagoPremio: false,
      };
    });

    isWinner(sorteo, billete, serie, checkBilleteFisico, checkBilleteVirtual)
      .then((res) => {
        var salvarRes = res;
        setMaxPago(res?.obj?.max_pago);
        setPagaOficina(res?.obj?.paga_oficina);
        setMontoSuperior(res?.obj?.monto_superior);
        seIdLoteria(res?.obj?.idloteria);
        setTotalPagar(res?.obj?.total);
        setTipopago(salvarRes?.obj?.tipo_ganancia);
        setFraccionesporbillete(res?.obj?.fracciones_billete);
        setDatosComercio((old) => {
          setRespuesta(false);
          setValorbruto(res?.obj?.valorbruto);
          setValor17(res?.obj?.valor17);
          setValor20(res?.obj?.valor20);
          setDisabledBtns(false);
          return {
            ...old,
            comercio: roleInfo?.id_comercio,
            usuario: roleInfo?.id_usuario,
            terminal: roleInfo?.id_dispositivo,
            codigo_dane: roleInfo?.codigo_dane,
            nom_loteria: res?.obj?.nom_loteria,
          };
        });
        if (res === undefined) {
          notifyError(
            "Error respuesta PDP: Fallo al consumir el servicio (loterías) [0010002]"
          );
        }
        if (!res.status) {
          notifyError(res.msg);
        }
        if (res.status && "msg" in res) {
          if (res?.obj?.max_pago == true || res?.obj?.paga_oficina == false) {
            if (res?.obj?.paga_oficina == false) {
              notifyError(
                "No se puede pagar, el valor del premio supera el valor asignado para los comercios externos"
              );
            } else {
              notifyError(
                "No se puede pagar, el valor del premio supera el valor asignado para los comercios PDP"
              );
            }
            var gana = res?.obj?.gana;
            var ValNetoFraccion = res?.obj?.ValNetoFraccion;
            var totalPagarLoteria = res?.obj?.total;
            res = [];
            for (let i = 0; i < gana.length; i++) {
              res.push([
                gana[i],
                sorteo,
                billete,
                serie,
                formatMoney.format(ValNetoFraccion[i]),
              ]);
            }
            res.push([
              "TOTAL A PAGAR:",
              "",
              "",
              "",
              formatMoney.format(totalPagarLoteria),
            ]);
            setRespagar(res);
            setShowTable(true);
          } else if (res?.obj?.ganador) {
            gana = res?.obj?.gana;
            ValNetoFraccion = res?.obj?.ValNetoFraccion;
            totalPagarLoteria = res?.obj?.total;
            res = [];
            for (let i = 0; i < gana.length; i++) {
              res.push([
                gana[i],
                sorteo,
                billete,
                serie,
                formatMoney.format(ValNetoFraccion[i]),
              ]);
            }
            res.push([
              "TOTAL A PAGAR:",
              "",
              "",
              "",
              formatMoney.format(totalPagarLoteria),
            ]);
            setRespagar(res);
            setShowTable(true);
          } else if (res?.obj?.ganador == false && "msg" in res) {
            notifyError(res?.obj?.gana);
            setIsSelf(false);
          }
        }
        if (salvarRes?.obj?.tipo_ganancia == 2) {
          setTipopago(salvarRes?.obj?.tipo_ganancia);
        }
        if (res[0]["Estado"] === false) {
          notifyError("No ganador");
          setIsSelf(false);
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const selectFraccionP = (fraccionesporbillete) => {
    const optionsDocumento = [{ value: 0, label: "Seleccione la fracción" }];
    for (let i = 1; i <= fraccionesporbillete; i++) {
      optionsDocumento.push({ value: i, label: "Fracción # " + i });
    }
    setFracciones_disponibles(optionsDocumento);
  };

  useEffect(() => {
    selectFraccionP(fraccionesporbillete);
  }, [fraccionesporbillete]);

  const tickets = useMemo(() => {
    return {
      title: "PAGO PREMIO",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: [
        ["Razón social", "Soluciones en Red S.A.S."],
        ["Nit", "830.084.645-1"],
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", datosCliente.idTransaccion],
        ["Id Aut ", datosCliente.idTransaccion],
        ["Comercio", roleInfo?.["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],
      commerceName: [datosComercio.nom_loteria],
      trxInfo: [
        ["Sorteo", sorteo],
        ["", ""],
        ["Número", billete],
        ["Serie", serie],
        ["", ""],
        ["Fracción", seleccionarFraccion],
        ["Valor a pagar", formatMoney.format(totalPagar)],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [
          tipopago === 2 && "Nombre",
          tipopago === 2 && datosCliente?.nombre + " " + datosCliente?.apellido,
        ],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [
          tipopago === 2 && "Número Documento",
          tipopago === 2 && datosCliente?.documento,
        ],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [tipopago === 2 && "Celular", tipopago === 2 && datosCliente?.celular],
        [tipopago === 2 && "", tipopago === 2 && ""],
        [tipopago === 2 && "", tipopago === 2 && ""],
      ],
      disclamer: LineasLot_disclamer[datosComercio.nom_loteria],
    };
  }, [
    sorteo,
    billete,
    serie,
    seleccionarFraccion,
    datosCliente,
    totalPagar,
    tipopago,
    roleInfo,
    datosComercio.nom_loteria,
  ]);

  const onPay1 = async (e) => {
    e.preventDefault();
    if (tipopago === 2) {
      if (String(datosCliente?.celular).charAt(0) === "3") {
        setRespuesta(true);
        if (
          seleccionarFraccion === 0 ||
          seleccionarFraccion === "0" ||
          seleccionarFraccion === undefined
        ) {
          setRespuesta(false);
          notifyError("Seleccione una fracción");
        } else if (checkBilleteVirtual === true && hash === "") {
          setRespuesta(false);
          notifyError("Ingresar código hash");
        } else {
          try {
            if (montoSuperior) {
              if (
                files?.documento === undefined ||
                files?.formulario === undefined
              ) {
                if (
                  files?.documento === undefined &&
                  files?.formulario !== undefined
                ) {
                  notifyError("Ingresar documento de identificación requerido");
                  setRespuesta(false);
                }
                if (
                  files?.documento !== undefined &&
                  files?.formulario === undefined
                ) {
                  notifyError("Ingresar formulario requerido");
                  setRespuesta(false);
                }
                if (
                  files?.documento === undefined &&
                  files?.formulario === undefined
                ) {
                  notifyError("Ingresar documentación requerida");
                  setRespuesta(false);
                }
                return;
              }
              const resSubir = await subirDocsPagoPremios();
              if (!resSubir) {
                setRespuesta(false);
                return;
              }
            }
          } catch (error) {
            setRespuesta(false);
            notifyError(
              "Error respuesta Frontend PDP: Error al consumir del servicio (Cargue archivos) [0010002]"
            );
            return;
          }
          const res = await makePayment(
            sorteo,
            billete,
            serie,
            checkBilleteFisico,
            checkBilleteVirtual,
            seleccionarFraccion,
            datosCliente?.nombre,
            datosCliente?.apellido,
            datosCliente?.documento,
            datosCliente?.direccion,
            datosCliente?.celular,
            totalPagar,
            valorbruto,
            valor17,
            valor20,
            datosComercio.comercio,
            datosComercio.terminal,
            datosComercio.usuario,
            datosComercio.codigo_dane,
            idLoteria,
            tipopago,
            hash,
            pdpUser?.uname,
            tickets
          );
          setRespuesta(false);
          setDatosCliente((old) => {
            return {
              ...old,
              statusPagoPremio: res?.status,
              idTransaccion: res?.obj?.id_trx,
              tipo_operacion: res?.obj?.tipo_operacion,
            };
          });
          tickets["commerceInfo"].splice(2, 0, [
            "Id Trx",
            datosCliente?.idTransaccion,
          ]);
          setEstadoTransaccion(res?.status);
          if (res?.status === false) {
            notifyError(res?.obj?.msg);
            navigate(-1);
          } else {
            notify("Pago premio de Lotería exitoso");
          }
        }
      } else {
        notifyError(
          "Número invalido, el N° de celular debe comenzar con el número 3."
        );
      }
    } else {
      if (
        seleccionarFraccion === 0 ||
        seleccionarFraccion === "0" ||
        seleccionarFraccion === undefined
      ) {
        setRespuesta(false);
        notifyError("Seleccione una fracción");
      } else if (checkBilleteVirtual === true && hash === "") {
        setRespuesta(false);
        notifyError("Ingresar código hash");
      } else {
        setRespuesta(true);
        try {
          if (montoSuperior) {
            if (
              files?.documento === undefined ||
              files?.formulario === undefined
            ) {
              if (
                files?.documento === undefined &&
                files?.formulario !== undefined
              ) {
                notifyError("Ingresar documento de identificación requerido");
                setRespuesta(false);
              }
              if (
                files?.documento !== undefined &&
                files?.formulario === undefined
              ) {
                notifyError("Ingresar formulario requerido");
                setRespuesta(false);
              }
              if (
                files?.documento === undefined &&
                files?.formulario === undefined
              ) {
                notifyError("Ingresar documentación requerida");
                setRespuesta(false);
              }
              return;
            }
            const resSubir = await subirDocsPagoPremios();
            if (!resSubir) {
              setRespuesta(false);
              return;
            }
          }
        } catch (error) {
          setRespuesta(false);
          notifyError(
            "Error respuesta Frontend PDP: (Error al consumir del servicio (Cargue archivos) [0010002])"
          );
          return;
        }
        const res = await makePayment(
          sorteo,
          billete,
          serie,
          checkBilleteFisico,
          checkBilleteVirtual,
          seleccionarFraccion,
          datosCliente?.nombre,
          datosCliente?.apellido,
          datosCliente?.documento,
          datosCliente?.direccion,
          datosCliente?.celular,
          totalPagar,
          valorbruto,
          valor17,
          valor20,
          datosComercio.comercio,
          datosComercio.terminal,
          datosComercio.usuario,
          datosComercio.codigo_dane,
          idLoteria,
          tipopago,
          hash,
          pdpUser?.uname,
          tickets
        );
        setRespuesta(false);
        setDatosCliente((old) => {
          return {
            ...old,
            statusPagoPremio: res?.status,
            idTransaccion: res?.obj?.id_trx,
            tipo_operacion: res?.obj?.tipo_operacion,
          };
        });
        setEstadoTransaccion(res?.status);
        if (res?.status === false) {
          notifyError(res?.obj?.msg);
          navigate(-1);
        } else {
          notify("Pago premio de Lotería exitoso");
        }
      }
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printDiv?.current,
  });

  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && datosCliente?.celular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setDatosCliente((old) => {
      return { ...old, celular: valueInput };
    });
  };

  const onDocChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");
    setDatosCliente((old) => {
      return { ...old, documento: valueInput };
    });
  };

  const cancelar = () => {
    notifyError("Se canceló el pago del premio");
    navigate(-1);
  };

  const onChangeFiles = (info, type) => {
    const contentType = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/svg",
      "application/pdf",
    ];
    const contentTypeFind = contentType.find(
      (type_) => contentType === info[0]?.type
    );
    if (contentTypeFind === undefined) {
      notifyError(
        "documentos con formato incorrecto, solo se recibe los siguientes formatos .png, .jpg, .jpeg, .pdf"
      );
      // document.getElementById("archivo_formulario1").value = ""; // <- limpia el valor del campo de archivo
      // document.getElementById("archivo_formulario2").value = ""; // <- limpia el valor del campo de archivo
      // document.getElementById("archivo_formulario3").value = ""; // <- limpia el valor del campo de archivo
      // document.getElementById("archivo_formulario4").value = ""; // <- limpia el valor del campo de archivo
      return;
    }

    setFiles((old) => ({
      ...old,
      [type]: { files: Array.from(info)[0], typeArchivo: info[0]?.type },
    }));
  };

  const subirDocsPagoPremios = async () => {
    try {
      const resUrlPresind = await fetchData(
        url_cargueS3,
        "POST",
        {},
        {
          idloteria: idLoteria,
          sorteo: sorteo,
          billete: billete,
          serie: serie,
          fraccion: seleccionarFraccion,
          valor_pagado: totalPagar,
          typefile: {
            documento: files.documento.typeArchivo,
            formulario: files.formulario.typeArchivo,
          },
        }
      );

      if (!resUrlPresind?.status) {
        notifyError(resUrlPresind?.msg);
        navigate(-1);
        return false;
      }

      const formDataDocumento = new FormData();
      for (let key in resUrlPresind?.obj?.result?.documento?.fields) {
        formDataDocumento.append(
          key,
          resUrlPresind?.obj?.result?.documento?.fields[key]
        );
      }
      formDataDocumento.set("file", files?.documento?.files);
      await fetchUploadFileCustom(
        resUrlPresind?.obj?.result?.documento?.url,
        formDataDocumento
      );
      const formDataFormulario = new FormData();
      for (let key in resUrlPresind?.obj?.result?.formulario?.fields) {
        console.log(resUrlPresind?.obj?.result?.formulario?.fields[key]);
        formDataFormulario.append(
          key,
          resUrlPresind?.obj?.result?.formulario?.fields[key]
        );
      }

      formDataFormulario.set("file", files?.formulario?.files);
      await fetchUploadFileCustom(
        resUrlPresind?.obj?.result?.formulario?.url,
        formDataFormulario
      );

      const resZip = await fetchData(
        url_cargueS3,
        "PUT",
        {},
        {
          key_documento: resUrlPresind?.obj?.result?.documento?.fields?.key,
          key_formulario: resUrlPresind?.obj?.result?.formulario?.fields?.key,
        }
      );
      if (!resZip?.status) {
        notifyError(resZip?.msg);
        navigate(-1);
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numSorteo"
          label="Número de sorteo"
          type="text"
          minLength="1"
          maxLength="4"
          required={true}
          autoComplete="off"
          value={sorteo}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSorteo(num);
            }
          }}
        />
        <Input
          id="numBillete"
          label="Número de billete"
          type="text"
          minLength="4" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="4"
          required={true}
          autoComplete="off"
          value={billete}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setBillete(num);
            }
          }}
        />
        <Input
          id="numSerie"
          label="Número de serie"
          type="text"
          minLength="3" /*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="3"
          required={true}
          autoComplete="off"
          value={serie}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setSerie(num);
            }
          }}
        />
        <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
          <Input
            type="checkbox"
            label="Billete Físico"
            required={true}
            value={checkBilleteFisico}
            disabled={checkDisableFisico}
            onChange={() => {
              setCheckBilleteFisico(!checkBilleteFisico);
              if (checkBilleteFisico == true) {
                setCheckDisableVirtual(false);
                setIsSelf(!isSelf);
              } else {
                setCheckDisableVirtual(true);
              }
            }}
          ></Input>

          <Input
            label="Billete Virtual"
            type="checkbox"
            required={true}
            disabled={checkDisableVirtual}
            value={checkBilleteVirtual}
            onChange={() => {
              setCheckBilleteVirtual(!checkBilleteVirtual);
              if (checkBilleteVirtual == true) {
                setCheckDisableFisico(false);
                setIsSelf(true);
              } else {
                setCheckDisableFisico(true);
              }
            }}
          ></Input>
        </div>

        <ButtonBar className="lg:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
        <SimpleLoading show={respuesta} />
      </Form>
      {showTable && totalPagar && respagar ? (
        <>
          <TableEnterprise
            title="Premios a pagar"
            headers={[
              "Descripción Premio",
              "Sorteo",
              "Número",
              "Serie",
              "Premio Neto x Fracción",
            ]}
            data={respagar}
          ></TableEnterprise>
          {tipopago === 2 && !maxPago && pagaOficina ? (
            <Form onSubmit={onPay1} grid>
              <Fieldset
                className="lg:col-span-2"
                legend={
                  "El valor del premio supera la ganancia ocasional, por favor diligencie los campos del usuario."
                }
              >
                <Input
                  id="nombre"
                  label="Nombres"
                  type="text"
                  autoComplete="off"
                  minLength={"3"}
                  maxLength={"60"}
                  value={datosCliente?.nombre}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        nombre: e.target.value,
                      };
                    });
                  }}
                  required={true}
                />
                <Input
                  id="apellido"
                  label="Apellidos"
                  type="text"
                  autoComplete="off"
                  minLength={"3"}
                  maxLength={"60"}
                  value={datosCliente?.apellido}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        apellido: e.target.value,
                      };
                    });
                  }}
                  required={true}
                />
                <Input
                  id="cedula"
                  label="Cédula"
                  type="tel"
                  minLength="5"
                  maxLength="12"
                  autoComplete="off"
                  required
                  value={datosCliente?.documento}
                  onChange={onDocChange}
                />
                <Input
                  id="numCel"
                  name="celular"
                  label="Número de celular"
                  type="tel"
                  minLength={"10"}
                  maxLength={"10"}
                  autoComplete="off"
                  required
                  value={datosCliente?.celular}
                  onChange={onCelChange}
                />
                <Input
                  id="direccion"
                  label="Dirección"
                  type="text"
                  autoComplete="off"
                  minLength={"3"}
                  maxLength={"60"}
                  required={true}
                  value={datosCliente?.direccion}
                  onInput={(e) => {
                    setDatosCliente((old) => {
                      return {
                        ...old,
                        direccion: e.target.value,
                      };
                    });
                  }}
                />
                <Select
                  id="selectFraccion"
                  label="Fracción"
                  options={fracciones_disponibles}
                  value={seleccionarFraccion}
                  required={true}
                  onChange={(e) => {
                    setSeleccionarFraccion(e.target.value);
                  }}
                />
                {checkBilleteVirtual == true ? (
                  <Input
                    id="codHash"
                    label="Código de seguridad"
                    type="text"
                    maxLength="10"
                    autoComplete="off"
                    value={hash}
                    onChange={(e) => {
                      setHash(e.target.value);
                    }}
                    required
                  />
                ) : (
                  ""
                )}
                {montoSuperior ? (
                  <Fieldset
                    className="lg:col-span-2"
                    legend={
                      "El valor del premio supera el monto estipulado, se requiere adjuntar los siguientes documentos del cliente:"
                    }
                  >
                    {files?.documento ? (
                      <label className={contenedorArchivosBasura}>
                        <h1 className=" flex flex-col md:flex-row justify-center items-center font-semibold">
                          {files?.documento?.files?.name}
                        </h1>
                        <button
                          className={btnBasura}
                          onClick={(e) => deleteField(e, "documento")}
                        >
                          <img
                            src={`${urlAssets}/assets/img/basura25negra.png`}
                          />
                        </button>
                      </label>
                    ) : (
                      <FileInput
                        id={`archivo_identificacion1`}
                        label={"Documento de identificación"}
                        name="file1"
                        accept=".pdf,.png,.jpg,.svg,.jpeg"
                        allowDrop={true}
                        onGetFile={(info) => onChangeFiles(info, "documento")}
                      />
                    )}
                    {files?.formulario ? (
                      <label className={contenedorArchivosBasura}>
                        <h1 className=" flex flex-col md:flex-row justify-center items-center font-semibold">
                          {files?.formulario?.files?.name}
                        </h1>
                        <button
                          className={btnBasura}
                          onClick={(e) => deleteField(e, "formulario")}
                        >
                          <img
                            src={`${urlAssets}/assets/img/basura25negra.png`}
                          />
                        </button>
                      </label>
                    ) : (
                      <FileInput
                        id={`archivo_formulario2`}
                        label={"Formulario"}
                        name="file2"
                        accept=".pdf,.png,.jpg,.svg,.jpeg"
                        allowDrop={true}
                        onGetFile={(info) => onChangeFiles(info, "formulario")}
                      />
                    )}
                  </Fieldset>
                ) : (
                  ""
                )}
                {checkBilleteVirtual == true || checkBilleteFisico == true ? (
                  <>
                    <ButtonBar
                      className="flex flex-row justify-center items-center
                          mx-auto container gap-10 text-lg lg:col-span-2"
                    >
                      <Button type={"button"} onClick={() => cancelar()}>
                        Cancelar
                      </Button>
                      <Button type={"submit"}>Pagar</Button>
                    </ButtonBar>
                  </>
                ) : (
                  ""
                )}
              </Fieldset>
            </Form>
          ) : (
            <>
              {!maxPago && pagaOficina ? (
                <>
                  <Form onSubmit={onPay1} grid>
                    <Fieldset
                      className="lg:col-span-2 flex justify-center items-center"
                      legend={
                        checkBilleteVirtual === true
                          ? "Por favor, Ingresar la Fracción y el Código Hash del billete a pagar."
                          : "Por favor, seleccione la Fracción del billete a pagar"
                      }
                    >
                      <Select
                        id="selectFraccion"
                        label="Fracción"
                        options={fracciones_disponibles}
                        value={seleccionarFraccion}
                        required={true}
                        onChange={(e) => {
                          setSeleccionarFraccion(e.target.value);
                        }}
                      />
                      {checkBilleteVirtual === true ? (
                        <Input
                          id="codHash1"
                          label="Código de seguridad"
                          type="text"
                          maxLength="10"
                          autoComplete="off"
                          value={hash}
                          onChange={(e) => {
                            setHash(e.target.value);
                          }}
                          required={true}
                        />
                      ) : (
                        ""
                      )}
                      {/* {checkBilleteVirtual == true ? (
                        <Input
                          id="codHash"
                          label="Código de seguridad"
                          type="text"
                          maxLength="10"
                          autoComplete="off"
                          value={hash}
                          onChange={(e) => {
                            setHash(e.target.value);
                          }}
                          required
                        />
                      ) : (
                        ""
                      )} */}
                      {montoSuperior ? (
                        <Fieldset
                          className="lg:col-span-2"
                          legend={
                            "El valor del premio supera el monto estipulado, se requiere adjuntar los siguientes documentos del cliente:"
                          }
                        >
                          {files?.documento ? (
                            <label className={contenedorArchivosBasura}>
                              <h1 className=" flex flex-col md:flex-row justify-center items-center font-semibold">
                                {files?.documento?.files?.name}
                              </h1>
                              <button
                                className={btnBasura}
                                onClick={(e) => deleteField(e, "documento")}
                              >
                                <img
                                  src={`${urlAssets}/assets/img/basura25negra.png`}
                                />
                              </button>
                            </label>
                          ) : (
                            <FileInput
                              id={`archivo_identificacion3`}
                              label={"Documento de identificación"}
                              name="file3"
                              accept=".pdf,.png,.jpg,.svg,.jpeg"
                              allowDrop={true}
                              onGetFile={(info) =>
                                onChangeFiles(info, "documento")
                              }
                            />
                          )}
                          {files?.formulario ? (
                            <label className={contenedorArchivosBasura}>
                              <h1 className=" flex flex-col md:flex-row justify-center items-center font-semibold">
                                {files?.formulario?.files?.name}
                              </h1>
                              <button
                                className={btnBasura}
                                onClick={(e) => deleteField(e, "formulario")}
                              >
                                <img
                                  src={`${urlAssets}/assets/img/basura25negra.png`}
                                />
                              </button>
                            </label>
                          ) : (
                            <FileInput
                              id={`archivo_formulario4`}
                              label={"Formulario"}
                              name="file4"
                              accept=".pdf,.png,.jpg,.svg,.jpeg"
                              allowDrop={true}
                              onGetFile={(info) =>
                                onChangeFiles(info, "formulario")
                              }
                            />
                          )}
                        </Fieldset>
                      ) : (
                        ""
                      )}
                      {checkBilleteFisico === true ||
                      checkBilleteVirtual === true ? (
                        <>
                          <ButtonBar
                            className="flex flex-row justify-center items-center
                          mx-auto container gap-10 text-lg lg:col-span-2"
                          >
                            <Button onClick={() => cancelar()}>Cancelar</Button>
                            <Button type={"submit"}>Pagar</Button>
                          </ButtonBar>
                        </>
                      ) : (
                        ""
                      )}
                    </Fieldset>
                  </Form>
                </>
              ) : (
                ""
              )}
            </>
          )}
        </>
      ) : (
        ""
      )}
      {(estadoTransaccion && tipopago === 2) || tipopago === 1 ? (
        /**************** Pago premio Exitosa Voucher **********************/
        <Modal show={estadoTransaccion} handleClose={handleClose}>
          {/* <Modal show={showAllmodals.showModalVoucher} handleClose={handleClose}> */}
          <div className="flex flex-col justify-center items-center">
            <TicketLot
              refPrint={printDiv}
              ticket={tickets}
              loteria={datosComercio.nom_loteria}
            ></TicketLot>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        </Modal>
      ) : (
        <Modal show={showAllmodals.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <div>
              <label className="font-medium">{`${estadoTransaccion}`}</label>
            </div>
          </Fieldset>
        </Modal>
      )}
    </>
  );
};

export default Premios;
