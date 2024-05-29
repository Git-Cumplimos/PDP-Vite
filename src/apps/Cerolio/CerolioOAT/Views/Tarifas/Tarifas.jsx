import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import {
  fetchCreateTarifasByIdComercio,
  fetchGetDataOficinas,
  fetchTarifasByIdComercio,
  fetchUpdateTarifasByIdComercio,
} from "../../../utils/tarifas";
import { notify, notifyError } from "../../../../../utils/notify";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import { useAuth } from "../../../../../hooks/AuthHooks";
import Table from "../../../../../components/Base/Table";
import { makeMoneyFormatter } from "../../../../../utils/functions";

const Tarifas = () => {
  const { roleInfo } = useAuth();
  const [initialDataTarifas, setInitialDataTarifas] = useState([]);
  const [dataTarifas, setDataTarifas] = useState([
    {
      "A1-A2": 0,
      B1: 0,
      "B2-C2": 0,
      "B3-C3": 0,
      C1: 0,
      A2B1: 0,
      A2C1: 0,
    },
  ]);
  const [comisiones, setComisiones] = useState([]);
  const [hasTarifas, setHasTarifas] = useState(false);

  const getTarifasByComercio = useCallback(async () => {
    try {
      const response = await fetchTarifasByIdComercio(roleInfo.id_comercio);
      if (!response.results.length) {
        setHasTarifas(false);
        return;
      }
      setHasTarifas(true);
      const tarifas = response?.results[0]?.tarifas;
      const tarifasArray = [tarifas];
      setInitialDataTarifas(tarifasArray || []);
      setDataTarifas(tarifasArray || []);
      const comisiones = await fetchGetDataOficinas(roleInfo.id_comercio);
      // console.log("comisiones", comisiones);
      setComisiones(comisiones.results[0].comision_originacion);
    } catch (error) {
      console.error(error);
    }
  }, [roleInfo.id_comercio]);

  const comisionsTable = useMemo(() => {
    const formatMoney = makeMoneyFormatter();
    return [
      {
        "A1-A2": formatMoney.format(comisiones["A"]),
        "B1-B2-B3": formatMoney.format(comisiones["B"]),
        "C1-C2-C3": formatMoney.format(comisiones["C"]),
        "A2-B1": formatMoney.format(comisiones["combos"]),
        "A2-C1": formatMoney.format(comisiones["combos"]),
      },
    ];
  }, [comisiones]);

  useEffect(() => {
    getTarifasByComercio();
  }, [getTarifasByComercio]);

  const createTarifasByComercio = useCallback(async () => {
    try {
      const body = {
        fk_id_comercio: roleInfo.id_comercio,
        tarifas: {
          "A1-A2": dataTarifas[0]["A1-A2"],
          B1: dataTarifas[0]["B1"],
          C1: dataTarifas[0]["C1"],
          "B2-C2": dataTarifas[0]["B2-C2"],
          "B3-C3": dataTarifas[0]["B3-C3"],
          A2B1: dataTarifas[0]["A2B1"],
          A2C1: dataTarifas[0]["A2C1"],
        },
      };
      // console.log(body);
      const response = await fetchCreateTarifasByIdComercio(body);
      // console.log(response);
      if (response?.status) {
        notify("Tarifas creadas correctamente");
        await getTarifasByComercio();
      } else {
        notifyError("No se pudo crear las tarifas");
      }
    } catch (error) {
      console.error(error);
    }
  }, [dataTarifas, getTarifasByComercio, roleInfo]);

  const updateTarifasByComercio = useCallback(async () => {
    try {
      const body = {
        tarifas: {
          "A1-A2": dataTarifas[0]["A1-A2"],
          B1: dataTarifas[0]["B1"],
          C1: dataTarifas[0]["C1"],
          "B2-C2": dataTarifas[0]["B2-C2"],
          "B3-C3": dataTarifas[0]["B3-C3"],
          A2B1: dataTarifas[0]["A2B1"],
          A2C1: dataTarifas[0]["A2C1"],
        },
      };
      // console.log(body);
      const response = await fetchUpdateTarifasByIdComercio(
        roleInfo.id_comercio,
        body
      );
      // console.log(response);
      if (response?.status) {
        notify("Tarifas actualizadas correctamente");
        await getTarifasByComercio();
      } else {
        notifyError("No se pudo actualizar las tarifas");
      }
    } catch (error) {
      console.error(error);
    }
  }, [dataTarifas, getTarifasByComercio, roleInfo]);

  return (
    <>
      {hasTarifas ? (
        <>
          <h1 className="text-2xl">Comisión Originación</h1>
          <Table
            data={comisionsTable}
            headers={["A1-A2", "B1-B2-B3", "C1-C2-C3", "A2-B1", "A2-C1"]}
          />
          <hr className="w-3/4 border-2 border-primary-extra-light" />
          <div className="grid grid-cols-2 gap-5">
            <div className="grid grid-cols-2 gap-y-10">
              <h1 className="col-span-2 text-2xl text-center">Tarifas</h1>
              <MoneyInput
                label="Tarifa A1-A2"
                value={parseInt(dataTarifas[0]["A1-A2"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "A1-A2": val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B1"
                value={parseInt(dataTarifas[0]["B1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], B1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa C1"
                value={parseInt(dataTarifas[0]["C1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], C1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B2-C2"
                value={parseInt(dataTarifas[0]["B2-C2"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "B2-C2": val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B3-C3"
                value={parseInt(dataTarifas[0]["B3-C3"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "B3-C3": val }]);
                }}
              />
              <div></div>
            </div>
            <div className="flex flex-col gap-20">
              <h1 className="text-2xl text-center">Tarifas Combos</h1>
              <MoneyInput
                label="Tarifa Combo A2-B1"
                value={parseInt(dataTarifas[0]["A2B1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], A2B1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa Combo A2-C1"
                value={parseInt(dataTarifas[0]["A2C1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], A2C1: val }]);
                }}
              />
            </div>
          </div>
          <ButtonBar>
            <Button
              onClick={updateTarifasByComercio}
              disabled={
                JSON.stringify(initialDataTarifas) ===
                  JSON.stringify(dataTarifas) ||
                dataTarifas[0]["A1-A2"] === 0 ||
                dataTarifas[0]["B1"] === 0 ||
                dataTarifas[0]["C1"] === 0 ||
                dataTarifas[0]["B2-C2"] === 0 ||
                dataTarifas[0]["B3-C3"] === 0
              }
              design="primary"
            >
              Actualizar tarifas
            </Button>
          </ButtonBar>
        </>
      ) : (
        <>
          <h1 className="text-2xl">
            Su comercio no tiene tarifas asignadas, por favor asígnelas.
          </h1>
          <div className="grid grid-cols-2 gap-5">
            <div className="grid grid-cols-2 gap-y-10">
              <h1 className="col-span-2 text-2xl text-center">Tarifas</h1>
              <MoneyInput
                label="Tarifa A1-A2"
                value={parseInt(dataTarifas[0]["A1-A2"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "A1-A2": val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B1"
                value={parseInt(dataTarifas[0]["B1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], B1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa C1"
                value={parseInt(dataTarifas[0]["C1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], C1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B2-C2"
                value={parseInt(dataTarifas[0]["B2-C2"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "B2-C2": val }]);
                }}
              />
              <MoneyInput
                label="Tarifa B3-C3"
                value={parseInt(dataTarifas[0]["B3-C3"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], "B3-C3": val }]);
                }}
              />
              <div></div>
            </div>
            <div className="flex flex-col gap-20">
              <h1 className="text-2xl text-center">Tarifas Combos</h1>
              <MoneyInput
                label="Tarifa Combo A2-B1"
                value={parseInt(dataTarifas[0]["A2B1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], A2B1: val }]);
                }}
              />
              <MoneyInput
                label="Tarifa Combo A2-C1"
                value={parseInt(dataTarifas[0]["A2C1"])}
                onInput={(e, val) => {
                  setDataTarifas([{ ...dataTarifas[0], A2C1: val }]);
                }}
              />
            </div>
          </div>
          <ButtonBar>
            <Button onClick={createTarifasByComercio} design="primary">
              Crear tarifas
            </Button>
          </ButtonBar>
        </>
      )}
    </>
  );
};

export default Tarifas;

