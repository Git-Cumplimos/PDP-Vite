import { useCallback, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Modal from "../../../components/Base/Modal/Modal";
import TextArea from "../../../components/Base/TextArea/TextArea";
import Table from "../../../components/Base/Table/Table";
import { notify, notifyError } from "../../../utils/notify";
import fetchData from "../../../utils/fetchData";
import PaginationAuth from "../../../components/Compound/PaginationAuth/PaginationAuth";

const url_SMS = `${process.env.REACT_APP_URL_APISMS}/SMS_texto`;


const CrearSMS = () => {
  const [SMS, setSMS] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1)
  const [maxPages, setMaxPages] = useState(1)
  const [resSMS, setResSMS] = useState(null)

  /*Crear mensaje*/ 
  const crearSMS = useCallback(async (SMS) => {
    const body={'sms':SMS}
    try {     
      const res = await fetchData(url_SMS, "POST", {}, body );
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);

  /*Buscar*/
  const buscarSMS = useCallback(async (SMS,page) => {
    const query={'sms':SMS,'limit':2,'page':page}
    try {     
      const res = await fetchData(url_SMS, "GET", query);
      console.log(res)
      return res;
    } catch (err) {
      console.error(err);
    }
  }, []);



  const closeModal = useCallback(() => {
    setShowModal(false);
    setSMS('')
    setResSMS(null)
    setPage(1)
    setMaxPages(1)
    
  });

  const onSumit = useCallback(()=> {    
    crearSMS(SMS).then((res) => {
      if (res.status===false) {
        notifyError(res.msg);
        
      } else {
        notify(res.msg)
      }
    });

  });
  
  console.log(typeof SMS)
  return (
    <>
      <h1 className="text-3xl">Crear mensaje predefinido</h1>

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
      />
      <ButtonBar>
        <Button type='submit' onClick={() => setShowModal(!showModal)}>
          Crear
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
      <Modal show={showModal} handleClose={() => closeModal()}>
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl font-semibold">
            Desea crear el mensaje predefinido
          </h1>
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
          />
         
          <ButtonBar>
            <Button 
            type="submit" 
            onClick={() => {
              closeModal(false)
              onSumit()
              }}>
              Aceptar
            </Button>            
          </ButtonBar>
        </div>
        {/* )} */}
      </Modal>
    </>
  );
};

export default CrearSMS;
