import { useCallback, useState, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { notifyError, notify } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import UsarPinForm from "../components/UsarPinForm/UsarPinForm";
import CancelPin from "../components/CancelPinForm/CancelPinForm";
import { useNavigate } from "react-router-dom";
import { enumParametrosPines } from "../utils/enumParametrosPines";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const TramitePines = () => {
  const navigate = useNavigate();
  const { consultaPinesVus, reenvioHash, activarNavigate, setActivarNavigate, consultaCierreManual } =
    usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [parametroBusqueda, setParametroBusqueda] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [info, setInfo] = useState("");
  const [table, setTable] = useState("");
  const [formatMon, setFormatMon] = useState("");
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState("");
  const [modalUsar, setModalUsar] = useState("");
  const [modalCancel, setModalCancel] = useState("");
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(1);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [valor, setValor] = useState("");
  const [id_trx, setId_trx] = useState("");
  const [tipoPin, setTipoPin] = useState("");
  const [valor_tramite, setValor_tramite] = useState("");
  const [name_tramite, setName_tramite] = useState("");
  const [id_pin, setId_pin] = useState("")
  const [showModalReenvio, setShowModalReenvio] = useState(false)
  const [doc_cliente, setDoc_cliente] = useState("")
  const [cierreManual, setCierreManual] = useState(false)
  const [infoComercioCreacion, setInfoComercioCreacion] = useState("")

  useEffect(() => {
    ///////////////
    consultaCierreManual()
    .then((res) => {
      if (!res?.status) {
        setCierreManual(false)
      } else {
        setCierreManual(true)
      }
    })
    .catch(() => console.log("Falla en consulta estado cierre manual"));
  }, []);

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
    setFormatMon("");
    setInfo("");
    setModalUsar(false);
    setModalCancel(false);
    setParametroBusqueda("");
    if (activarNavigate) {
      navigate("/PinesVus");
    }
  }, [activarNavigate, navigate]);

  //////////////////////
  const onSubmitReenvio = (e) => {
    e.preventDefault();
    reenvioHash(doc_cliente,"enviarFormulario")
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          notify(res?.msg)
          setDoc_cliente("")
          setShowModalReenvio(false)
        }
      })
      .catch((err) => console.log("error", err));
  };

  //////////////////////
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    setInfo("");
    // const user = {
    //   Usuario: roleInfo?.id_usuario,
    //   Dispositivo: roleInfo?.id_dispositivo,
    //   Comercio: roleInfo?.id_comercio,
    //   Depto: roleInfo?.codigo_dane?.slice(0, 2),
    //   Municipio: roleInfo?.codigo_dane?.slice(2),
    // };
    consultaPinesVus(parametroBusqueda, "", "", "", "", "",pageData)
      .then((res) => {
        setInfo(res);
        setDisabledBtn(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setTable(
            res?.obj?.results?.map((row) => {
              const fecha_vencimiento = new Date(row?.fecha_vencimiento);
              fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
              const fecha_nacimiento = new Date(row?.fecha_nacimiento);
              fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
              setFormatMon(row?.ValorPagar);
              return {
                // Id: row?.id_pin,
                Cedula: row?.doc_cliente,
                Nombre: row?.nombre,
                Apellidos: row?.apellidos,
                "Fecha Nacimiento":  dateFormatter.format(fecha_nacimiento),
                Celular: row?.celular, 
                Email: row?.email,
                Estado: row?.name_estado_pin,
                // "Codigo Estado": row?.estado_pin,
                Vencimiento: dateFormatter.format(fecha_vencimiento),
                Tramite: row?.name_tramite,
                Valor: formatMoney.format(row?.valor*1.19 + row?.valor_tramite), // Solo pin tiene iva
              };
            })
          );
          setMaxPages(res?.obj?.maxPages);
          setValor(res?.obj?.results?.[0]?.valor);
          setId_trx(res?.obj?.results?.[0]?.id_trx?.creacion);
          setTipoPin(res?.obj?.results?.[0]?.tipo_pin);
          setValor_tramite(res?.obj?.results?.[0]?.valor_tramite);
          setName_tramite(res?.obj?.results?.[0]?.name_tramite);
          setId_pin(res?.obj?.results?.[0]?.id_pin)
          setInfoComercioCreacion(res?.obj?.results?.[0]?.datos_comercio_creacion)
        }
      })
      .catch((err) => console.log("error", err));
  };

  const onSubmitUsar = (e) => {
    setModalUsar(true);
  };

  const hora = useMemo(() => {    
    return Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(new Date())
  }, [parametroBusqueda]);

  const horaCierre = useMemo(() => { 
    const dia = (new Date()).getDay()  
    if (dia === enumParametrosPines.diaFinSemana) {
      return enumParametrosPines.horaCierreFinSemana.split(":")
    }
    else{
      return enumParametrosPines.horaCierre.split(":")
    }
     
  }, [hora]);

  useEffect(() => {
    
    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0])-parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1])-parseInt(horaActual[1])
    if (deltaHora<0 || (deltaHora===0 & deltaMinutos<1) ){
      notifyError("Módulo cerrado a partir de las " + horaCierre[0] + ":" + horaCierre[1])
      navigate("/Pines/PinesVus",{replace:true});
    }
    else if (cierreManual){
      notifyError("Módulo cerrado de manera manual")
      navigate("/Pines/PinesVus",{replace:true});
    }
    else if ((deltaHora ===1 & deltaMinutos<-50)){
      notifyError("El módulo se cerrara en " + String(parseInt(deltaMinutos)+60) + " minutos, por favor evite realizar mas transacciones")  
    }
    else if ((deltaHora ===0 & deltaMinutos<10)){
      notifyError("El módulo se cerrara en " + deltaMinutos + " minutos, por favor evite realizar mas transacciones") 
    }

  }, [parametroBusqueda, hora, horaCierre, navigate, cierreManual])

  return (
    <>
    {"id_comercio" in roleInfo ? (
    <>
      {"id_comercio" in roleInfo ? (
        <div className="flex flex-col w-1/2 mx-auto">
          <>
            <h1 className="text-3xl mt-6 mx-auto">Tramitar Pines VUS</h1>
            <br></br>
            <Form onSubmit={onSubmit} grid>
              <Input
                id="paramBusqueda"
                label="Código"
                type="text"
                minLength="4"
                maxLength="4"
                autoComplete="off"
                value={parametroBusqueda}
                required
                onInput={(e) => {
                  setParametroBusqueda(e.target.value);
                }}
              />
              <ButtonBar className="col-auto md:col-span-2">
                <Button type="submit" disabled={disabledBtn}>
                  Consultar Pin
                </Button>
                <Button 
                  type="button" 
                  onClick = { () => {
                    setShowModalReenvio(true)
                  }}
                  >
                  Reenviar Código
                </Button>
              </ButtonBar>
            </Form>
            
          </>
        </div>
      ) : (
        <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
      )}

      {info?.status && (
        <>
          <TableEnterprise
            title="Información Pin"
            maxPage={maxPages}
            headers={[
              "Cédula",
              "Nombre",
              "Apellidos",
              "Fecha Nacimiento",
              "Celular", 
              "Email",
              "Estado",
              "Vencimiento",
              "Trámite",
              "Valor",
            ]}
            data={table || []}
            onSelectRow={(e, index) => {
              if (!(table[index]["Estado"] === "Pin creado" || table[index]["Estado"] === "Dispersado no usado")) {
                notifyError(table[index].Estado);
              } else {
                setSelected(table[index]);

                setShowModal(true);
                setActivarNavigate(false);
              }
            }}
            onSetPageData={setPageData}
          ></TableEnterprise>
        </>
      )}
      <Modal show={showModal} handleClose={() => closeModal()}>
        {(modalUsar !== true) & (modalCancel !== true) ? (
          <>
            <div className="flex flex-col w-1/2 mx-auto ">
              <h1 className="text-3xl mt-3 mx-auto">Datos del Pin</h1>
              <br></br>
            <h1 className="flex flex-row justify-center text-lg font-medium">{name_tramite}</h1>
            <br></br>
            <>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Trámite</h1>
                <h1>{formatMoney.format(valor_tramite)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Trámite</h1>
                <h1>{formatMoney.format(0)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Valor Pin</h1>
                <h1>{formatMoney.format(valor)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>IVA Pin</h1>
                <h1>{formatMoney.format(valor*0.19)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                <h1>{formatMoney.format(valor*1.19 + valor_tramite)}</h1>
              </div>
            </>
            </div>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmitUsar}>
                <ButtonBar>
                  <Button type="submit">Usar pin</Button>
                  {selected.Estado==="Pin creado" ? 
                  <Button
                  onClick={() => {
                    setModalCancel(true);
                  }}
                >
                  Cancelar pin
                </Button>
                :
                ""}
                  
                </ButtonBar>
              </Form>
            </div>
          </>
        ) : (
          ""
        )}
        {modalUsar === true ? (
          <UsarPinForm
            respPin={selected}
            valor={valor}
            valor_tramite={valor_tramite}
            name_tramite = {name_tramite}
            id_pin = {id_pin}
            trx={id_trx}
            tipoPin={tipoPin}
            setActivarNavigate={setActivarNavigate}
            closeModal={closeModal}
          ></UsarPinForm>
        ) : (
          ""
        )}
        {modalCancel === true ? (
          <CancelPin
            respPin={selected}
            valor={valor}
            valor_tramite={valor_tramite}
            name_tramite = {name_tramite}
            id_pin = {id_pin}
            trx={id_trx}
            tipoPin={tipoPin}
            infoComercioCreacion={infoComercioCreacion}
            setActivarNavigate={setActivarNavigate}
            closeModal={closeModal}
          ></CancelPin>
        ) : (
          ""
        )}
      </Modal>
      <Modal show={showModalReenvio} handleClose={() => {setShowModalReenvio(false); setDoc_cliente("")}}>
        <div className="flex flex-col w-1/2 mx-auto ">
          <h1 className="text-3xl mt-3 mx-auto">Reenvio Código PIN</h1>
          <br></br>
        </div>  
        <div className="flex flex-col justify-center items-center mx-auto container">          
          <Form onSubmit={onSubmitReenvio} grid>
            <Input
              id="docCliente"
              label="Número documento"
              type="text"
              minLength="5"
              maxLength="12"
              autoComplete="off"
              value={doc_cliente}
              required
              onInput={(e) => {
                setDoc_cliente(e.target.value);
              }}
            />
            <ButtonBar className="col-auto md:col-span-2">
              <Button type="submit" disabled={disabledBtn}>
                Reenviar código
              </Button>
              <Button 
                type="button"
                onClick = {() => {
                  setShowModalReenvio(false)
                  setDoc_cliente("")
                }
                }
                >
                Cancelar
              </Button>
            </ButtonBar>
          </Form>
        </div>       
      </Modal>
    </>
    ) : (
      <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
    )}
    </>
  );
};
export default TramitePines;
