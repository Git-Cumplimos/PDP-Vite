import { useCallback, useState, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { notifyError, notify } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import TableVertical from "../Views/TableVertical";
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
  const [valores, setValores] = useState("");
  const [id_trx, setId_trx] = useState("");
  const [tipoPin, setTipoPin] = useState("");
  const [valor_tramite, setValor_tramite] = useState("");
  const [name_tramite, setName_tramite] = useState("");
  const [id_pin, setId_pin] = useState("")
  const [showModalReenvio, setShowModalReenvio] = useState(false)
  const [doc_cliente, setDoc_cliente] = useState("")
  const [cierreManual, setCierreManual] = useState(false)
  const [infoComercioCreacion, setInfoComercioCreacion] = useState("")
  const [msgRespReenvio, setMsgRespReenvio] = useState("")
  const [urlAutogestion, setUrlAutogestion] = useState("")

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

  const closeModalReenvio = useCallback(async () => {
    setShowModalReenvio(false);
    setDoc_cliente("")
    setUrlAutogestion("")

  }, []);

  //////////////////////
  const onSubmitReenvio = (e) => {
    e.preventDefault();
    reenvioHash(doc_cliente, "enviarFormulario")
      .then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          //notify(res?.msg)
          notify("Verificación exitosa")
          // setMsgRespReenvio(res?.msg);
          setUrlAutogestion(res?.obj?.url_autogestion)
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
    consultaPinesVus("", "", "", "", "", parametroBusqueda, pageData, 1)
      .then((res) => {
        //console.log(res)
        setInfo(res);
        setDisabledBtn(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else {


          /*      const fecha_vencimiento = new Date(res?.obj?.results[0]["fecha_vencimiento"]);
                fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
                const fecha_nacimiento = new Date(res?.obj?.results[0]["fecha_nacimiento"]);
                fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
               //setFormatMon(res?.obj?.results[0]["ValorPagar"]);
    
    <<<<<<< HEAD
         let    objetoVertical=[{
    =======
          let    objetoVertical=[{
    >>>>>>> origin/incidencias-practisistemas-ale
            clave: "Documento",
            info: res?.obj?.results[0]["doc_cliente"]
          },
          {
            clave: "Tipo Documento",
            info: res?.obj?.results[0]["tipo_documento_descripcion"]
          },{
            clave: "Nombre",
                    info: res?.obj?.results[0]["nombre"]
          },{
            clave: "Apellidos",
                    info: res?.obj?.results[0]["apellidos"]
          },{
            clave: "Fecha Nacimiento",
                    info: dateFormatter.format(fecha_nacimiento)
          },{
            clave: "Celular",
                    info: res?.obj?.results[0]["celular"]
          },{
            clave: "Email",
                    info: res?.obj?.results[0]["email"]
          },{
            clave: "Dirección",
                    info: res?.obj?.results[0]["direccion"]
          },{
            clave: "Estado",
                    info: res?.obj?.results[0]["name_estado_pin"]
          },{
            clave: "Vencimiento",
                    info: dateFormatter.format(fecha_vencimiento)
          },{
            clave: "Trámite",
                    info: res?.obj?.results[0]["name_tramite"]
          },{
            clave: "Valor",
                    info: formatMoney.format(res?.obj?.results[0]["valor"]*1.19 + res?.obj?.results[0]["valor_tramite"])
          },]*/


          setTable(
            /*     res?.obj?.results?.map((row) => {
                   const fecha_vencimiento = new Date(row?.fecha_vencimiento);
                   fecha_vencimiento.setHours(fecha_vencimiento.getHours() + 5);
                   const fecha_nacimiento = new Date(row?.fecha_nacimiento);
                   fecha_nacimiento.setHours(fecha_nacimiento.getHours() + 5);
                   setFormatMon(row?.ValorPagar);
                   return {
                     // Id: row?.id_pin,
                     Documento: row?.doc_cliente,
                     "Tipo Documento": row?.tipo_documento_descripcion,
                     Nombre: row?.nombre,
                     Apellidos: row?.apellidos,
                     "Fecha Nacimiento":  dateFormatter.format(fecha_nacimiento),
                     Celular: row?.celular, 
                     Email: row?.email,
                     Dirección: row?.direccion,
                     Estado: row?.name_estado_pin,
                     // "Codigo Estado": row?.estado_pin,
                     Vencimiento: dateFormatter.format(fecha_vencimiento),
                     Tramite: row?.name_tramite,
                     Valor: formatMoney.format(row?.valor*1.19 + row?.valor_tramite), // Solo pin tiene iva
                   };
     
                 })
     
     
            /*     objetoVertical.map((row) => {
     
                   return {
     
                    clave: row?.clave,
                    info: row?.info,
     
                   };
     
                 })*/


          );
          setMaxPages(res?.obj?.maxPages);
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
    else {
      return enumParametrosPines.horaCierre.split(":")
    }

  }, [hora]);

  useEffect(() => {

    const horaActual = hora.split(":")
    const deltaHora = parseInt(horaCierre[0]) - parseInt(horaActual[0])
    const deltaMinutos = parseInt(horaCierre[1]) - parseInt(horaActual[1])
    if (deltaHora < 0 || (deltaHora === 0 & deltaMinutos < 1)) {
      notifyError("Módulo cerrado a partir de las " + horaCierre[0] + ":" + horaCierre[1])
      navigate("/Pines/PinesVus", { replace: true });
    }
    else if (cierreManual) {
      notifyError("Módulo cerrado de manera manual")
      navigate("/Pines/PinesVus", { replace: true });
    }
    else if ((deltaHora === 1 & deltaMinutos < -50)) {
      notifyError("El módulo se cerrara en " + String(parseInt(deltaMinutos) + 60) + " minutos, por favor evite realizar mas transacciones")
    }
    else if ((deltaHora === 0 & deltaMinutos < 10)) {
      notifyError("El módulo se cerrara en " + deltaMinutos + " minutos, por favor evite realizar mas transacciones")
    }

  }, [parametroBusqueda, hora, horaCierre, navigate, cierreManual])

  /*    <ButtonBar className="col-auto md:col-span-1">
  <Button type=""
      onClick = { () => {
      
          if (!(info?.obj?.results[0]["name_estado_pin"] === "Pin creado" || info?.obj?.results[0]["name_estado_pin"] === "Dispersado no usado")) {
            notifyError(info?.obj?.results[0]["name_estado_pin"]);
          } else {
            
            setSelected(info?.obj?.results[0]);
 
            setShowModal(true);
            setActivarNavigate(false);
          }
      }}>
  Gestionar Pin
  </Button>
 
</ButtonBar>*/

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
                    label="Documento"//"Código"
                    type="text"
                    minLength="5"
                    maxLength="12"
                    autoComplete="off"
                    value={parametroBusqueda}
                    required
                    onInput={(e) => {
                      const num = parseInt(e.target.value) || "";
                      setParametroBusqueda(num);
                    }}
                  />
                  <ButtonBar className="col-auto md:col-span-2">
                    <Button type="submit" disabled={disabledBtn}>
                      Consultar Pin
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowModalReenvio(true)
                      }}
                    >
                      Diligenciar formulario
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
                  //   "",""
                  "Documento",
                  "Tipo Documento",
                  "Nombre",
                  "Apellidos",
                  "Fecha Nacimiento",
                  "Celular",
                  "Email",
                  "Dirección",
                  "Estado",
                  "Vencimiento",
                  "Trámite",
                  "Valor",
                ]}
                data={table || []}
                /*     onSelectRow={(e, index) => {
                       if (!(table[index][""] === "Pin creado" || table[index][""] === "Dispersado no usado")) {
                         notifyError(table[index].Estado);
                       } else {
                         setSelected(table[index]);
                         setValor(info?.obj?.results?.[index]?.valor);
                         setValores(info?.obj?.results?.[index]?.valores);
                         setId_trx(info?.obj?.results?.[index]?.id_trx?.creacion);
                         setTipoPin(info?.obj?.results?.[index]?.tipo_pin);
                         setValor_tramite(info?.obj?.results?.[index]?.valor_tramite);
                         setName_tramite(info?.obj?.results?.[index]?.name_tramite);
                         setId_pin(info?.obj?.results?.[index]?.id_pin)
                         setInfoComercioCreacion(info?.obj?.results?.[index]?.datos_comercio_creacion)
         
                         setShowModal(true);
                         setActivarNavigate(false);
                       }
                     }}*/
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
                      <h1>{formatMoney.format(valor * 0.19)}</h1>
                    </div>
                    <div
                      className="flex flex-row justify-between text-lg font-medium"
                    >
                      <h1>Total</h1>
                      <h1>{formatMoney.format(valor * 1.19 + valor_tramite)}</h1>
                    </div>
                  </>
                </div>
                <div className="flex flex-col justify-center items-center mx-auto container">
                  <Form onSubmit={onSubmitUsar}>
                    <ButtonBar>
                      <Button type="submit">Usar pin</Button>
                      {selected.name_estado_pin === "Pin creado" ?
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
                name_tramite={name_tramite}
                id_pin={id_pin}
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
                name_tramite={name_tramite}
                id_pin={id_pin}
                trx={id_trx}
                tipoPin={tipoPin}
                infoComercioCreacion={infoComercioCreacion}
                setActivarNavigate={setActivarNavigate}
                closeModal={closeModal}
                valores={valores}
              ></CancelPin>
            ) : (
              ""
            )}
          </Modal>
          <Modal show={showModalReenvio} handleClose={() => { closeModalReenvio() }}>
            {urlAutogestion === '' ?
              <>
                <div className="flex flex-col w-1/2 mx-auto ">
                  <h1 className="text-3xl mt-3 mx-auto">Verificar documento</h1>
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
                        Verificar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
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
              </>
              :
              <div className="flex flex-col w-2/3 mx-auto ">
                <h1 className="text-2xl mt-3 mx-auto">Link para diligenciar formulario:</h1>
                <br></br>
                <h1 className="text-1xl mt-3 mx-auto">{msgRespReenvio}</h1>
                <h1 className="text-1xl mt-3 mx-auto font-semibold">Formulario autogestión:
                  <a
                    href={urlAutogestion}
                    target="blank"
                    className="text-1xl mt-3 mx-auto text-sky-400"
                  > click aquí</a></h1>
                <br></br>
                <Button
                  type="button"
                  onClick={() => {
                    closeModalReenvio()
                  }
                  }
                >
                  Cerrar
                </Button>
              </div>
            }

          </Modal>
        </>
      ) : (
        <h1 className="text-3xl mt-6">El usuario no tiene comercio asociado</h1>
      )}
    </>
  );
};
export default TramitePines;
