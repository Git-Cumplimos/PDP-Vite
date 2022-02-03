import { useCallback, useState, useRef } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import { useMujer } from "../utils/mujerHooks";
import { toast } from "react-toastify";
import { notifyError } from "../../../utils/notify";
import { useReactToPrint } from "react-to-print";
import Tickets from "../../../components/Base/Tickets/Tickets";

const Reversos = () => {
  const {
    infoLoto: {},
    ingresoreversorecibo,
  } = useMujer();

  const [showModal, setShowModal] = useState(false);
  const [creditNumber, setCreditNumber] = useState("");
  const [value, setValue] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [val, setVal] = useState("");
  const [ticket, setTicket] = useState(false);

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

  const printDiv = useRef();

  const handlePrint = useReactToPrint({
    content: () => printDiv.current,
    pageStyle: pageStyle,
  });

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

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
    setVal({
      Credito: creditNumber,
      Valor: value,
      Referencia: refNumber,
    });
  };

  const reverse = () => {
    ingresoreversorecibo(val)
      .then((res) => {
        console.log(res);
        if (res?.status == false) {
          notifyError(
            "Consulte soporte, servicio de Fundación de la mujer presenta fallas"
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  console.log(parseFloat(value));
  return (
    <>
      <h1 className="text-3xl mt-6">
        Aplicar reverso recaudo Fundación de la mujer
      </h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="refCredit"
          label="Número crédito"
          type="text"
          maxLength="15"
          autoComplete="off"
          required
          value={creditNumber}
          onInput={(e) => {
            const ref = String(e.target.value) || "";
            setCreditNumber(ref);
          }}
        />
        <Input
          id="refValor"
          label="Valor"
          type="number"
          autoComplete="off"
          required
          value={value}
          onInput={(e) => {
            const ref = e.target.value || "";
            setValue(ref);
          }}
        />
        <Input
          id="refPago"
          label="Referencia pago"
          type="text"
          maxLength="15"
          autoComplete="off"
          value={refNumber}
          onInput={(e) => {
            const ref = String(e.target.value) || "";
            setRefNumber(ref);
          }}
        />
        <ButtonBar>
          <Button type="submit">Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={() => closeModal()}>
        {ticket !== false ? (
          <div className="flex flex-col justify-center items-center">
            <Tickets refPrint={printDiv} />
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
                  setTicket(false);
                }}
              >
                Cerrar
              </Button>
            </ButtonBar>
          </div>
        ) : (
          <>
            <h1 className="sm:text-center font-semibold">
              ¿Esta seguro del reverso de la obligación {creditNumber}?
            </h1>
            <ButtonBar>
              <Button
                onClick={() => {
                  reverse();
                }}
              >
                Aceptar
              </Button>
            </ButtonBar>
          </>
        )}
      </Modal>
    </>
  );
};
export default Reversos;
