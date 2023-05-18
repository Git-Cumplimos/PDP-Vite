import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { useReactToPrint } from "react-to-print";
import { notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { enumParametrosPines } from "../../utils/enumParametrosPines";
import { useNavigate } from "react-router-dom";
import Tickets from "../../../../components/Base/Tickets";

const dateFormatter = Intl.DateTimeFormat("az", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

//const url_cargueS3 = `${process.env.REACT_APP_URL_PinesVus}/CargueS3`;

const Participacion = () => {
  const navigate = useNavigate();

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });
  // const { infoTicket} = useAuth();
  

  const { consultaParticipacion, registroPagoParticipacion} = usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [table, setTable] = useState([]);
  const [selected, setSelected] = useState(true);
  const { roleInfo } = useAuth();
  const [showModal, setShowModal] = useState(false)
  const [banco, setBanco] = useState("")
  const [numCuenta, setNumCuenta] = useState("")
  const [numTransaccion, setNumTransaccion] = useState("")
  const [numAprobacion, setNumAprobacion] = useState("")
  const [disabledBtns, setDisabledBtns] = useState(false)
  const [respPago, setRespPago] = useState("")
  const [fecha_ini, setFecha_ini] = useState("")
  const [pagoParticipacion, setPagoParticipacion] = useState(false)
  // const [nombreArchivo, setNombreArchivo] = useState("")

  // const [archivo, setArchivo] = useState("");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [ticketPago, setTicketPago] = useState("")

  const [objTicketActual, setObjTicketActual] = useState({
    title: "Recibo de pago participante pines vus",
    timeInfo: {
      "Fecha de venta": "",
      Hora: "",
    },
    commerceInfo: [
      /*id_comercio*/
      ["Id comercio", roleInfo?.id_comercio ? roleInfo?.id_comercio : 1],
      /*id_dispositivo*/
      ["No. terminal", roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 1],

      ["Id Trx", ""],
      ["", ""],
      ["Comercio", roleInfo?.["nombre comercio"]],
      ["", ""],
      /*direccion*/
      ["Dirección", roleInfo?.direccion ? roleInfo?.direccion : "No hay datos"],
      ["", ""],

  
    ],
    commerceName: "",
    trxInfo: [
      ["Fecha participación", ""],
      ["",""],
      ["Valor Trámite", ""],
      ["",""],
      ["Recibido", "______________________"],
      ["",""]
    ],
    disclamer: "Para quejas o reclamos comuníquese al 3503485532 (Servicio al cliente) o al 3102976460 (chatbot)",
  });



  useEffect(() => {
    if (
      (fecha_ini !== "")){
    consultaParticipacion(fecha_ini)
      .then((res) => {
        setTable([]);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setTable(res?.obj?.results)
        }
      })
      .catch((err) => console.log("error", err));
    }    
  }, [showModal, consultaParticipacion,fecha_ini]);

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setRespPago("")
    setTable([])
    setBanco("")
    setNumAprobacion("")
    setNumCuenta("")
    setNumTransaccion("")
    setDisabledBtns(false)
    setFile("")
    setFileName("")
  }, []);
  const onSubmit = (e) => { 
    e.preventDefault();
    setDisabledBtns(true)

    const fecha = Intl.DateTimeFormat("es-CO", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    /*hora actual */
    const hora = Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());

    const objTicket = { ...objTicketActual };
    objTicket["timeInfo"]["Fecha de venta"] = fecha;
    objTicket["timeInfo"]["Hora"] = hora;
    objTicket["commerceName"] = "Pago a " + selected.aliado
    objTicket["trxInfo"][0] = ["Fecha participación", fecha_ini]
    objTicket["trxInfo"][2] = ["Valor Trámite", formatMoney.format(selected.total_pago)]


    registroPagoParticipacion(
      selected.aliado,
      selected.id,
      selected.total_pago,
      fecha_ini,
      objTicket
    ).then((res) => {
        setDisabledBtns(false)
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setRespPago(res?.obj)
          objTicket["commerceInfo"][2] = ["Id trx", res?.obj?.id_transaccion_pdp]
          setTicketPago(objTicket)
        }
    }).catch(() => setDisabledBtns(false));    
  }
  
  // const tickets = useMemo(() => {
  //   return {
  //     title: "Recibo de pago participante pines vus",
  //     timeInfo: {
  //       "Fecha de pago": Intl.DateTimeFormat("es-CO", {
  //         year: "numeric",
  //         month: "numeric",
  //         day: "numeric",
  //       }).format(new Date()),
  //       Hora: Intl.DateTimeFormat("es-CO", {
  //         hour: "numeric",
  //         minute: "numeric",
  //         second: "numeric",
  //         hour12: false,
  //       }).format(new Date()),
  //     },
  //     commerceInfo: Object.entries({
  //       "Id Comercio": roleInfo?.id_comercio,
  //       "No. terminal": roleInfo?.id_dispositivo,
  //       Municipio: roleInfo?.ciudad,
  //       Dirección: roleInfo?.direccion,
  //       "Id Trx": respPago?.id_transaccion_pdp,
  //     }),
  //     commerceName: "Pago a " + respPago?.participante,
  //     trxInfo: [
  //       ["Fecha participación", fecha_ini],
  //       ["",""],
  //       ["Valor Trámite", formatMoney.format(respPago?.valor)],
  //       ["",""],
  //       ["Recibido", "______________________"],
  //       ["",""]
  //     ],
  //     disclamer:
  //       "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
  //   };
  // }, [roleInfo, respPago, formatMoney, fecha_ini]);

  // useEffect(() => {
  //   infoTicket(
  //     respPago?.id_transaccion_pdp,
  //     respPago?.tipo_trx,
  //     tickets
  //   );
  // }, [infoTicket, respPago, tickets]);

  const hora = useMemo(() => {    
    return Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
  }, [table]);

  const horaCierre = useMemo(() => { 
    const dia = (new Date()).getDay()  
    if (dia === enumParametrosPines.diaFinSemana) {
      return enumParametrosPines.horaCierreFinSemana.split(":") 
    }
    else{
      return enumParametrosPines.horaCierre.split(":")
    }
     
  }, []);

  useEffect(() => {
    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(horaActual[1])
    
    if (!(deltaHora<0 || (deltaHora===0 & deltaMinutos<1)) & dateFormatter.format(new Date())===fecha_ini){
      setPagoParticipacion(false)
    }
    else{
      setPagoParticipacion(true)
    }
  }, [table, hora, horaCierre, fecha_ini,navigate])
  return (
    <>
      <>
        <TableEnterprise
          title="Participación"
          headers={[
            "Aliado",
            "Valor",
            "Devolución",
            "# Devoluciones",
            "Total",
            "Pagado"
          ]}
          data={table.map((row) => {
            return {
              Aliado: row?.aliado,
              Valor: formatMoney.format(row?.valor),
              Devolución: formatMoney.format(row?.devolucion),
              "# Devoluciones": (row?.pines_cancelados),
              Total: formatMoney.format(row?.total_pago),
              Pagado: row?.pagado ? "Si": "No",
              
            };
          }) || []}
          onSelectRow={(e, index) => {            
              setSelected(table[index]);
              
              if (table[index].pagado === false){
                setShowModal(true)
              }
              else{
                notifyError("El pago a " + table[index].aliado + " ya se realizo")
              }  
                 
          }}
        >
          <Input
            id="dateInit"
            label="Fecha participación"
            type="date"
            value={fecha_ini}
            onInput={(e) => setFecha_ini(e.target.value)}
          />
        </TableEnterprise>
      </>
      <Modal show={showModal} handleClose={() => closeModal()}>
      {respPago !== ""? 
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={ticketPago} />
          <ButtonBar>
            <Button
              onClick={() => {
                handlePrint();
              }}
            >
              Imprimir
            </Button>
            <Button
              onClick={() => {
                closeModal();
              }}
            >
              Cerrar
            </Button>
          </ButtonBar>
        </div>
        :
      <>
            <div className="flex flex-col w-1/2 mx-auto ">
              <h1 className="text-3xl mt-3 mx-auto">Pago {selected.aliado}</h1>
              <br></br>
            </div>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmit} grid>
                <Input
                id="valor"
                label="Valor pago"
                type="text"
                autoComplete="off"
                value={formatMoney.format(selected.total_pago)}
                required
                />
                {/* <Input
                id="banco"
                label="Banco consignacion"
                type="text"
                autoComplete="off"
                value={banco}
                onInput={(e) => {
                  setBanco(e.target.value);
                }}
                required
                />
                <Input
                id="numCuenta"
                label="No Cuenta"
                type="text"
                autoComplete="off"
                value={numCuenta}
                onInput={(e) => {
                  if (!isNaN(e.target.value)) {
                    const num = e.target.value;
                    setNumCuenta(num);
                  }
                  
                }}
                required
                />
                <Input
                id="numTransaccion"
                label="No Transaccion"
                type="text"
                autoComplete="off"
                value={numTransaccion}
                onInput={(e) => {
                  if (!isNaN(e.target.value)) {
                    const num = e.target.value;
                    setNumTransaccion(num);
                  }
                  
                }}
                required
                />
                <Input
                id="numAprobacion"
                label="No Aprobacion"
                type="text"
                autoComplete="off"
                value={numAprobacion}
                onInput={(e) => {
                  if (!isNaN(e.target.value)) {
                    const num = e.target.value;
                    setNumAprobacion(num);
                  }
                  
                }}
                required
                />
                <InputX
                  id={`archivo`}
                  label={`Elegir archivo: ${fileName}`}
                  type="file"
                  disabled={progress !== 0}
                  accept=".jpg,.png"
                  onGetFile={onChange}
                />
                {file && progress === 0 ? (
                  <ButtonBar>
                    <Button 
                    type="button"
                    onClick={() => {
                      onSubmitArchivo();
                    }} 
                     >Subir</Button>
                  </ButtonBar>
                ) : (
                  ""
                )} */}
                
                <ButtonBar>
                  <Button type="submit" disabled={disabledBtns}>Registrar</Button>
                  <Button
                  onClick={() => {
                    closeModal();
                  }}
                >
                  Cancelar
                </Button>
                </ButtonBar>
              </Form>
            </div>
          </>
      }
      </Modal>

    </>
  );
};
export default Participacion;
