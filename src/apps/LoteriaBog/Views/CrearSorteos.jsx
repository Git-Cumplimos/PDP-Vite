import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Form from "../../../components/Base/Form/Form";
import AWS from "aws-sdk";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import SortForm from "../components/SortForm/SortForm";
import CloseForm from "../components/SortForm/CloseForm";
import { useLoteria } from "../utils/LoteriaHooks";
import SubPage from "../../../components/Base/SubPage/SubPage";
import { useAuth } from "../../../hooks/AuthHooks";
 


AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});



const CrearSorteos = ({ route }) => {
  const { label } = route;
  //const { notifyError, notify } = useAuth();
  const { ConsultaCrearSort} = useLoteria();
  const [resp_con, setResp_con] = useState(null);
  const [tip_sorteo, setTip_sorteo] = useState(null);
  const [sorteo, setSorteo] = useState(null);
  const [num_loteria, setNum_loteria] = useState(null);

  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [disable_botoOrdinario, setDisable_botoOrdinario] = useState(false);
  const [disable_botoExtra, setDisable_botoExtra] = useState(false);

  const [day, setDay] = useState(null);

  
  useEffect(() => {
    ConsultaCrearSort().then((res) => {
      setResp_con(res);
    });
    setDay((new Date()).getDay())
    
  }, []);

  const onSubmit3 = (e) => {
    setTip_sorteo(2);
    setShowModal2(true)
    setDisable_botoExtra(true)
  };

  const onSubmit4 = (e) => {
    setTip_sorteo(1);
    setShowModal2(true)
    setDisable_botoOrdinario(true)
  };

  const closeModal = useCallback(() => {
    setShowModal1(false);
    ConsultaCrearSort().then((res) => {
      console.log(res);
      setResp_con(res);
    });
  });

  const closeModal2 = useCallback(() => {
    setShowModal2(false);
    console.log('Que onda?????????')
    ConsultaCrearSort().then((res) => {
      console.log(res);
      setResp_con(res);
    });
  });

  const onSubmit1 = (e) => {
    e.preventDefault();
    setTip_sorteo(1);
    setSorteo(String(parseInt(resp_con?.ordinario.num_sorteo) + 1));
    setNum_loteria(resp_con?.ordinario.num_loteria);
    setShowModal1(true);
    setDisable_botoOrdinario(false)
  };

  const onSubmit2 = (e) => {
    e.preventDefault();
    setTip_sorteo(2);
    setSorteo(String(parseInt(resp_con?.extra.num_sorteo) + 1));
    setNum_loteria(resp_con?.extra.num_loteria);
    setShowModal1(true);
    setDisable_botoExtra(false)
  };
  console.log(resp_con)
  console.log(day)
  return (
    <>
      <div>
        {resp_con?.extra?.Cerrar && day!=4 ? (
          <ButtonBar>
            <Button
              type="button"
              onClick={() => {
                onSubmit3();
              }}
              disabled={disable_botoExtra}
            >
              Cerrar sorteo extraordinario
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}

        {resp_con?.ordinario?.Cerrar ? (
          <ButtonBar>
            <Button
              type="button"
              onClick={() => {
                onSubmit4();
              }}
              disabled={disable_botoOrdinario}
            >
              Cerrar sorteo ordinario
            </Button>
          </ButtonBar>
        ) : (
          ""
        )}

        {resp_con?.ordinario?.num_loteria !== undefined ? (
          <Form formDir="col" onSubmit={onSubmit1}>
            <ButtonBar>
              <Button type="submit" disabled={disabledBtns}>
                Crear sorteo ordinario
              </Button>
            </ButtonBar>
          </Form>
        ) : (
          ""
        )}
        {resp_con?.extra?.num_loteria !== undefined ? (
          <Form formDir="col" onSubmit={onSubmit2}>
            <ButtonBar>
              <Button type="submit" disabled={disabledBtns}>
                Crear sorteo extraordinario
              </Button>
            </ButtonBar>
          </Form>
        ) : (
          ""
        )}
        <Modal show={showModal1} handleClose={() => closeModal()}>
          <SortForm
            closeModal={closeModal}
            tip_sorteo={tip_sorteo}
            sorteo={sorteo}
            setSorteo={setSorteo}
            num_loteria={num_loteria}
          ></SortForm>
        </Modal>
        <Modal show={showModal2} handleClose={() => closeModal2()}>
          <CloseForm
            closeModal={closeModal2}
            tip_sorteo={tip_sorteo}
          ></CloseForm>
        </Modal>
      </div>
    </>
  );
};

export default CrearSorteos;
