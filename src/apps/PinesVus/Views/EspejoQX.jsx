import { useCallback, useState, useRef, useMemo, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import { usePinesVus } from "../utils/pinesVusHooks";
import { toast } from "react-toastify";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import MoneyInput from "../../../components/Base/MoneyInput/MoneyInput";

const dateFormatter = Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const EspejoQX = () => {
  const navigate = useNavigate();
  const { consultaCupoQX, modificarCupoQX } =
    usePinesVus();

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const [parametroBusqueda, setParametroBusqueda] = useState("");
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [info, setInfo] = useState("");  
  const [formatMon, setFormatMon] = useState("");
  const [showModal, setShowModal] = useState("");  
  const { roleInfo } = useAuth();  
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [cupoQX, setCupoQX] = useState("");
  const [cupoQXconsulta, setCupoQXconsulta] = useState("");
 
  const [valor_tramite, setValor_tramite] = useState("");
  const [name_tramite, setName_tramite] = useState("");

  const closeModal = useCallback(async () => {
    setShowModal(false);
    setDisabledBtn(false);
    setFormatMon("");
  }, []);

  //////////////////////
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtn(true);
    modificarCupoQX({"cupoQX" : cupoQX})
      .then((res) => {
        setDisabledBtn(false);
        if (!res?.status) {
          notifyError(res?.msg);
        } else { 
          notify(res?.msg)
          closeModal();
        }
      })
      .catch((err) => console.log("error", err));
  };




  const onMoneyChange = useCallback(
    (e, valor) => {
      setCupoQX(valor);
    },
    []
  );

  useEffect(() => {
    consultaCupoQX().then((res) => {
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        console.log(res?.obj?.balance);
        setCupoQXconsulta(res?.obj?.results?.cupoQX);
      }
    });
  }, [showModal]);

  
  return (
    <>
      
      <><h1 className="text-3xl mt-6 mx-auto">Espejo Cupo QX</h1>
      <br></br>
      <div
        className="max-width: 8.75rem;
      @apply rounded-full px-6 bg-primary text-white mx-2 text-center;"
      >
        Cupo: {formatMoney.format(cupoQXconsulta || "NaN")}
      </div>
      <Form></Form>
      <ButtonBar>
            <Button 
            type="submit"
            onClick={() => {
              setShowModal(true)
            }}
            >Modificar</Button>     
        </ButtonBar>
      </>
      <Modal show={showModal} handleClose={() => closeModal()}>
      <>
        <div className="flex flex-col w-1/2 mx-auto ">
          <h1 className="text-3xl mt-3 mx-auto">Modificar Cupo QX</h1>
          <br></br>
        <h1 className="flex flex-row justify-center text-lg font-medium">{name_tramite}</h1>
        <br></br>
        <>
          <div
            className="flex flex-row justify-between text-lg font-medium"
          >
            <h1>Valor Actual</h1>
            <h1>{formatMoney.format(cupoQXconsulta)}</h1>
          </div>
        </>
        </div>
        <div className="flex flex-col justify-center items-center mx-auto container">
          <Form onSubmit={onSubmit} grid>
            <MoneyInput
              id="cupoQx"
              name="cupoQx"
              label="Cupo QX"
              autoComplete="off"
              min={0}
              max={100000000}
              onInput={onMoneyChange}
              required
            />
            <ButtonBar>
              <Button type="submit" disabled = {disabledBtn}>Modificar</Button>
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
      </Modal>
    </>
  );
};
export default EspejoQX;
