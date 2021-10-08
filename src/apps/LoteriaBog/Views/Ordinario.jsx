import { useState } from "react";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import { useLoteria } from "../utils/LoteriaHooks";

const Ordinario = () => {
  const {
    ordinario: {
      numero,
      setNumero,
      loterias,
      selected,
      setSelected,
      customer: { fracciones, phone },
      setCustomer,
    },
    searchOrdinario,
  } = useLoteria();

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Form>
        <Input
          id="numLoto"
          label="Numero de loteria"
          type="text"
          value={numero}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            setNumero(num || "");
            searchOrdinario(num || "");
          }}
        />
      </Form>
      {Array.isArray(loterias) && loterias.length > 0 ? (
        <Table
          headers={["Fraccion", "Numero", "Serie", "Valor"]}
          data={loterias.map((obj) => {
            delete obj.Estado;
            return obj;
          })}
          onSelectRow={(e, index) => {
            setSelected(loterias[index]);
            setShowModal(true);
          }}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={() => setShowModal(false)}>
        <h1>Valor por fraccion: {selected ? selected.Val_fraccion : ""}</h1>
        <h1>Numero: {selected ? selected.Num_loteria : ""}</h1>
        <h1>Serie: {selected ? selected.Serie : ""}</h1>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            console.log("enviar a back");
          }}
        >
          <Input
            id="cantFrac"
            label="Facciones a comprar"
            type="number"
            max="3"
            min="1"
            value={fracciones}
            onChange={(e) => {
              const cus = { fracciones, phone };
              cus.fracciones = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <Input
            id="numCel"
            label="Celular"
            type="tel"
            minLength="10"
            maxLength="10"
            value={phone}
            onChange={(e) => {
              const cus = { fracciones, phone };
              cus.phone = e.target.value;
              setCustomer({ ...cus });
            }}
          />
          <button
            className="px-4 py-2 text-gray-50 border-black rounded-lg"
            style={{
              backgroundColor: "var(--primary)",
            }}
            type="submit"
          >
            Aceptar
          </button>
          <button
            className="px-4 py-2 text-gray-50 border-black rounded-lg"
            style={{
              backgroundColor: "var(--secondary-dark)",
            }}
            type="button"
            onClick={() => {
              setShowModal(false);
              setCustomer({ fracciones: "", phone: "" });
            }}
          >
            Cancelar
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default Ordinario;