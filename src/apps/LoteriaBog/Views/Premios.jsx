import { useState, useCallback, useEffect } from "react";
import { useLoteria } from "../utils/LoteriaHooks";


import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";
import { toast } from "react-toastify";
//////////////////////
import Modal from "../../../components/Base/Modal/Modal";
import PagarForm from "../components/SendForm/PagarForm ";

const Premios = () => {
  const [sorteo, setSorteo] = useState("");
  const [billete, setBillete] = useState("");
  const [serie, setSerie] = useState("");
  const [phone, setPhone] = useState("");
  const [hash, setHash] = useState("");

  const [respagar, setRespagar] = useState("");
  const [tipopago, setTipopago] = useState("");
  const [fracciones_fisi, setFracciones_fisi] = useState("");


  const [winner, setWinner] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  ///////////////////////////////////////////////////////
  const [showModal, setShowModal] = useState(false);
  const [customer, setCustomer] = useState(
    {
      doc_id:"",
      primer_nombre:"",
      segundo_nombre:"",
      primer_apellido:"",
      segundo_apellido:"",
      direccion:"",
      telefono:"",

    });
  
  
  
  const closeModal = useCallback(() => {
    setShowModal(false);
  });
  ///////////////////////////////////////////////////////
  const [disabledBtns, setDisabledBtns] = useState(false);

  const { isWinner, makePayment, makePayment2, pagopremio} = useLoteria();

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

  const notifyError = (msg) => {
    toast.error(msg, {
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
    setDisabledBtns(true);

    e.preventDefault();

    isWinner(sorteo, billete, serie)
      .then((res) => {
        setDisabledBtns(false);
        setTipopago(res[0]['Tipo'])
        console.log(tipopago)
        if (res[0]['Estado'] === false) {
          notify("No ganador");
          setWinner(false);
          setIsSelf(false);
        } else {
          if(res[0]['Tipo']===2) {
          notify("Ganador");
          setWinner(true);
          setIsSelf(true);
        }else{
          notify("Ganador!! pero no vendido por Punto de Pago");
          setWinner(true);
          setIsSelf(false);  
        }
        }
      })
      .catch(() => setDisabledBtns(false));
  };

  const onPay1 = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment(sorteo, billete, serie, phone, hash)
      .then((res) => {
        setShowModal(true);
        setDisabledBtns(false);
        setRespagar(res)
        console.log(res)
        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          notify(JSON.stringify(res));
        }
      })
      
      .catch(() => setDisabledBtns(false));
  };

  const onPay2 = (e) => {
    setDisabledBtns(true);
    e.preventDefault();

    makePayment2(sorteo, billete, serie, fracciones_fisi)
      .then((res) => {
        setShowModal(true);
        setDisabledBtns(false);
        setRespagar(res)
        console.log(res)
        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          notify(JSON.stringify(res));
        }
      })
      
      .catch(() => setDisabledBtns(false));
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="numSorteo"
          label="Numero de sorteo"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={sorteo}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setSorteo(num);
          }}
        />
        <Input
          id="numBillete"
          label="Numero de billete"
          type="text"
          minLength="1"/*Verificar para que se puedan poner ceros a la izquierda*/ 
          maxLength="4"
          autoComplete="false"
          value={billete}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setBillete(num);
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="text"
          minLength="1"/*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="3"
          autoComplete="false"
          value={serie}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setSerie(num);
          }}
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar
          </Button>
        </ButtonBar>
      </Form>
      {winner ? (<>
        {tipopago===2? (
        <Form onSubmit={onPay1} grid>
          <>
            <Input
              id="numCel"
              label="Numero de celular"
              type="text"
              autoComplete="false"
              required={true}
              value={phone}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setPhone(num);
              }}
            />
            {isSelf ? (
              <Input
                id="codHash"
                label="Codigo de seguridad"
                type="text"
                autoComplete="false"
                required={true}
                value={hash}
                onInput={(e) => {
                  setHash(e.target.value);
                }}
              />
            ) : (
              ""
            )}
          </>
          <ButtonBar className="col-auto md:col-span-2">
            <Button type="submit" disabled={disabledBtns}>
              Pagar
            </Button>
          </ButtonBar>
        </Form>
        ):
        <Form onSubmit={onPay2} grid>
          <>
            {/* <h2>Este numero no fue vendido por Punto de pago, solicite el billete</h2> */}
            <Input
              id="frac"
              label="Numero de fracciones"
              type="text"
              autoComplete="false"
              required={true}
              value={fracciones_fisi}
              onInput={(e) => {
                const num = parseInt(e.target.value) || "";
                setFracciones_fisi(num);
              }}
            />  
          </>
          <ButtonBar className="col-auto md:col-span-2">
            <Button type="submit" disabled={disabledBtns}>
              Pagar
            </Button>
          </ButtonBar>
        </Form>
        }
        </>
        
      
        
      ) : (
        ""
      )}
      
      <Modal show={showModal} tipo={tipopago} handleClose={() => closeModal()}>
        {tipopago===2? 
        (<PagarForm
          selected={respagar}
          customer={customer}
          setCustomer={setCustomer}
          closeModal={closeModal}
          handleSubmit={(event) => {
            event.preventDefault();
            pagopremio();
          }}
        />):
        (<PagarForm
          selected={respagar}
          customer={customer}
          setCustomer={setCustomer}
          closeModal={closeModal}
          handleSubmit={(event) => {
            event.preventDefault();
            //pagopremio();
          }}
        />)
        }
        
        
        
      </Modal>
    </>
  );
};

export default Premios;
