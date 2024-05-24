import { useCallback, useState } from "react";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import Fieldset from "../../../components/Base/Fieldset";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyError } from "../../../utils/notify";
import { postTerminosCondiciones } from "../hooks/fetchCreditoFacil";
import Modal from "../../../components/Base/Modal";

const FormAceptarTerminos = ({ dataCredito, setDataCredito }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [url, setUrl] = useState("");

  const handleAccept = useCallback(() => {
    setModalOpen(false);
    setChecked(true);
  }, []);

  const handleCloseSimulacion = useCallback(() => {
    setModalOpen(false);
  }, []);

  const openModal = async () => {
    if (isChecked) {
      setChecked(!isChecked);
    } else {
      postTerminosCondiciones().then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setUrl(res?.obj?.url);
          setModalOpen(true);
          setDataCredito((old) => ({
            ...old,
            showModal: true,
          }));
        }
      });
    }
  };

  const handleCloseCancelarSimulacion = useCallback(() => {
    setDataCredito((oldData) => ({
      ...oldData,
      valorPreaprobado: 0,
      valorSimulacion: 0,
      validacionValor: false,
      consultDecisor: {
        plazo: "",
        fecha_preaprobado: "",
      },
      consultSiian: {},
      estadoPeticion: 0,
      formPeticion: 0,
      showModal: false,
      plazo: 0,
      showModalOtp: false,
      cosultEnvioOtp: {},
    }));
  }, []);

  return (
    <>
      <Fieldset legend=" Datos del crédito " className="lg:col-span-2">
        <Input
          id="creditoPreaprobado"
          name="idComercio"
          label={"Crédito Preaprobado"}
          type="text"
          autoComplete="off"
          value={formatMoney.format(dataCredito?.valorPreaprobado)}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="numCuotas"
          name="numCuotas"
          label={"No. de Cuotas"}
          type="text"
          autoComplete="off"
          value={dataCredito?.consultSiian?.plazo}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="fechaPreaprobado"
          name="fechaPreaprobado"
          label={"Fecha de Preaprobado"}
          type="text"
          autoComplete="off"
          value={new Date(
            dataCredito?.consultSiian?.fechaDesembolso
          ).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="estadoCredito"
          name="estadoCredito"
          label={"Estado"}
          type="text"
          autoComplete="off"
          value={"Pre-aprobado"}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="valorSolicitud"
          name="valorSolicitud"
          label={"Valor a solicitar"}
          type="text"
          autoComplete="off"
          value={formatMoney.format(dataCredito?.consultSiian?.monto)}
          onChange={() => {}}
          required
          disabled={true}
        />
      </Fieldset>
      <br />
      <div className="text-center">
        <label className="text-2xl">
          <input
            type="checkbox"
            checked={isChecked}
            onClick={openModal}
            onChange={() => {}}
            required
          />
          <span className="ml-2">Acepta Términos y Condiciones</span>
        </label>
      </div>
      {isModalOpen && (
        <Modal
          show={dataCredito?.showModal}
          handleClose={handleCloseSimulacion}
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
            <Button type="submit" onClick={handleAccept}>
              Aceptar
            </Button>
          </ButtonBar>
        </Modal>
      )}
      <ButtonBar className="lg:col-span-2">
        <Button
          type="button"
          onClick={handleCloseCancelarSimulacion}
          // disabled={loadingPeticionConsultaPreaprobado}
        >
          Cancelar
        </Button>
        {isChecked && (
          <ButtonBar>
            <Button
              type="submit"
              onClick={() => {
                setDataCredito((old) => ({
                  ...old,
                  showModalOtp: true,
                  showModal: true,
                }));
              }}
            >
              Desembolsar Crédito
            </Button>
          </ButtonBar>
        )}
      </ButtonBar>
    </>
  );
};

export default FormAceptarTerminos;
