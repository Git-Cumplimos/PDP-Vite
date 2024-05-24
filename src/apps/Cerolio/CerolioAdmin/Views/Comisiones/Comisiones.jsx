import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import Input from "../../../../../components/Base/Input";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Modal from "../../../../../components/Base/Modal";
import FileInput from "../../../../../components/Base/FileInput";
import {
  fetchGetDataOficinas,
  fetchGetReporte,
  fetchGetValidateUpload,
  fetchUpdateComisionesByIdComercio,
} from "../../../utils/tarifas";
import { makeMoneyFormatter } from "../../../../../utils/functions";
import MoneyInput from "../../../../../components/Base/MoneyInput";
import { notify, notifyError } from "../../../../../utils/notify";
import {
  fetchGetUploadToS3,
  uploadFilePresignedUrl,
} from "../../../utils/general";
// import { useAuth } from "../../../../../hooks/AuthHooks";

const Tarifas = () => {
  // const { roleInfo } = useAuth();
  const [modalCargueMasivo, setModalCargueMasivo] = useState(false);
  const [modalActualizarTarifa, setModalActualizarTarifa] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [file, setFile] = useState({});
  const [filters, setFilters] = useState({
    nombre: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({ page: 1, limit: 10 });

  const [dataTarifas, setDataTarifas] = useState([]);

  const getTarifasByComercio = useCallback(async () => {
    try {
      const response = await fetchGetDataOficinas(
        "",
        filters.nombre,
        page,
        limit
      );
      // console.log("response", response);
      setDataTarifas(response.results);
      setMaxPages(response.maxPages);
    } catch (error) {
      console.error(error);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    getTarifasByComercio();
  }, [filters, getTarifasByComercio, page, limit]);

  const handleOpenModificar = useCallback((e, item) => {
    setModalActualizarTarifa(true);
    // console.log("Modificar", item);
    setSelectedItem(item);
  }, []);

  const handleOpenCargueMasivo = useCallback((e, item) => {
    setModalCargueMasivo(true);
    // console.log("Modificar", item);
    setSelectedItem(item);
  }, []);

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
      Acciones: (
        <div className="flex">
          <Button
            title="Modificar"
            design="primary"
            onClick={(e) => {
              handleOpenModificar(e, tarifa);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil"
              viewBox="0 0 16 16"
            >
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
            </svg>
          </Button>
        </div>
      ),
    }));
  }, [dataTarifas, handleOpenModificar]);

  const cargueMasivo = useCallback(async () => {
    try {
      // console.log("Cargue item", selectedItem);
      // console.log("Cargue data", file);
      const now = new Date().toISOString();
      const certPresigned = await fetchGetUploadToS3(
        `comisiones/archivos_comisiones/comisiones-${now}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      // console.log("certPresigned", certPresigned);
      if (certPresigned.status) {
        const upload = await uploadFilePresignedUrl(certPresigned.obj, file);
        // console.log("upload", upload);
        if (upload.ok) {
          // Esperar 5 segundos
          setTimeout(async () => {
            const validacion = await fetchGetValidateUpload(
              `comisiones-${now}.xlsx`
            );
            // console.log("validacion", validacion);
            if (validacion.status) {
              notify(validacion.msg);
              await getTarifasByComercio();
              setModalCargueMasivo(false);
            } else {
              console.error(validacion.msg);
              notifyError(validacion.msg);
            }
          }, 5000);
        } else {
          console.error(upload);
          notifyError(upload.statusText);
        }
      } else {
        console.error(certPresigned.msg);
        notifyError(certPresigned.msg);
      }
    } catch (err) {
      console.error(err);
    }
    await getTarifasByComercio();
  }, [file, getTarifasByComercio]);

  const updateTarifas = useCallback(async () => {
    // console.log("updateTarifas", selectedItem.comision_originacion);
    try {
      const body = {
        comision_originacion: {
          A: selectedItem.comision_originacion.A,
          B: selectedItem.comision_originacion.B,
          C: selectedItem.comision_originacion.C,
          combos: selectedItem.comision_originacion.combos,
        },
      };
      const res = await fetchUpdateComisionesByIdComercio(
        selectedItem.pk_id_oficina,
        body
      );
      // console.log("res", res);
      if (res.status) {
        notify(res.msg);
        getTarifasByComercio();
        setSelectedItem({});
        setModalActualizarTarifa(false);
      } else {
        notifyError(res.msg);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedItem, getTarifasByComercio]);

  const downloadReporte = useCallback(async () => {
    // console.log("downloadReporte", selectedItem.comision_originacion);
    try {
      const res = await fetchGetReporte();
      // roleInfo.id_comercio,
      // roleInfo.nombre_comercio
      // console.log("res", res);
      if (res.status) {
        notify(res.msg);
        // Descargar el archivo
        const archivo = res.obj.url;
        // Crear un link con el archivo
        const link = document.createElement("a");
        link.href = archivo;
        link.download = res.obj.archivo;
        // Agregar el link al body
        document.body.appendChild(link);
        // Simular click
        link.click();
        // Eliminar el link
        document.body.removeChild(link);
      } else {
        notifyError(res.msg);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <ButtonBar>
        <Button
          className="text-white bg-primary"
          onClick={() => handleOpenCargueMasivo()}
        >
          Cargue masivo tarifas
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Comisión Originación"
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
        <Button onClick={downloadReporte}>Descargar reporte</Button>
        <Button onClick={getTarifasByComercio}>Actualizar</Button>
      </ButtonBar>
      <Modal show={modalCargueMasivo}>
        <h1 className="text-2xl">Cargue masivo tarifas</h1>
        <FileInput
          label="Cargue el archivo Excel"
          accept=".xlsx"
          onGetFile={(file) => setFile(file[0])}
        />
        {file && <p className="text-center">Archivo cargado: {file?.name}</p>}
        <ButtonBar>
          <Button onClick={() => setModalCargueMasivo(false)}>Cancelar</Button>
          <Button onClick={cargueMasivo} disabled={!file} design="primary">
            Guardar
          </Button>
        </ButtonBar>
      </Modal>
      <Modal show={modalActualizarTarifa}>
        <h1 className="mb-3 text-2xl">Actualizar tarifa</h1>
        <div className="flex flex-col gap-5">
          <MoneyInput
            label="Tarifa A"
            value={selectedItem?.comision_originacion?.A}
            onInput={(e, i) =>
              setSelectedItem({
                ...selectedItem,
                comision_originacion: {
                  ...selectedItem.comision_originacion,
                  A: i,
                },
              })
            }
          />
          <MoneyInput
            label="Tarifa B"
            value={selectedItem?.comision_originacion?.B}
            onInput={(e, i) =>
              setSelectedItem({
                ...selectedItem,
                comision_originacion: {
                  ...selectedItem.comision_originacion,
                  B: i,
                },
              })
            }
          />
          <MoneyInput
            label="Tarifa C"
            value={selectedItem?.comision_originacion?.C}
            onInput={(e, i) =>
              setSelectedItem({
                ...selectedItem,
                comision_originacion: {
                  ...selectedItem.comision_originacion,
                  C: i,
                },
              })
            }
          />
          <MoneyInput
            label="Tarifa Combos"
            value={selectedItem?.comision_originacion?.combos}
            onInput={(e, i) =>
              setSelectedItem({
                ...selectedItem,
                comision_originacion: {
                  ...selectedItem.comision_originacion,
                  combos: i,
                },
              })
            }
          />
        </div>
        <ButtonBar>
          <Button
            onClick={() => {
              setSelectedItem({});
              setModalActualizarTarifa(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={updateTarifas} design="primary">
            Guardar
          </Button>
        </ButtonBar>
      </Modal>
    </>
  );
};

export default Tarifas;
