import { useCallback } from "react";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import Modal from "../../../components/Base/Modal";

const FormAceptarTerminosCEACRC = ({
  setModalOpenPDF,
  url,
  showModal,
  setChecked,
}) => {
  const handleCloseTerminos = useCallback(() => {
    setModalOpenPDF(false);
  }, []);

  const handleAccept = useCallback(() => {
    setModalOpenPDF(false);
    setChecked(true);
  }, []);

  return (
    <>
      <Modal
        show={showModal}
        handleClose={handleCloseTerminos}
        className="flex align-middle"
      >
        <object
          title="PDF Viewer"
          data={url}
          type="application/pdf"
          width="100%"
          height="500vh"
        ></object>
        <ButtonBar>
          <Button type="button" design="primary" onClick={handleAccept}>
            Aceptar
          </Button>
        </ButtonBar>
      </Modal>
    </>
  );
};

export default FormAceptarTerminosCEACRC;
