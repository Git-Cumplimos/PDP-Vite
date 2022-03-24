import React, { useState } from "react";
import MicroTable from "../../../components/Base/MicroTable";
import Arqueo from "./Arqueo";
import Modal from "../../../components/Base/Modal";
import Button from "../../../components/Base/Button";
const trxs = [
  {
    id: "1",
    autorizador: "Soluciones en Red",
    cant_recaudo: 80,
    total_recaudo: 8000000,
    total_consignado: 8000000,
  },
  {
    id: "2",
    autorizador: "Colpatria",
    cant_recaudo: 100,
    total_recaudo: 10000000,
    total_consignado: 8000000,
  },
];
const headers = [
  "Id",
  "Autorizador",
  "Cant Recaudo",
  "Total recaudo",
  "Total consignado",
  "Saldo pendiente",
  "Saldo por consignar",
];
const Panel = () => {
  const [estado, setEstado] = useState(false);
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const closeModalFunction = () => {
    setEstado(false);
  };
  return (
    <>
      <MicroTable
        headers={headers}
        data={trxs?.map(
          ({
            id,
            autorizador,
            cant_recaudo,
            total_recaudo,
            total_consignado,
          }) => {
            const t_recaudo = formatMoney.format(total_recaudo);
            const t_consignado = formatMoney.format(total_consignado);
            const s_pendiente = formatMoney.format(
              total_recaudo - total_consignado
            );
            const s_consignar = formatMoney.format(
              total_recaudo - total_consignado
            );
            console.log(id);
            return {
              id,
              autorizador,
              cant_recaudo,
              t_recaudo,
              t_consignado,
              s_pendiente,
              s_consignar,
            };
          }
        )}
      ></MicroTable>
      <Button onClick={() => setEstado(true)}></Button>
      <Modal show={estado} handleClose={closeModalFunction}>
        <Arqueo />
      </Modal>
    </>
  );
};

export default Panel;
