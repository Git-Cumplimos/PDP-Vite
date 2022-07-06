import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import UsarPinForm from "../components/UsarPinForm/UsarPinForm";
import CancelPin from "../components/CancelPinForm/CancelPinForm";
import { useNavigate } from "react-router-dom";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const TramitePines = () => {
  const navigate = useNavigate();
  const { consultaPinesVus, activarNavigate, setActivarNavigate } =
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

  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const pageStyle = `
  @page {
    size: 80mm 50mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
    setFormatMon("");
    setInfo("");
    setModalUsar(false);
    setModalCancel(false);
    setParametroBusqueda("");
    console.log(activarNavigate);
    if (activarNavigate) {
      navigate("/PinesVus");
    }
  }, [activarNavigate]);

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
    consultaPinesVus(parametroBusqueda, "", "", "", pageData)
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
              setFormatMon(row?.ValorPagar);
              return {
                // Id: row?.id_pin,
                Cedula: row?.doc_cliente,
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
        }
      })
      .catch((err) => console.log("error", err));
  };

  const onSubmitUsar = (e) => {
    setModalUsar(true);
  };

  console.log(activarNavigate);
  return (
    <>
      {"id_comercio" in roleInfo ? (
        <div className="flex flex-col w-1/2 mx-auto">
          <>
            <h1 className="text-3xl mt-6 mx-auto">Tramitar Pines Vus</h1>
            <br></br>
            <Form onSubmit={onSubmit} grid>
              <Input
                id="paramBusqueda"
                label="Codigo"
                type="text"
                minLength="10"
                maxLength="10"
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
            title="Información de credito"
            maxPage={maxPages}
            headers={[
              "Cedula",
              "Estado",
              "Vencimiento",
              "Tramite",
              "Valor",
            ]}
            data={table || []}
            onSelectRow={(e, index) => {
              if (table[index]["Estado"] !== "Pin creado") {
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
                <h1>Valor Tramite</h1>
                <h1>{formatMoney.format(valor_tramite)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Iva Tramite</h1>
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
                <h1>Iva Pin</h1>
                <h1>{formatMoney.format(valor*0.19)}</h1>
              </div>
              <div
                className="flex flex-row justify-between text-lg font-medium"
              >
                <h1>Total</h1>
                <h1>{formatMoney.format(valor*1.19 + valor_tramite)}</h1>
              </div>
            </>
              {/* {Object.entries(selected).map(([key, val]) => {
                return (
                  <>
                    <div
                      className="flex flex-row justify-between text-lg font-medium"
                      key={key}
                    >
                      <h1>{key}</h1>
                      <h1>{val}</h1>
                    </div>
                  </>
                );
              })} */}
            </div>
            <div className="flex flex-col justify-center items-center mx-auto container">
              <Form onSubmit={onSubmitUsar}>
                <ButtonBar>
                  <Button type="submit">Usar pin</Button>
                  <Button
                    onClick={() => {
                      setModalCancel(true);
                    }}
                  >
                    Cancelar pin
                  </Button>
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
            setActivarNavigate={setActivarNavigate}
            closeModal={closeModal}
          ></CancelPin>
        ) : (
          ""
        )}
      </Modal>
    </>
  );
};
export default TramitePines;
