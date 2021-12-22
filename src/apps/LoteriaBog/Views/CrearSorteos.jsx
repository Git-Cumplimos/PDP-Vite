import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Form from "../../../components/Base/Form/Form";
import AWS from "aws-sdk";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../components/Base/Button/Button";
import Modal from "../../../components/Base/Modal/Modal";
import SortForm from "../components/SortForm/SortForm";
import { useLoteria } from "../utils/LoteriaHooks";
import SubPage from "../../../components/Base/SubPage/SubPage";
import { useAuth } from "../../../utils/AuthHooks";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_accessKeyId,
  secretAccessKey: process.env.REACT_APP_secretAccessKey,
});

const CrearSorteos = ({ route }) => {
  const { label } = route;
  const { notifyError, notify } = useAuth();
  const { ConsultaCrearSort, cargueVentasExtra_S3 } = useLoteria();
  const [resp_con, setResp_con] = useState(null);
  const [tip_sorteo, setTip_sorteo] = useState(null);
  const [sorteo, setSorteo] = useState(null);
  const [num_loteria, setNum_loteria] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [disabledBtns, setDisabledBtns] = useState(false);

  useEffect(() => {
    ConsultaCrearSort().then((res) => {
      console.log(res);
      setResp_con(res);
    });
  }, [cargueVentasExtra_S3,cargueVentasExtra_S3]);

  const S3_Extra = (e) => {
    // e.preventDefault();
    cargueVentasExtra_S3(2).then((res) => {
      if (res.estado === true) {
        notify(res.msg);
      } else {
        notifyError(res.msg);
      }
    });
  };

  const S3_Ordi = (e) => {
    // e.preventDefault();
    cargueVentasExtra_S3(1).then((res) => {
      if (res.estado === true) {
        notify(res.msg);
      } else {
        notifyError(res.msg);
      }
    });
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
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
    setShowModal(true);
  };

  const onSubmit2 = (e) => {
    e.preventDefault();
    setTip_sorteo(2);
    setSorteo(String(parseInt(resp_con?.extra.num_sorteo) + 1));
    setNum_loteria(resp_con?.extra.num_loteria);
    setShowModal(true);
  };

  // const notifyError = (msg) => {
  //   toast.error(msg, {
  //     position: "top-center",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // };

  // const notify = (msg) => {
  //   toast.info(msg, {
  //     position: "top-center",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // };
  console.log(resp_con?.ordinario?.num_loteria);
  return (
    <SubPage label={label}>
      <div>
        {resp_con?.extra?.Cerrar ? (
          <ButtonBar>
            <Button
              type="button"
              onClick={() => {
                S3_Extra();
              }}
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
                S3_Ordi();
              }}
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
              <Button type="submit" diabled={disabledBtns}>
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
              <Button type="submit" diabled={disabledBtns}>
                Crear sorteo extraordinario
              </Button>
            </ButtonBar>
          </Form>
        ) : (
          ""
        )}
        <Modal show={showModal} handleClose={() => closeModal()}>
          <SortForm
            closeModal={closeModal}
            tip_sorteo={tip_sorteo}
            sorteo={sorteo}
            setSorteo={setSorteo}
            num_loteria={num_loteria}
          ></SortForm>
        </Modal>
      </div>
    </SubPage>
  );
};

export default CrearSorteos;
