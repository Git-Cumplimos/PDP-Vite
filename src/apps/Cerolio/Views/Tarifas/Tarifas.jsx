import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Modal from "../../../../components/Base/Modal";
import Input from "../../../../components/Base/Input";
import Form from "../../../../components/Base/Form";
import {
  fetchTarifasByIdComercio,
  fetchUpdateTarifasByIdComercio,
} from "../../utils/tarifas";
import { notify, notifyError } from "../../../../utils/notify";

const Tarifas = () => {
  const [modalTarifas, setModalTarifas] = useState(false);
  const [dataTarifas, setDataTarifas] = useState([
    {
      "A1-A2": 0,
      B1: 0,
      "B2-C2": 0,
      "B3-C3": 0,
      C1: 0,
    },
  ]);
  const handleShowModalTarifas = () => {
    setModalTarifas(!modalTarifas);
  };

  const getTarifasByComercio = useCallback(async () => {
    try {
      const response = await fetchTarifasByIdComercio(3);
      console.log(response);
      const tarifas = response?.results[0]?.tarifas;
      const tarifasArray = [tarifas];
      setDataTarifas(tarifasArray || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getTarifasByComercio();
  }, [getTarifasByComercio]);

  const updateTarifasByComercio = useCallback(async () => {
    try {
      const body = {
        tarifas: {
          "A1-A2": dataTarifas[0]["A1-A2"],
          B1: dataTarifas[0]["B1"],
          C1: dataTarifas[0]["C1"],
          "B2-C2": dataTarifas[0]["B2-C2"],
          "B3-C3": dataTarifas[0]["B3-C3"],
        },
      };
      const response = await fetchUpdateTarifasByIdComercio(3, body);
      console.log(response);
      if (response?.status) {
        notify("Tarifas actualizadas correctamente");
        await getTarifasByComercio();
        handleShowModalTarifas();
      } else {
        notifyError("No se pudo actualizar las tarifas");
      }
    } catch (error) {
      console.error(error);
    }
  }, [dataTarifas, getTarifasByComercio, handleShowModalTarifas]);

  return (
    <>
      <TableEnterprise
        title="Tarifas"
        maxPage={5}
        headers={["A1-A2", "B1", "C1", "B2-C2", "B3-C3"]}
        data={
          dataTarifas.length > 0
            ? [
                {
                  "A1-A2": dataTarifas[0]["A1-A2"],
                  B1: dataTarifas[0]["B1"],
                  C1: dataTarifas[0]["C1"],
                  "B2-C2": dataTarifas[0]["B2-C2"],
                  "B3-C3": dataTarifas[0]["B3-C3"],
                },
              ]
            : []
        }
        children={null}
      />
      <ButtonBar>
        <Button onClick={handleShowModalTarifas}>Actualizar tarifas</Button>
      </ButtonBar>
      <Modal show={modalTarifas} handleClose={handleShowModalTarifas}>
        <h1 className="text-2xl">Tarifas</h1>
        <Form onSubmit={() => updateTarifasByComercio()}>
          <Input
            label="A1-A2"
            type="number"
            value={dataTarifas[0]["A1-A2"]}
            onChange={(e) => {
              setDataTarifas([{ ...dataTarifas[0], "A1-A2": e.target.value }]);
            }}
          />
          <Input
            label="B1"
            type="number"
            value={dataTarifas[0]["B1"]}
            onChange={(e) => {
              setDataTarifas([{ ...dataTarifas[0], B1: e.target.value }]);
            }}
          />
          <Input
            label="C1"
            type="number"
            value={dataTarifas[0]["C1"]}
            onChange={(e) => {
              setDataTarifas([{ ...dataTarifas[0], C1: e.target.value }]);
            }}
          />
          <Input
            label="B2-C2"
            type="number"
            value={dataTarifas[0]["B2-C2"]}
            onChange={(e) => {
              setDataTarifas([{ ...dataTarifas[0], "B2-C2": e.target.value }]);
            }}
          />
          <Input
            label="B3-C3"
            type="number"
            value={dataTarifas[0]["B3-C3"]}
            onChange={(e) => {
              setDataTarifas([{ ...dataTarifas[0], "B3-C3": e.target.value }]);
            }}
          />
          <ButtonBar>
            <Button type="submit">Guardar</Button>
            <Button type="button" onClick={handleShowModalTarifas}>
              Cancelar
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </>
  );
};

export default Tarifas;
