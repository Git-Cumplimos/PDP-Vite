import React, { useState } from "react";
import Form from "../../../components/Base/Form";
import Select from "../../../components/Base/Select";
import MicroTable from "../../../components/Base/MicroTable";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import ValidarComprobante from "./ValidarComprobante";

const headers = [
  "Id",
  "Id comercio",
  "Nombre comercio",
  "Autorizador",
  "Cuenta",
  "Id consignación",
  "Valor consignado",
  "Fecha consignación",
  "Estado",
  "Fecha registro",
];

const trxs = [
  {
    id: "1",
    id_comercio: 2,
    nombre_comercio: "Comercio de pruebas",
    autorizador: "COLPATRIA",
    no_cuenta: 12345678901234,
    no_consignacion: 12345,
    valor: 3500000,
    fecha_ingreso: "04/03/2022",
    estado: "PENDIENTE",
    fecha_registro: "",
    url: "http://designblog.uniandes.edu.co/blogs/dise2619/files/2013/09/Daniela-Polo-.jpg",
  },
  {
    id: "2",
    id_comercio: 2,
    nombre_comercio: "Comercio de pruebas",
    autorizador: "BANCOLOMBIA",
    no_cuenta: 12345678901234,
    no_consignacion: 12345,
    valor: 3500000,
    fecha_ingreso: "04/03/2022",
    estado: "APROBADA",
    fecha_registro: "04/03/2022",
    url: "https://www.pedidos.co/formatofiduejemplo1.gif",
  },
];

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const PanelConsignaciones = () => {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({});
  const CloseModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <div className="w-full flex flex-col justify-center items-center my-8">
        <h1 className="text-xl">Validación de comprobante</h1>
      </div>
      <Form>
        <Input id="dateInit" label="Fecha de consignación" type="date" />
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
      </Form>
      <MicroTable
        headers={headers}
        data={trxs?.map(
          ({
            id,
            id_comercio,
            nombre_comercio,
            autorizador,
            no_cuenta,
            no_consignacion,
            valor,
            fecha_ingreso,
            estado,
            fecha_registro,
          }) => {
            const t_consignado = formatMoney.format(valor);
            console.log(id);
            return {
              id,
              id_comercio,
              nombre_comercio,
              autorizador,
              no_cuenta,
              no_consignacion,
              t_consignado,
              fecha_ingreso,
              estado,
              fecha_registro,
            };
          }
        )}
        onSelectRow={(_e, index) => {
          setData(trxs[index]);
          setShowModal(true);
        }}
      ></MicroTable>
      <Modal show={showModal} handleClose={CloseModal}>
        <ValidarComprobante data={data} setShowModal={setShowModal} />
      </Modal>
    </>
  );
};

export default PanelConsignaciones;
