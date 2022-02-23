import { useCallback, useState, useEffect } from "react";
import TextArea from "../../../components/Base/TextArea/TextArea";
import Select from "../../../components/Base/Select/Select";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import InputX from "../../../components/Base/InputX/InputX";
import SMSForm from "../components/SMSForm/SMSForm";
import Table from "../../../components/Base/Table/Table";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import Input from "../../../components/Base/Input/Input";
import Form from "../../../components/Base/Form/Form";


const url_consultaBalance = `${process.env.REACT_APP_URL_APISMS}/consultaBalance`;
const url_SMS = `${process.env.REACT_APP_URL_APISMS}/SMS_texto`;
const url_buscarNum = `${process.env.REACT_APP_URL_APISMS}/buscar_celular`;
const url_tipComercios = `${process.env.REACT_APP_URL_APISMS}/tip_comercio`;


const EnviarSMS = () => {
  const [SMS, setSMS] = useState('');
  const [tipComercio, setTipComercio] = useState(null);
  const [Nivel, setNivel] = useState([]);
  const [resSMS, setResSMS] = useState(null)
  const [page, setPage] = useState(1)
  const [maxPages, setMaxPages] = useState(1)
  const [maxPage, setMaxPage] = useState(1);
  const [formData, setFormData] = useState(new FormData());
  const [showModal, setShowModal] = useState(false);
  const [resEnvioSMS, setResEnvioSMS] = useState(null);
  const [creditos, setCreditos] = useState(null)
  const [tipSelecNumber, setTipSelecNumber] = useState("")
  const [phones, setPhones] = useState(null)
  const [phonesText, setPhonesText] = useState('')
  const [optionsDisponibles, setOptionsDisponibles] = useState([])





  const options = [
    { value: "", label: "" },
    { value: "ingresar", label: "Ingresar Números" },
    { value: "seleccionar", label: "Tipo de comercios" },
  
  ];


  /*Buscar Mensaje*/
  const buscarSMS = useCallback(async (SMS,page) => {
    const query={'sms':SMS,'page':page,'limit':2}
    try {     
      const res = await fetchData(url_SMS, "GET", query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);


  /*Consulta creditos*/
  const credito = useCallback(async () => {
    try {     
      const res = await fetchData(url_consultaBalance, "GET");
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /*Consulta tip_comercios*/
  const tip_comercios = useCallback(async () => {
    try {     
      const res = await fetchData(url_tipComercios, "GET");
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /*Consulta celulares*/
  const buscarNum = useCallback(async (tipComercio) => {
    const query={"tipo_comercio":tipComercio}
    try {     
      const res = await fetchData(url_buscarNum, "GET",query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    credito().then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
        
      } else {
        console.log(res.obj.balance);
        setCreditos(res.obj.balance)
    
      }
    });

    tip_comercios().then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
        
      } else {
        setOptionsDisponibles(res.obj.results)
        console.log(res.obj.results);
            
      }
    });
  }, [])
  

  const closeModal = useCallback(() => {
    setPhones(null)
    setPhonesText('')
    setShowModal(false);
    setSMS('')
    setResSMS(null)
    setPage(1)
    setMaxPages(1)
    credito().then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
        
      } else {
        setCreditos(res.obj.balance)
    
      }
    });
    
  });

  console.log(phones?.length)
  return (
    <>
      <h1 className="text-3xl mb-6">Enviar SMS</h1>
      <div 
      className="max-width: 8.75rem;
      @apply rounded-full px-6 bg-primary text-white mx-2 text-center;"
      >
      Creditos: {String(creditos) || "NaN"}
      </div>
      
      <Select
          id="typeNumbers"
          label=""
          options={options}
          value={tipSelecNumber}
          onChange={(e) => {
            setTipSelecNumber(e.target.value)
            setPhones(null)
            setPhonesText('')            
          }}
      />
      {tipSelecNumber==='ingresar'?
        <TextArea
        id="Phone"
        label="Números"
        type="input"
        autoComplete="off"
        value={phonesText}
        onInput={(e) => {
          const numeros=e.target.value.split(',')
            console.log(e.target.value)
            console.log(e.target.value.length,(12+(12+1)*(numeros.length-1)))
            setPhonesText(e.target.value)
            if (e.target.value.length===(12+(12+1)*(numeros.length-1))){
              console.log()
              setPhones(numeros);
            }
            else{
              setPhones(null)
            }
            
    
       }}                 
      /> 
      :
      <>{tipSelecNumber==='seleccionar'? 
      <Select
          id="searchBySorteo"
          label="Tipo de comercio"
          options={
            Object.fromEntries([
              ["", ""],
              ...optionsDisponibles.map(({ tip_comercio, id  }) => {
                return [tip_comercio, id];
              }),
            ]) || { "": "" }
          }
          value={tipComercio}
          onChange={(e) => {
            console.log(e.target.value)
            setTipComercio(e.target.value)
            if(e.target.value!==null){
            buscarNum(e.target.value).then((res) => {
              if (res.status===false) {
                notifyError(res.msg);   
              } else {
                setPhones(res.obj.results)
                console.log(res.obj.results);
                    
              }
            });
          }

          }}
      />
      :""}</>
      }
      
      <div 
      className="max-width: 8.75rem;
      @apply rounded-full px-6 bg-secondary-dark text-white mx-2 text-center;"
      >
      Mensajes: {phones?.length || "0"}
      </div>
      {phones?.length>0 && phones!==0 ?
      <TextArea
      id="SMS"
      label="Mensaje"
      type="input"
      minLength="1"
      maxLength="160"
      autoComplete="off"
      value={SMS}
      info={`Cantidad de caracteres: ${SMS.length}`}
      onInput={(e) => {
        setSMS(e.target.value)        
      }}
      onLazyInput={{
        callback: (e) => {
          buscarSMS(SMS,1).then((res) => {
            if (res.status===false) {
              notifyError(res.msg);
              
            } else {
              console.log(res.obj);
              setResSMS(res.obj.results)
              setMaxPages(res.obj.maxPages)
            }
          });

        },
        timeOut: 500,
      }}
      />:
      "" }
      
      {SMS !=='' && phones!==null ?
      <>
      <ButtonBar>
      <Button type='submit' onClick={() => setShowModal(!showModal)}>
        Enviar SMS
      </Button>
      </ButtonBar>
      <ButtonBar>
          <Button
            type="button"
            disabled={page < 2}
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                buscarSMS(SMS,page-1).then((res) => {
                  if (res.status===false) {
                    notifyError(res.msg);
                    
                  } else {
                    console.log(res.obj);
                    setResSMS(res.obj.results)
                    setMaxPages(res.obj.maxPages)
                  }
                });
              }
            }}
          >
            Anterior
          </Button>
          <Button
            type="button"
            disabled={page >= maxPages || resSMS?.length === 0}
            onClick={() => {
              if (page < maxPages) {
                setPage(page + 1);
                buscarSMS(SMS,page+1).then((res) => {
                  if (res.status===false) {
                    notifyError(res.msg);
                    
                  } else {
                    console.log(res.obj);
                    setResSMS(res.obj.results)
                    setMaxPages(res.obj.maxPages)
                  }
                });
              }
            }}
          >
            Siguiente
          </Button>
        </ButtonBar>
      {Array.isArray(resSMS) && resSMS.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={[
              "Id",
              "Mensaje",
            ]}
            data={resSMS.map(
              ({ id_sms, sms }) => {
                return {
                  id_sms,
                  sms
                };
              }
            )}
            onSelectRow={(e, index) => {
              console.log(resSMS[index]);
              setSMS(resSMS[index].sms);
              
            }}
          />
        </>
      ) : (
        ""
      )}
      </>
      :''}
      
      <Modal show={showModal} handleClose={() => closeModal()}>
      <SMSForm
      closeModal={closeModal}
      SMS={SMS}
      setSMS={setSMS}
      tipComercio={tipComercio}
      Nivel={Nivel}
      setResEnvioSMS={setResEnvioSMS}
      resEnvioSMS={resEnvioSMS}
      phones={phones}      
      >
      </SMSForm>
      </Modal>
    </>
  );
};

export default EnviarSMS;
