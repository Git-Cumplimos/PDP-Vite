import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import { usePinesVus } from "../../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { notify, notifyError } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { enumParametrosPines } from "../../utils/enumParametrosPines";
import { useNavigate } from "react-router-dom";
import Tickets from "../../../../components/Base/Tickets";
import InputX from "../../../../components/Base/InputX/InputX";
import fetchData from "../../../../utils/fetchData";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const url_cargueS3 = `${process.env.REACT_APP_URL_PinesVus}/CargueS3`;

const Participacion = () => {
  const navigate = useNavigate();

  const printDiv = useRef();
  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    // pageStyle: "@page {size: 80mm 160mm; margin: 0; padding: 0;}",
  });
  const { infoTicket} = useAuth();
  

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
  // const [nombreArchivo, setNombreArchivo] = useState("")

  // const [archivo, setArchivo] = useState("");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");

  // const onChange = (files) => {
  //   console.log(file);
  //   if (Array.isArray(Array.from(files))) {
  //     files = Array.from(files);
  //     if (files.length === 1) {
  //       const m_file = files[0];
  //       console.log(m_file);
  //       setFile(m_file);
  //       setFileName(m_file.name);
  //     } else {
  //       if (files.length > 1) {
  //         notifyError("Se debe ingresar un solo archivo para subir");
  //       }
  //     }
  //   }
  // };

  // const onSubmitArchivo = useCallback(
  //   (e) => {
  //     console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
  //     const f = new Date();
  //     const query = {
  //       contentType: "application/text",
  //       filename: `vouchersPagoParticipacion/voucherPago_${selected.aliado}_${f.getDate()}${
  //         f.getMonth() + 1
  //       }${f.getFullYear()}/${fileName}`,
  //     };
  //     console.log(query.filename)
  //     fetchData(url_cargueS3, "GET", query)
  //       .then((respuesta) => {
  //         if (!respuesta?.status) {
  //           notifyError(respuesta?.msg);
  //         } else {
  //           // setEstadoForm(true);
  //           const formData2 = new FormData();
  //           if (file) {
  //             for (const property in respuesta?.obj?.fields) {
  //               formData2.set(
  //                 `${property}`,
  //                 `${respuesta?.obj?.fields[property]}`
  //               );
  //             }
  //             formData2.set("file", file);
  //             console.log(formData2, `${respuesta?.obj?.url}`);
  //             fetch(`${respuesta?.obj?.url}`, {
  //               method: "POST",
  //               body: formData2,
  //             }).then((res) => {
  //               if (res?.ok) {
  //                 notify("El voucher fue cargado")
  //               } else {
  //                 notifyError("No fue posible conectar con el Bucket");
  //               }
  //             }).catch((err) => {
  //               console.log(err, "ERROR ********")
  //             });
  //           }
  //         }
  //       })
  //       .catch((err) => {
  //         notifyError("Error al cargar Datos");
  //       }); /* notify("Se ha comenzado la carga"); */
  //   },
  //   [file, fileName, archivo]
  // );


  useEffect(() => {
    consultaParticipacion()
      .then((res) => {
        setTable([]);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setTable(res?.obj?.results)
        }
      })
      .catch((err) => console.log("error", err));
    
  }, [showModal]);

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

  // const onSubmit = (e) => { 
  //   e.preventDefault();
  //   setDisabledBtns(true)
  //   console.log(selected)
  //   const f = new Date()
  //   registroPagoParticipacion(
  //     selected.aliado, 
  //     banco, 
  //     numCuenta, 
  //     numAprobacion, 
  //     numTransaccion,
  //     selected.valor,
  //     `vouchersPagoParticipacion/voucherPago_${selected.aliado}_${f.getDate()}${
  //       f.getMonth() + 1
  //     }${f.getFullYear()}/`,
  //   ).then((res) => {
  //       console.log(res)
  //       setDisabledBtns(false)
  //       if (!res?.status) {
  //         notifyError(res?.msg);
  //       } else {
  //         setRespPago(res?.obj)
  //       }
  //   }).catch(() => setDisabledBtns(false));    
  // }

  const onSubmit = (e) => { 
    e.preventDefault();
    setDisabledBtns(true)
    console.log(selected)
    const f = new Date()
    registroPagoParticipacion(
      selected.aliado, 
      //banco, 
      //numCuenta, 
      //numAprobacion, 
      //numTransaccion,
      selected.valor,
      // `vouchersPagoParticipacion/voucherPago_${selected.aliado}_${f.getDate()}${
      //   f.getMonth() + 1
      // }${f.getFullYear()}/`,

    ).then((res) => {
        console.log(res)
        setDisabledBtns(false)
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setRespPago(res?.obj)
        }
    }).catch(() => setDisabledBtns(false));    
  }

  const tickets = useMemo(() => {
    return {
      title: "Recibo de pago participante pines vus",
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
      commerceInfo: Object.entries({
        "Id Comercio": roleInfo?.id_comercio,
        "No. terminal": roleInfo?.id_dispositivo,
        Municipio: roleInfo?.ciudad,
        Dirección: roleInfo?.direccion,
        "Id Trx": respPago?.id_transaccion_pdp,
      }),
      commerceName: "Pago a " + respPago?.participante,
      trxInfo: [
        ["Valor Tramite", formatMoney.format(respPago?.valor)],
        ["",""],
        ["Recibido", "______________________"],
        ["",""]
      ],
      disclamer:
        "Para quejas o reclamos comuniquese al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [roleInfo, respPago]);

  useEffect(() => {
    infoTicket(
      respPago?.id_transaccion_pdp,
      respPago?.tipo_trx,
      tickets
    );
  }, [infoTicket, respPago, tickets]);

  const hora = useMemo(() => {    
    return Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
  }, [table]);

  useEffect(() => {
    const horaCierre = enumParametrosPines.horaCierre.split(":")
    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(horaActual[1])
    if (!(deltaHora<0 || (deltaHora===0 & deltaMinutos<1)) ){
      notifyError("Modulo disponible a partir de las " + enumParametrosPines.horaCierre)
      navigate("/PinesVus/Participacion");
    }
  }, [table])
  return (
    <>
      <>
        <TableEnterprise
          title="Participacion"
          headers={[
            "Aliado",
            "Valor",
            "Pagado"
          ]}
          data={table.map((row) => {
            return {
              Aliado: row?.aliado,
              Valor: formatMoney.format(row?.valor),
              Pagado: row?.pagado ? "Si": "No",
              
            };
          }) || []}
          onSelectRow={(e, index) => {            
              setSelected(table[index]);
              console.log(table[index])
              if (table[index].pagado === false){
                setShowModal(true)
              }
              else{
                notifyError("El pago a " + table[index].aliado + " ya se realizo")
              }            
          }}
        >
        </TableEnterprise>
      </>
      <Modal show={showModal} handleClose={() => closeModal()}>
      {respPago !== ""? 
        <div className="flex flex-col justify-center items-center">
          <Tickets refPrint={printDiv} ticket={tickets} />
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
                value={formatMoney.format(selected.valor)}
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
