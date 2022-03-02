import { useState, useCallback } from "react";
import Button from "../components/Base/Button";
import { useAuth } from "../hooks/AuthHooks";
import Form from "../components/Base/Form";
import Modal from "../components/Base/Modal";
import ReportVentasForm from "../apps/LoteriaBog/components/ReportVentasForm/ReportVentasForm";
import SubPage from "../components/Base/SubPage/SubPage";
import { notify, notifyError } from "../utils/notify";

const Reportes = () => {
  const [showModal, setShowModal] = useState(false);
  const { roleInfo } = useAuth();

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  return (
    <div>
      <Form formDir="col" onSubmit={onSubmit}>
        <Button type="submit">Reporte ventas loteria</Button>
      </Form>
      <Modal show={showModal} handleClose={closeModal}>
        <ReportVentasForm closeModal={closeModal} oficina={roleInfo} />
      </Modal>
    </div>
  );
};

export default Reportes;
