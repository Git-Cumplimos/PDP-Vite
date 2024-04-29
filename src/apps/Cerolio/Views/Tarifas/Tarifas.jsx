import { useCallback, useEffect, useMemo, useState } from "react";
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
import { makeMoneyFormatter } from "../../../../utils/functions";
import MoneyInput from "../../../../components/Base/MoneyInput";

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

  const handleShowModalTarifas = useCallback(() => {
    setModalTarifas(!modalTarifas);
  }, [modalTarifas]);

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

  const tableTarifas = useMemo(() => {
    const moneyFormatter = makeMoneyFormatter(2);
    return dataTarifas.map((tarifa) => {
      return {
        "A1-A2": moneyFormatter.format(tarifa["A1-A2"]),
        B1: moneyFormatter.format(tarifa["B1"]),
        C1: moneyFormatter.format(tarifa["C1"]),
        "B2-C2": moneyFormatter.format(tarifa["B2-C2"]),
        "B3-C3": moneyFormatter.format(tarifa["B3-C3"]),
      };
    });
  }, [dataTarifas]);

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
      console.log(body);
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
        data={tableTarifas}
        children={null}
      />
      <ButtonBar>
        <Button onClick={handleShowModalTarifas}>Actualizar tarifas</Button>
      </ButtonBar>
      <Modal show={modalTarifas} handleClose={handleShowModalTarifas}>
        <h1 className="text-2xl">Tarifas</h1>
        <Form onSubmit={() => updateTarifasByComercio()}>
          <MoneyInput
            label="A1-A2"
            value={parseInt(dataTarifas[0]["A1-A2"])}
            type="number"
            onInput={(e) => {
              setDataTarifas([{ ...dataTarifas[0], "A1-A2": e }]);
            }}
          />
          <MoneyInput
            label="B1"
            type="number"
            value={parseInt(dataTarifas[0]["B1"])}
            onInput={(e) => {
              setDataTarifas([{ ...dataTarifas[0], B1: e.target.value }]);
            }}
          />
          <MoneyInput
            label="C1"
            type="number"
            value={parseInt(dataTarifas[0]["C1"])}
            onInput={(e) => {
              setDataTarifas([{ ...dataTarifas[0], C1: e.target.value }]);
            }}
          />
          <MoneyInput
            label="B2-C2"
            type="number"
            value={parseInt(dataTarifas[0]["B2-C2"])}
            onInput={(e) => {
              setDataTarifas([{ ...dataTarifas[0], "B2-C2": e.target.value }]);
            }}
          />
          <MoneyInput
            label="B3-C3"
            type="number"
            min={"0"}
            max={"100"}
            value={parseInt(dataTarifas[0]["B3-C3"])}
            maxLength={"10"}
            onInput={(e) => {
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
