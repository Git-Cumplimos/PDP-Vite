import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Form from "../../../components/Base/Form/Form";
import AWS from "aws-sdk";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import SortForm from "../components/SortForm/SortForm";
import { useLoteria } from "../utils/LoteriaHooks";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const CrearSorteos = () => {
   
  const {ConsultaCrearSort} = useLoteria();
  const [resp_con, setResp_con] = useState(null);
  const [tip_sorteo, setTip_sorteo] = useState(null);
  const [fisico, setFisico] = useState(null);


  const [showModal, setShowModal] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);

  useEffect(() => {
    ConsultaCrearSort()
      .then((res) => {
        console.log(res)
        setResp_con(res)   
                 
      })
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false);
    ConsultaCrearSort()
      .then((res) => {
        console.log(res)
        setResp_con(res)   
                 
      })
    
  });

  const onSubmit1 = (e) => {
    e.preventDefault();
    setTip_sorteo(1)
    setFisico(false)
    setShowModal(true)  
  }

  const onSubmit2 = (e) => {
    e.preventDefault();
    setTip_sorteo(2)
    setFisico(false)
    setShowModal(true)
  }
  const onSubmit3 = (e) => {
    e.preventDefault();
    setTip_sorteo(1)
    setFisico(true)
    setShowModal(true)
  }
  const onSubmit4 = (e) => {
    e.preventDefault();
    setTip_sorteo(2)
    setFisico(true)
    setShowModal(true)
  
  }
  
  return (
    <div>
      {resp_con?.virtual_ordinario?<Form formDir="col" onSubmit={onSubmit1}>
            <ButtonBar>
              <Button type="submit" diabled={disabledBtns}>Crear sorteo ordinario virtual</Button>
            </ButtonBar>
      </Form>:''}
      {resp_con?.virtual_extra? <Form formDir="col" onSubmit={onSubmit2}>
            <ButtonBar>
              <Button type="submit" diabled={disabledBtns}>Crear sorteo extraordinario virtual</Button>
            </ButtonBar>
      </Form>:''}
      {resp_con?.fisico_ordinario? <Form formDir="col" onSubmit={onSubmit3}>
            <ButtonBar>
              <Button type="submit" diabled={disabledBtns}>Crear sorteo ordinario fisico</Button>
            </ButtonBar>
      </Form>:''}
      {resp_con?.fisico_extra?<Form formDir="col" onSubmit={onSubmit4}>
            <ButtonBar>
              <Button type="submit" diabled={disabledBtns}>Crear sorteo extraordinario fisico</Button>
            </ButtonBar>
      </Form>:''}
      <Modal show={showModal} handleClose={() => closeModal()}>
        <SortForm closeModal={closeModal} fisico={fisico} tip_sorteo={tip_sorteo}> 
            
        </SortForm>
      </Modal>
      
      
    </div>
    
    
  );
};

export default CrearSorteos;
