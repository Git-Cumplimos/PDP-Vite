import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import SendForm from "../components/SendForm/SendForm";
import Voucher from "../components/Voucher/Voucher";
import { useLoteria } from "../utils/LoteriaHooks";

const Ordinario = ({ sorteo }) => {
  const {
    ordinario: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
    },
    searchOrdinario,
    sellOrdinario,
  } = useLoteria();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setSellResponse(null);
  }, [setSellResponse]);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Form>
        <Input
          id="numLoto"
          label="Numero de loteria"
          type="text"
          minLength="1"
          maxLength="4"
          value={numero}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setNumero(num);
          }}
          onLazyInput={{
            callback: (e) => {
              const num = parseInt(e.target.value) || "";
              searchOrdinario(num);
            },
            timeOut: 500,
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="text"
          minLength="1"
          maxLength="3"
          value={serie}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            setSerie(num || "");
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
        {sellResponse === null ? (
          <SendForm
            selected={selected}
            customer={customer}
            setCustomer={setCustomer}
            setShowModal={setShowModal}
            handleSubmit={(event) => {
              event.preventDefault();
              sellOrdinario(sorteo);
            }}
          />
        ) : "msg" in sellResponse ? (
          <div>
            <h1>Error: {sellResponse.msg}</h1>
            <Button
              onClick={(e) => {
                setSellResponse(null);
              }}
            >
              Volver
            </Button>
          </div>
        ) : (
          <Voucher {...sellResponse} />
        )}
      </Modal>
    </div>
  );
};

export default Ordinario;
