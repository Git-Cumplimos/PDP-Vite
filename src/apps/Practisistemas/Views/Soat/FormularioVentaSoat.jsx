import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import Button from "../../../../components/Base/Button";
import { v4 as uuidv4 } from "uuid";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import { useAuth } from "../../../../hooks/AuthHooks";
import Select from "../../../../components/Base/Select";
import Fieldset from "../../../../components/Base/Fieldset";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import Tickets from "../../../../components/Base/Tickets";
import classes from "./FormularioVentaSoat.module.css";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  estadoReintentoPagoSoat,
  fetchConsultarSoat,
  fetchTransaccionSoat,
} from "../../utils/fetchSoat";
const FormularioVentaSoat = () => {
  const { contenedorbtn } = classes;
  const navigate = useNavigate();
  const printDiv = useRef();
  const { roleInfo, infoTicket, userInfo } = useAuth();
  const [datosPropietarioSoat, setDatosPropietarioSoat] = useState({
    tipoDocumento: "1",
    nombrePropietario: "",
    apellidoPropietario: "",
    sexoPropietarioSoat: "",
    ciudadPropietarioSoat: "",
    departamentoPropietarioSoat: "",
    numCelular: "",
    marca: "",
    modelo: "",
    linea: "",
    numeroChasis: "",
    claseSoat: "",
    operadorClaseSoat: "",
    valorSoat: "",
    idTransaccion: "",
    documento: "",
    numPlacaPropietario: "",
    respuestaConsulta: "",
    codigoauth: "",
  });

  //******************* Variables de estado MODALES***************
  const [showAllmodals, setShowAllmodals] = useState({
    showModalVoucher: false,
    voucherAprobado: false,
    showModalDatosPropietario: false,
    showModalError: false,
    showModalconfirmacionVentaSoat: false,
    showLoading: false,
  });
  // **************************************************************

  // ################# Codigo para seleccionar el tipo de documento----------------
  const optionsDocumento = [
    { value: "", label: "" },
    { value: "1", label: "Cédula Ciudadanía" },
    { value: "3", label: "NIT" },
  ];
  // ------------------------------------------------------------------------------

  //-------------------------------------------------------------------------------
  //------------------Funcion Para consultar a practisistemas pero por clases---------
  const consultarSoat = (e) => {
    e.preventDefault();
    if (String(datosPropietarioSoat?.numCelular).charAt(0) === "3") {
      setShowAllmodals((old) => {
        return { ...old, showLoading: true };
      });
      fetchConsultarSoat({
        oficina_propia:
          roleInfo?.tipocomercio == "OFICINAS PROPIAS" ? true : false,
        nombre_comercio: roleInfo?.["nombre comercio"],
        // valor_total_trx: datosPropietarioSoat?.valorSoat,
        valor_total_trx: "0",
        comercio: {
          id_comercio: roleInfo?.["id_comercio"],
          id_usuario: roleInfo?.["id_usuario"],
          id_terminal: roleInfo?.["id_dispositivo"],
        },
        jsonSoatConsulta: {
          // tipoConsulta: "chkPlacaSoat",
          data: {
            placa: datosPropietarioSoat?.numPlacaPropietario,
            docSoat: datosPropietarioSoat?.documento,
            chkTipoDoc: datosPropietarioSoat?.tipoDocumento,
          },
        },
      })
        .then((res) => {
          setDatosPropietarioSoat((old) => {
            return {
              ...old,
              marca: res?.obj?.marca,
              linea: res?.obj?.linea,
              modelo: res?.obj?.modelo,
              numeroChasis: res?.obj?.no_chasis,
              respuestaConsulta: res?.obj?.respuesta,
              claseSoat: res?.obj?.clase_soat,
              nombrePropietario: res?.obj?.nombre,
              apellidoPropietario: res?.obj?.apellido,
              sexoPropietarioSoat: res?.obj?.sexo,
              ciudadPropietarioSoat: res?.obj?.ciudadtxt,
              departamentoPropietarioSoat: res?.obj?.dptoNum,
              valorSoat: res?.obj?.valor,
            };
          });
          if (res?.estado == "05") {
            setShowAllmodals((old) => {
              return { ...old, showLoading: false };
            });
            if (
              res?.msg == "Error consultando Informacion, Quiza placa no existe"
            ) {
              notifyError(
                "Error consultando Informacion, Quiza placa no existe"
              );
            } else if (res?.respuesta == "Consulta con error") {
              notifyError("Consulta con error, Quiza cédula no existe");
            }
          }
          if (res?.obj?.clase_soat == "1") {
            setDatosPropietarioSoat((old) => {
              return { ...old, operadorClaseSoat: "s2" };
            });
          } else if (
            res?.obj?.clase_soat == "2" ||
            res?.obj?.clase_soat == "3" ||
            res?.obj?.clase_soat == "4" ||
            res?.obj?.clase_soat == "5"
          ) {
            setDatosPropietarioSoat((old) => {
              return { ...old, operadorClaseSoat: "so" };
            });
          } else {
            setDatosPropietarioSoat((old) => {
              return { ...old, operadorClaseSoat: "s3" };
            });
          }
          setShowAllmodals((old) => {
            return { ...old, showLoading: false };
          });
        })
        .catch((err) => {
          notifyError(
            "No se ha logrado una conexion a (//transaciones)...Connection to servicios-trxs"
          );
          navigate(`/ventaSeguros`);
          setShowAllmodals((old) => {
            return { ...old, showModalError: true };
          });
        });
      setShowAllmodals((old) => {
        return { ...old, showModalDatosPropietario: true };
      });
    } else {
      notifyError(
        "Numero invalido, el N° de celular debe comenzar con el número 3."
      );
    }
  };

  // ******************************************************************************
  //-----------------------Generación de los Tikets--------------------------------------------------
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
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", datosPropietarioSoat?.idTransaccion],
        ["Id Aut ", datosPropietarioSoat?.codigoauth],
        ["Municipio", roleInfo?.ciudad],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
        ["SERVICIO VENTA SOAT"],
      ],
      trxInfo: [
        ["", ""],
        ["DATOS DEL PROPIETARIO DEL VEHICULO"],
        ["Nombre", datosPropietarioSoat?.nombrePropietario],
        ["Apellido", datosPropietarioSoat?.apellidoPropietario],
        ["Placa", datosPropietarioSoat?.numPlacaPropietario],
        ["Celular", datosPropietarioSoat?.numCelular],
        ["Linea", datosPropietarioSoat?.linea],
        ["Valor", datosPropietarioSoat?.valorSoat],
        ["", ""],
        ["Proceso", "Transacción Venta SOAT"],
      ],

      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [datosPropietarioSoat?.idTransaccion]);
  // ------------------------Finaliza codigo de la generación del tikeck-----------------------------
  //------------------Funcion Para hacer petición pracrec (Transacción)------------
  const transaccion = (e) => {
    const uniqueId = uuidv4();
    setShowAllmodals((old) => {
      return { ...old, showLoading: true };
    });
    fetchTransaccionSoat({
      oficina_propia:
        roleInfo?.tipocomercio == "OFICINAS PROPIAS" ? true : false,
      nombre_comercio: roleInfo?.["nombre comercio"],
      valor_total_trx: datosPropietarioSoat?.valorSoat,
      ticket: tickets,
      comercio: {
        id_comercio: roleInfo?.["id_comercio"],
        id_usuario: roleInfo?.["id_usuario"],
        id_terminal: roleInfo?.["id_dispositivo"],
        id_uuid_trx: uniqueId,
      },
      jsonSoat: {
        celular: datosPropietarioSoat?.numCelular,
        operador: datosPropietarioSoat?.operadorClaseSoat,
        valor: datosPropietarioSoat?.valorSoat,
        jsonAdicional: {
          nombreSoat: datosPropietarioSoat?.nombrePropietario,
          apellidoSoat: datosPropietarioSoat?.apellidoPropietario,
          sexoSoat: datosPropietarioSoat?.sexoPropietarioSoat,
          documentoSoat: datosPropietarioSoat?.documento,
          nDocumentoSoat: datosPropietarioSoat?.documento,
          ciudadSoat: datosPropietarioSoat?.ciudadPropietarioSoat,
          departamentoSoat: datosPropietarioSoat?.departamentoPropietarioSoat,
          direccionSoat: "",
          emailSoat: "",
          modeloCarro: datosPropietarioSoat?.modelo,
          placaSoat: datosPropietarioSoat?.numPlacaPropietario,
          valorSoat: datosPropietarioSoat?.valorSoat,
          Soattx_id: "89174", //No se puede quemar este valor***********************
          tipoSoat: datosPropietarioSoat?.claseSoat,
          linea: datosPropietarioSoat?.linea,
          idtrans: datosPropietarioSoat?.idTransaccion,
          nombre_usuario: userInfo?.attributes?.name,
        },
      },
    })
      .then((res) => {
        if (res?.status === true) {
          notify("Transaccion exitosa");
          setShowAllmodals((old) => {
            return { ...old, showLoading: false };
          });
          setDatosPropietarioSoat((old) => {
            return {
              ...old,
              idTransaccion: res.obj.response.idtrans,
              codigoauth: res.obj.response.codigoauth,
            };
          });
        } else {
          notifyError(res?.msg);
          setShowAllmodals((old) => {
            return { ...old, showLoading: false };
          });
          navigate(`/ventaSeguros`);
        }
      })
      .catch(async (err) => {
        notify("Transacción en proceso, por favor espere");
        for (let i = 0; i <= 8; i++) {
          try {
            const prom = await new Promise((resolve, reject) =>
              setTimeout(() => {
                estadoReintentoPagoSoat({
                  idComercio: roleInfo?.["id_comercio"],
                  idTerminal: roleInfo?.["id_dispositivo"],
                  idUsuario: roleInfo?.["id_usuario"],
                  id_uuid_trx: uniqueId,
                })
                  .then((res) => {
                    if (res?.msg !== "Procesando") {
                      if (
                        res?.status === true ||
                        res?.obj?.response?.estado == "00"
                      ) {
                        notify("Transaccion exitosa");
                        setShowAllmodals((old) => {
                          return { ...old, showLoading: false };
                        });
                        setDatosPropietarioSoat((old) => {
                          return {
                            ...old,
                            idTransaccion: res.obj.response.idtrans,
                          };
                        });
                      } else {
                        notifyError(res?.obj?.response?.["respuesta"]);
                        setShowAllmodals((old) => {
                          return {
                            ...old,
                            showLoading: true,
                            showModalDatosPropietario: false,
                          };
                        });
                        resolve(true);
                      }
                    } else {
                      setShowAllmodals((old) => {
                        return {
                          ...old,
                          showLoading: true,
                        };
                      });
                      resolve(false);
                    }
                  })
                  .catch(async (err) => {
                    notify("Estamos resolviendo tu petición, por favor espere");
                    setShowAllmodals((old) => {
                      return { ...old, showLoading: false };
                    });
                  });
              }, 11000)
            );
            if (prom == true) {
              setShowAllmodals((old) => {
                return { ...old, showLoading: false };
              });
              setShowAllmodals((old) => {
                return {
                  ...old,
                  showModalDatosPropietario: false,
                  showModalconfirmacionVentaSoat: false,
                  voucherAprobado: true,
                  showModalVoucher: true,
                };
              });
              handleClose();
              break;
            }
          } catch (error) {}
        }
      });
  };
  //---------------------------------------------------------------------------------------------

  //------------------Funcion Para Modal Que Cierra Pestañas-------------------------------------
  const handleClose = useCallback(() => {
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        showModalVoucher: false,
        showModalconfirmacionVentaSoat: false,
      };
    });
    setDatosPropietarioSoat((old) => {
      return {
        ...old,
        marca: "",
        linea: "",
        modelo: "",
        respuestaConsulta: "",
      };
    });
    navigate(`/ventaSeguros`);
  }, []);
  //-----------------------Botón Cancelar--------------------------------------------------------
  const cancelar = () => {
    notifyError("Se cancelo la venta del SOAT");
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        voucherAprobado: false,
        showModalVoucher: false,
        showModalconfirmacionVentaSoat: false,
      };
    });
    setDatosPropietarioSoat((old) => {
      return {
        ...old,
        numPlacaPropietario: "",
        documento: "",
        numCelular: "",
      };
    });
  };
  // ---------------------------------------------------------------------------------------------
  // --------------------Modal de Confirmación----------------------------------------------------
  const confirmarTransaccion = () => {
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        showModalconfirmacionVentaSoat: true,
      };
    });
  };
  //------------------------------------------------------------------------------------------------

  // ************************ Función para imprimir #################################################
  const handlePrint = useReactToPrint({
    content: () => printDiv?.current,
  });
  // ************************ Termina Función para imprimir #################################################

  // #########UseEffect para guardar el ticket en la base de datos de PDP#############################
  useEffect(() => {
    infoTicket(datosPropietarioSoat?.idTransaccion, 114, tickets)
      .then((resTicket) => {})
      .catch((err) => {
        console.error(err);
        notifyError("Error guardando el ticket");
      });
  }, [infoTicket, datosPropietarioSoat?.idTransaccion, tickets]);
  // ##############################################################################
  // ------------------------------------------------------------------------------
  //------------------Funcion de transacción aprobada------------------------------
  const transaccionAprobada = () => {
    setShowAllmodals((old) => {
      return {
        ...old,
        showModalDatosPropietario: false,
        showModalconfirmacionVentaSoat: false,
        voucherAprobado: true,
        showModalVoucher: true,
      };
    });
    transaccion();
  };
  //-------------------------------------------------------------------------------
  //------------------Funcion para validar el número del celular------------------------------
  const onCelChange = (e) => {
    const valueInput = ((e.target.value ?? "").match(/\d/g) ?? []).join("");

    if (valueInput[0] != 3) {
      if (valueInput.length == 1 && datosPropietarioSoat?.numCelular == "") {
        notifyError(
          "Número inválido, el No. de celular debe comenzar con el número 3"
        );
        return;
      }
    }
    setDatosPropietarioSoat((old) => {
      return { ...old, numCelular: valueInput };
    });
  };
  //-------------------------------------------------------------------------------

  return (
    <>
      <SimpleLoading show={showAllmodals.showLoading} />
      <h1 className="text-3xl">Datos del propietario del vehiculo</h1>
      <Form onSubmit={(e) => consultarSoat(e)} grid>
        {/************Selección tipo de documento******************* */}
        <Select
          id="tipoDocumento"
          label="Tipo de documento"
          options={optionsDocumento}
          value={datosPropietarioSoat?.tipoDocumento}
          onChange={(e) => {
            setDatosPropietarioSoat((old) => {
              return { ...old, tipoDocumento: e.target.value };
            });
          }}
          required
        />
        {/************Input Numero de documento******************* */}
        <Input
          id="numDocumento"
          label="Documento"
          type="text"
          required
          minLength="8"
          maxLength="12"
          autoComplete="off"
          value={datosPropietarioSoat?.documento}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setDatosPropietarioSoat((old) => {
              return { ...old, documento: num };
            });
          }}
        />
        {/************Input PLACA vehiculo******************* */}
        <Input
          id="numPlaca" //la puse pero debo invocarla
          label="# Placa"
          type="text"
          required
          minLength="5"
          maxLength="12"
          autoComplete="off"
          value={datosPropietarioSoat?.numPlacaPropietario}
          onInput={(e) => {
            const placa = e.target.value;
            setDatosPropietarioSoat((old) => {
              return { ...old, numPlacaPropietario: placa };
            });
          }}
        />
        {/************Input Número de celular******************* */}
        <Input
          name="celular"
          label="Número de celular"
          type="tel"
          autoComplete="off"
          minLength={"10"}
          maxLength={"10"}
          value={datosPropietarioSoat?.numCelular}
          onChange={onCelChange}
          required
        />
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">Realizar Consulta</Button>
        </ButtonBar>
      </Form>
      {datosPropietarioSoat?.respuestaConsulta == "Consulta Correcta" &&
      datosPropietarioSoat?.nombrePropietario ? (
        <Modal
          show={showAllmodals.showModalDatosPropietario}
          handleClose={handleClose}>
          <Fieldset legend="Datos Propietario">
            <Form onSubmit={(e) => consultarSoat(e)} className="lg:col-span-2">
              <div className="grid gap-4 hover:gap-6">
                <div className="m-2 space-x-48">
                  <label className="font-semibold text-xl">{`Nombre:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.nombrePropietario}`}</label>
                </div>
                <div className="m-2 space-x-48">
                  <label className="font-semibold text-xl">{`Apellido:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.apellidoPropietario}`}</label>
                </div>
                <div className="m-2 space-x-56">
                  <label className="content-center font-semibold text-xl">{`Marca:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.marca}`}</label>
                </div>
                <div className="m-2 space-x-52">
                  <label className="font-semibold text-xl">{`Modelo:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.modelo}`}</label>
                </div>
                <div className="m-2 space-x-48">
                  <label className="font-semibold text-xl">{`Linea:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.linea}`}</label>
                </div>
                <div className="m-2 space-x-52">
                  <label className="font-semibold text-xl">{`Clase Soat:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.claseSoat}`}</label>
                </div>
                <div className="m-2 space-x-28">
                  <label className="font-semibold text-xl">{`Número del Motor:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.numeroChasis}`}</label>
                </div>
                <div className="m-2 space-x-24">
                  <label className="font-semibold text-xl">{`Número de Celular:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.numCelular}`}</label>
                </div>
                <div className="m-2 space-x-48">
                  <label className="font-semibold text-xl">{`Valor Soat:`}</label>
                  <label className="font-medium">{`${datosPropietarioSoat?.valorSoat}`}</label>
                </div>
              </div>
              <div className={contenedorbtn}>
                <ButtonBar>
                  <Button onClick={() => cancelar()}>Cancelar</Button>
                </ButtonBar>
                <ButtonBar className="lg:col-span-2">
                  <Button type="" onClick={() => confirmarTransaccion()}>
                    Realizar Venta SOAT
                  </Button>
                </ButtonBar>
              </div>
            </Form>
          </Fieldset>
        </Modal>
      ) : (
        /*************** Compra Exitosa Generación Voucher **********************/
        <Modal show={showAllmodals.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <Input
              label={"Respuesta"}
              defaultValue={datosPropietarioSoat?.respuestaConsulta}
              placeholder={datosPropietarioSoat?.marca}
              disabled></Input>
          </Fieldset>
        </Modal>
      )}
      {datosPropietarioSoat?.valorSoat ? (
        <Modal
          show={showAllmodals.showModalconfirmacionVentaSoat}
          handleClose={handleClose}>
          {/**************** Resumen de la Compra Soat **********************/}
          <PaymentSummary
            title="¿Está seguro de realizar la compra del SOAT?"
            subtitle="Resumen de transacción"
            summaryTrx={{
              Nombre: datosPropietarioSoat?.nombrePropietario,
              Apellido: datosPropietarioSoat?.apellidoPropietario,
              Celular: datosPropietarioSoat?.numCelular,
              Valor: datosPropietarioSoat?.valorSoat,
            }}>
            <>
              <ButtonBar>
                <Button onClick={() => cancelar()}>Cancelar</Button>
                <Button type="" onClick={() => transaccionAprobada()}>
                  Aceptar
                </Button>
              </ButtonBar>
            </>
          </PaymentSummary>
        </Modal>
      ) : (
        ""
      )}
      {showAllmodals?.voucherAprobado && datosPropietarioSoat?.idTransaccion ? (
        /**************** Compra Soat Exitosa Voucher **********************/
        <Modal show={showAllmodals.showModalVoucher} handleClose={handleClose}>
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} ticket={tickets}></Tickets>
            <ButtonBar>
              <Button onClick={handlePrint}>Imprimir</Button>
              <Button onClick={handleClose}>Cerrar</Button>
            </ButtonBar>
          </div>
        </Modal>
      ) : (
        /*************** Compra Soat Exitosa Voucher **********************/
        <Modal show={showAllmodals.showModalError} handleClose={handleClose}>
          <Fieldset legend="Datos Erroneos ">
            <div>
              <label className="font-medium">{`${datosPropietarioSoat?.respuestaConsulta}`}</label>
            </div>
          </Fieldset>
        </Modal>
      )}
    </>
  );
};

export default FormularioVentaSoat;
