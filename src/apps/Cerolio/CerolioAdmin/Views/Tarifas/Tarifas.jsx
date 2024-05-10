import { useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Modal from "../../../../../components/Base/Modal";
import FileInput from "../../../../../components/Base/FileInput";

const Tarifas = () => {
  const [modalCargueMasivo, setModalCargueMasivo] = useState(false);
  return (
    <>
      <ButtonBar>
        <Button
          className="text-white bg-primary"
          onClick={() => setModalCargueMasivo(true)}
        >
          Cargue masivo tarifas
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Tarifas"
        headers={[
          "ID",
          "Fecha de cambio",
          "ID OAT",
          "OAT",
          "Nombre",
          "Tarifa A",
          "Tarifa B",
          " Tarifa Licencia C",
          "Tarifa Combos",
          "Acciones",
        ]}
        data={[
          {
            ID: "1",
            "Fecha de cambio": "12/12/2021",
            "ID OAT": "1",
            OAT: "OAT 1",
            Nombre: "Nombre",
            "Tarifa A": "Tarifa A",
            "Tarifa B": "Tarifa B",
            "Tarifa Licencia C": "Tarifa Licencia C",
            "Tarifa Combos": "Tarifa Combos",
            Acciones: "Acciones",
          },
          {
            ID: "2",
            "Fecha de cambio": "12/12/2021",
            "ID OAT": "2",
            OAT: "OAT 2",
            Nombre: "Nombre",
            "Tarifa A": "Tarifa A",
            "Tarifa B": "Tarifa B",
            "Tarifa Licencia C": "Tarifa Licencia C",
            "Tarifa Combos": "Tarifa Combos",
            Acciones: "Acciones",
          },
          {
            ID: "3",
            "Fecha de cambio": "12/12/2021",
            "ID OAT": "3",
            OAT: "OAT 3",
            Nombre: "Nombre",
            "Tarifa A": "Tarifa A",
            "Tarifa B": "Tarifa B",
            "Tarifa Licencia C": "Tarifa Licencia C",
            "Tarifa Combos": "Tarifa Combos",
            Acciones: "Acciones",
          },
        ]}
      >
        {/* Input para nombre */}
        <Input label="Nombre" placeholder="Nombre" />
      </TableEnterprise>
      <ButtonBar>
        <Button>Descargar reporte</Button>
        <Button>Actualizar</Button>
      </ButtonBar>
      <Modal show={modalCargueMasivo}>
        <h1 className="text-2xl">Cargue masivo tarifas</h1>
        <FileInput label="Cargue el archivo Excel" accept=".xlsx" />
        <ButtonBar>
          <Button onClick={() => setModalCargueMasivo(false)}>Cancelar</Button>
          <Button>Guardar</Button>
        </ButtonBar>
      </Modal>
    </>
  );
};

export default Tarifas;
