import { useState, useCallback} from "react";
import { useLoteria } from "../utils/LoteriaHooks";


import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";
import { toast } from "react-toastify";
//////////////////////
import Modal from "../../../components/Base/Modal/Modal";
import PagarForm from "../components/SendForm/PagarForm";
import PagarFormFisico from "../components/SendForm/PagarFormFisico"
import PagoResp from "../components/SellResp/PagoResp";

const Premios = () => {
  const {
    infoLoto: {
      pagoresponse,
      setPagoresponse,
    },
    
  } = useLoteria();

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
      fracciones:"",

    });

     
  
  
  
  const closeModal = useCallback(() => {
    setShowModal(false);
    setWinner('')
    setPhone('')
    setHash('')
    setFracciones_fisi('')
    setCustomer({
      doc_id:"",
      primer_nombre:"",
      segundo_nombre:"",
      primer_apellido:"",
      segundo_apellido:"",
      direccion:"",
      telefono:"",
      fracciones:"",
    

    })
  });
  ///////////////////////////////////////////////////////
  const [disabledBtns, setDisabledBtns] = useState(false);

  const { isWinner, makePayment, makePayment2, pagopremio, pagopremiofisico} = useLoteria();

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
        
        
        if('msg' in res){
          notify("El pago de premios de este sorteo ya esta vencido");
          setWinner(false);
          setIsSelf(false);
        }
        if (res[0]['Estado'] === false) {
          notify("No ganador");
          setWinner(false);
          setIsSelf(false);
        }else {
            if(res[0]['Tipo']===2) {
            notify("Ganador");
            setTipopago(res[0]['Tipo'])
            setWinner(true);
            setIsSelf(true);
        }else{
          notify("Ganador con billete físico");
          setTipopago(res[0]['Tipo'])
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
      
        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          //notify(JSON.stringify(res));
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
        
        if ("msg" in res) {
          notifyError(res.msg);
        } else {
          //notify(JSON.stringify(res));
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
          minLength="1"
          maxLength="4"
          required
          autoComplete="off"
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
          minLength="4"/*Verificar para que se puedan poner ceros a la izquierda*/ 
          maxLength="4"
          required
          autoComplete="off"
          value={billete}
          onInput={(e) => {
            if(!isNaN(e.target.value)){
              const num = (e.target.value);
              setBillete(num);
              }
           
            
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="text"
          minLength="3"/*Verificar para que se puedan poner ceros a la izquierda*/
          maxLength="3"
          required
          autoComplete="off"
          value={serie}
          onInput={(e) => {            
            if(!isNaN(e.target.value)){
              const num = (e.target.value);
              setSerie(num);
              }
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
              autoComplete="off"
              required
              value={phone}
              onInput={(e) => {
                if(!isNaN(e.target.value)){
                  const num = (e.target.value);
                  setPhone(num);
                  }
              }}
            />
            {isSelf ? (
              <Input
                id="codHash"
                label="Codigo de seguridad"
                type="text"
                autoComplete="off"
                required
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
              type="number"
              max='3'
              min='1'
              autoComplete="off"
              required
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
      
      {(respagar['msg']===undefined) ? <>
      <Modal show={showModal} num_tele={phone} handleClose={() => closeModal()}>
        
        {pagoresponse===null ? <>
          {tipopago===2? 
            (<PagarForm
              selected={respagar}
              customer={customer}
              setCustomer={setCustomer}
              closeModal={closeModal}
              handleSubmit={() => {
                pagopremio(sorteo, billete, serie, hash, customer, respagar, phone);
                setSorteo('')
                setBillete('')
                setSerie('')
                setPhone('')
                setHash('')
                setWinner('')
              }}
            />):
            (<PagarFormFisico
              selected={respagar}
              canFrac={fracciones_fisi}
              customer={customer}
              setCustomer={setCustomer}
              closeModal={closeModal}
              handleSubmit={() => {
                pagopremiofisico(sorteo, billete, serie, customer,respagar);
                setSorteo('')
                setBillete('')
                setSerie('')
                setPhone('')
                setHash('')
                setWinner('')
                setFracciones_fisi('')
          }}
        />)
        }
        </> :
        (
          <PagoResp
            pagoresponse={pagoresponse}
            setPagoresponse={setPagoresponse}
            closeModal={closeModal}
            setCustomer={setCustomer}
          />
        )
       
        }        
        
      </Modal>
      </>: ""}
      
    </>
  );
};

export default Premios;
