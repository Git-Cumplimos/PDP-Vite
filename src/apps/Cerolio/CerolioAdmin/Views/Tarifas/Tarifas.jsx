import { useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Modal from "../../../../../components/Base/Modal";
import FileInput from "../../../../../components/Base/FileInput";
import { fetchGetDataOficinas } from "../../../utils/tarifas";
import { makeMoneyFormatter } from "../../../../../utils/functions";

const Tarifas = () => {
  const [modalCargueMasivo, setModalCargueMasivo] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [dataTarifas, setDataTarifas] = useState([]);

  const getTarifasByComercio = async () => {
    try {
      const response = await fetchGetDataOficinas();
      // console.log("response", response);
      setDataTarifas(response.results);
      setMaxPages(response.maxPages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTarifasByComercio();
  }, []);

  const tableTarifas = useMemo(() => {
    const formatMoney = makeMoneyFormatter();
    return dataTarifas.map((tarifa) => ({
      // TODO Datos faltantes
      "Fecha de cambio": "Fecha",
      "ID OAT": tarifa.pk_id_oficina,
      OAT: tarifa.nombre,
      Nombre: "Nombre",
      "Tarifa A": formatMoney.format(tarifa.comision_originacion.A),
      "Tarifa B": formatMoney.format(tarifa.comision_originacion.B),
      "Tarifa Licencia C": formatMoney.format(tarifa.comision_originacion.C),
      "Tarifa Combos": formatMoney.format(tarifa.comision_originacion.combos),
      Acciones: "Acciones",
    }));
  }, [dataTarifas]);

  return (
    <>
      <ButtonBar>
        <Button
          className="text-white bg-primary"
          onClick={() => setModalCargueMasivo(true)}
        >
          {/* TODO Cargue masivo */}
          Cargue masivo tarifas
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Tarifas"
        headers={[
          "Fecha de cambio",
          "ID OAT",
          "OAT",
          "Nombre",
          "Tarifa A",
          "Tarifa B",
          "Tarifa C",
          "Tarifa Combos",
          "Acciones",
        ]}
        data={tableTarifas}
        maxPage={maxPages}
        onSetPageData={setPageData}
      >
        {/* Input para nombre */}
        <Input label="Nombre" placeholder="Nombre" />
      </TableEnterprise>
      <ButtonBar>
        {/* TODO Descargar reporte */}
        <Button>Descargar reporte</Button>
        <Button onClick={getTarifasByComercio}>Actualizar</Button>
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
