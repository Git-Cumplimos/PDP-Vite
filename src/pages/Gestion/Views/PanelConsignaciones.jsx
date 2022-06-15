import { useState, useEffect } from "react";
import Select from "../../../components/Base/Select";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import ValidarComprobante from "./ValidarComprobante";
import { searchReceipt } from "../utils/fetchCaja";
import TableEnterprise from "../../../components/Base/TableEnterprise";

const headers = [
  "Id",
  "Id comercio",
  "Número comprobante",
  "Observación cajero",
  "Observación analista",
  "Cuenta",
  "Compañia",
  "Valor registrado",
  "Fecha registro",
  "Estado",
];

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const PanelConsignaciones = () => {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({});
  const [receipt, setReceipt] = useState([]);
  const CloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    searchReceipt()
      .then((res) => {
        setReceipt(res?.obj?.results);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  console.log(receipt, typeof receipt);
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-xl">Validación de comprobante</h1>
      </div>
      <TableEnterprise
        title="Comprobantes relacionados"
        headers={headers}
        data={receipt?.map(
          ({
            id_comprobante,
            id_comercio,
            nro_comprobante,
            obs_cajero,
            obs_analista,
            cuenta,
            compañia,
            valor,
            created,
            status,
          }) => {
            const t_consignado = formatMoney.format(valor);
            console.log(id_comprobante);
            return {
              id_comprobante,
              id_comercio,
              nro_comprobante,
              obs_cajero,
              obs_analista,
              cuenta,
              compañia,
              t_consignado,
              created,
              status,
            };
          }
        )}
        onSelectRow={(_e, index) => {
          setData(receipt[index]);
          setShowModal(true);
        }}
      >
        <Input id="dateInit" label="Fecha" type="date" />
        <Select
          id="searchByStatus"
          label="Estado"
          options={[
            { value: 0, label: "" },
            { value: 1, label: "PENDIENTE" },
            { value: 1, label: "RECHAZADO" },
            { value: 2, label: "APROBADO" },
          ]}
          onChange={(e) => {
            console.log(e.target.value);
            setShowModal(true);
          }}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={CloseModal}>
        <ValidarComprobante data={data} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default PanelConsignaciones;
