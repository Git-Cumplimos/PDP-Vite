import { useState } from "react";
import Button from "../../../../../components/Base/Button";
import Input from "../../../../../components/Base/Input";
import Select from "../../../../../components/Base/Select";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import { fetchGetPinData, fetchPutUsePin } from "../../../utils/pin";
import { addHoursAndFormat, formatDate } from "../../../utils/general";

const Pin = () => {
  const { roleInfo } = useAuth();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    tipoDocumento: 0,
    numeroDocumento: "",
    tipoTramite: 0,
    pinData: {},
  });

  const tiposDocumento = [
    { label: "CC", value: 1 },
    { label: "CE", value: 2 },
    { label: "TI", value: 3 },
  ];

  const tramites = [
    { label: "A1", value: 1 },
    { label: "A2", value: 2 },
    { label: "B1", value: 3 },
    { label: "B2", value: 4 },
    { label: "B3", value: 5 },
    { label: "C1", value: 6 },
    { label: "C2", value: 7 },
    { label: "C3", value: 8 },
    { label: "A2B1", value: 9 },
    { label: "A2C1", value: 10 },
  ];

  const findPin = async () => {
    if (
      userData.tipoDocumento === 0 ||
      userData.numeroDocumento === "" ||
      userData.tipoTramite === 0
    ) {
      notifyError("Por favor llene todos los campos");
      return;
    }
    const doc = tiposDocumento.find(
      (item) => item.value === parseInt(userData.tipoDocumento)
    ).label;
    const tram = tramites.find(
      (item) => item.value === parseInt(userData.tipoTramite)
    ).label;
    const pinString = `${doc}${tram}${userData.numeroDocumento}`;
    const pinData = await fetchGetPinData(pinString, "Disponible");
    if (pinData.results.length === 0) {
      notifyError("No se encontró un PIN disponible");
      return;
    } else {
      setUserData({ ...userData, pinData: pinData.results[0] });
      setStep(1);
    }
  };

  const confirmarPin = () => {
    setStep(2);
  };

  const usarPin = async () => {
    const body = {
      id_comercio: roleInfo.id_comercio,
      id_usuario: userData.pinData.fk_id_cliente,
      id_terminal: roleInfo.id_dispositivo,
      pk_id_pin: userData.pinData.pk_id_pin,
      valor_pago_adicional:
        parseInt(userData.pinData.valor_tramite) -
        parseInt(userData.pinData.pago_cerolio),
      valor_total_trx: parseInt(userData.pinData.valor_tramite),
    };
    const res = await fetchPutUsePin(
      body.id_comercio,
      body.id_usuario,
      body.id_terminal,
      body.pk_id_pin,
      body.valor_pago_adicional,
      body.valor_total_trx
    );
    if (res.status) {
      notify(res.msg);
      setStep(0);
      setUserData({
        tipoDocumento: 0,
        numeroDocumento: "",
        tipoTramite: 0,
        pinData: {},
      });
    } else {
      notifyError(res.msg);
    }
  };

  return (
    <>
      <h1>PIN</h1>
      {step === 0 && (
        <>
          <div className="flex flex-row">
            <Select
              label="Tipo de Documento"
              options={[
                { label: "Seleccione un tipo de documento", value: 0 },
                ...tiposDocumento,
              ]}
              onChange={(e) =>
                setUserData({ ...userData, tipoDocumento: e.target.value })
              }
            />
            <Input
              label="Número de Documento"
              type="text"
              onChange={(e) =>
                setUserData({ ...userData, numeroDocumento: e.target.value })
              }
            />
            <Select
              label="Tipo de Trámite"
              options={[
                { label: "Seleccione un trámite", value: 0 },
                ...tramites,
              ]}
              value={userData.tipoTramite}
              onChange={(e) =>
                setUserData({ ...userData, tipoTramite: e.target.value })
              }
            />
          </div>
          <Button
            onClick={findPin}
            disabled={
              userData.tipoDocumento === 0 ||
              userData.numeroDocumento === "" ||
              userData.tipoTramite === 0
            }
          >
            Buscar PIN
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <div className="flex flex-col">
            {/* Nombres, Apellidos, Número de documento, Centro de Atención, Fecha de Atención, Hora de Atención, Tipo de Trámite, Valor Pagado, Estado de Pin - Todo en disabled */}
            <Input
              label="Nombres"
              type="text"
              disabled
              value={userData.pinData.nombres}
            />
            <Input
              label="Apellidos"
              type="text"
              disabled
              value={userData.pinData.apellidos}
            />
            <Input
              label="Número de Documento"
              type="text"
              disabled
              value={userData.numeroDocumento}
            />
            <Input
              label="Centro de Atención"
              type="text"
              disabled
              value={userData.pinData.nombre_oficina}
            />
            <Input
              label="Fecha de Atención"
              type="text"
              disabled
              value={formatDate(userData.pinData.hora_inicio)}
            />
            <Input
              label="Hora de Atención"
              type="text"
              disabled
              value={addHoursAndFormat(
                userData.pinData.hora_inicio,
                userData.pinData.hora_fin
              )}
            />
            <Input
              label="Tipo de Trámite"
              type="text"
              disabled
              value={userData.pinData.tipo_tramite}
            />
            <MoneyInput
              label="Valor Pagado"
              value={userData.pinData.pago_cerolio}
              disabled
            />
            <Input
              label="Estado de PIN"
              type="text"
              disabled
              value={userData.pinData.estado}
            />
          </div>
          <div className="flex flex-row">
            <Button
              onClick={() => {
                setStep(0);
                setUserData({
                  tipoDocumento: 0,
                  numeroDocumento: "",
                  tipoTramite: 0,
                  pinData: {},
                });
              }}
            >
              Volver
            </Button>
            {/* TODO Hacer aviso de pin no disponible */}
            <Button
              disabled={userData.pinData.estado !== "Disponible"}
              onClick={confirmarPin}
              design="primary"
            >
              Usar PIN
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="flex flex-col">
            {/* Número de PIN, Trámite a realizar, Valor total del PIN, Pago realizado, Saldo a pagar - Todo en disabled */}
            <Input
              label="Número de PIN"
              type="text"
              value={userData.pinData.numero_pin}
              disabled
            />
            <Input
              label="Trámite a realizar"
              type="text"
              value={userData.pinData.categoria}
              disabled
            />
            <MoneyInput
              label="Valor total del PIN"
              type="number"
              value={userData?.pinData.valor_tramite}
              disabled
            />
            <MoneyInput
              label="Pago realizado"
              type="number"
              value={userData?.pinData.pago_cerolio}
              disabled
            />
            <MoneyInput
              label="Saldo a pagar"
              type="number"
              value={
                userData?.pinData.valor_tramite - userData?.pinData.pago_cerolio
              }
              disabled
            />
          </div>
          <div className="flex flex-row">
            <Button onClick={() => setStep(1)} design="secondary">
              Volver
            </Button>
            <Button
              onClick={() => {
                usarPin();
              }}
              design="primary"
            >
              Usar PIN
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default Pin;
