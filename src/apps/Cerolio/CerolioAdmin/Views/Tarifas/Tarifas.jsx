import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [filters, setFilters] = useState({
    nombre: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });

  const [dataTarifas, setDataTarifas] = useState([]);

  const getTarifasByComercio = useCallback(async () => {
    try {
      // TODO Hector corregir filtro de nombre
      const response = await fetchGetDataOficinas("", filters.nombre);
      console.log("response", response);
      setDataTarifas(response.results);
      setMaxPages(response.maxPages);
    } catch (error) {
      console.error(error);
    }
  }, [filters]);

  useEffect(() => {
    getTarifasByComercio();
  }, [filters, pageData, getTarifasByComercio]);

  const tableTarifas = useMemo(() => {
    const formatMoney = makeMoneyFormatter();
    return dataTarifas.map((tarifa) => ({
      "Fecha de cambio": tarifa.fecha_modificacion
        ? new Date(tarifa.fecha_modificacion).toLocaleDateString()
        : "",
      "ID OAT": tarifa.pk_id_oficina,
      OAT: tarifa.tipo_oat,
      Nombre: tarifa.nombre,
      "Tarifa A": formatMoney.format(tarifa.comision_originacion.A),
      "Tarifa B": formatMoney.format(tarifa.comision_originacion.B),
      "Tarifa Licencia C": formatMoney.format(tarifa.comision_originacion.C),
      "Tarifa Combos": formatMoney.format(tarifa.comision_originacion.combos),
      // TODO Hacer modal para actualizar las comisiones endpoint oficinas/modificar
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
          {/* Cargar con el metodo cargar, con la prefirmada y validar la respuesta */}
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
        <Input
          label="Nombre"
          placeholder="Nombre"
          onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
        />
      </TableEnterprise>
      <ButtonBar>
        {/* TODO Hector pendiente Descargar reporte  */}
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
