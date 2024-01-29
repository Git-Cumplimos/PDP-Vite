import { Fragment, useCallback, useEffect, useState } from "react";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import useMap from "../../../../hooks/useMap";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import DataTable from "../../../../components/Base/DataTable";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { onChangeNumber } from "../../../../utils/functions";
import {
  descargarCSV,
  descargarTXT,
  onChangeEan13Number,
  changeDateFormat
} from "../../utils/functions";
import {
  getUrlRecaudosList,
  downloadCsvRecaudo,
  downloadTxtRecaudo,
  cargarArchivoRecaudo
} from "../../utils/fetchFunctions";

const initialSearchFilters = new Map([
  ["pk_id_convenio_directo", ""],
  ["ean13", ""],
  ["nombre_convenio", ""],
  ["page", 1],
  ["limit", 10],
]);

const GestionArchivosRecaudo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showModalOptions, setShowModalOptions] = useState(false);
  const [showModalErrors, setShowModalErrors] = useState(false);
  const [selected, setSelected] = useState(false); // fila selecionada

  const [listRecaudos, setListRecaudos] = useState([]);
  const [isNextPage, setIsNextPage] = useState(false);
  const [file, setFile] = useState(null);
  const typoArchivos = ["text/csv","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] 
  const [searchFilters, { setAll: setSearchFilters, set: setSingleFilter }] =
    useMap(initialSearchFilters);

  const [fetchTrxs] = useFetchDispatchDebounce({
    onSuccess: useCallback((data) => {
      setListRecaudos(data?.obj?.results ?? []);
      setIsNextPage(data?.obj?.next_exist);
    }, []),
    onError: useCallback((error) => {
      if (!error instanceof DOMException) console.error(error)
    }, []),
  },{delay:2000});

  const searchTrxs = useCallback(() => {
    const tempMap = new Map(searchFilters);
    const url = getUrlRecaudosList()
    tempMap.forEach((val, key, map) => {
      if (!val) {
        map.delete(key);
      }
    });
    const queries = new URLSearchParams(tempMap.entries()).toString();
    fetchTrxs(`${url}?${queries}`);
  }, [fetchTrxs, searchFilters]);

  useEffect(() => {
    searchTrxs();
  }, [searchTrxs]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setShowMainModal(false);
    setShowModalOptions(false);
    setShowModalErrors(false);
    setSelected(false);
  }, []);

  const CargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      if (!typoArchivos.includes(file.type)){
        notifyError('Tipo de archivo incorrecto')
        return;
      }
      if (selected.fk_id_tipo_convenio === 1 || selected.fk_id_tipo_convenio === 4) {
        notifyPending(
          cargarArchivoRecaudo(
            file,
            selected?.nombre_convenio,
            selected?.pk_id_convenio_directo,
          ),
          {
            render() {
              return "Enviando solicitud";
            },
          },
          {
            render({ data: res }) {
              handleClose();
              return res?.msg;
            },
          },
          {
            render({ data: err }) {
              if (err.msg !== "Error: Archivo vacio"){
                setShowModalErrors({ msg: err.msg, errores: err.obj?.error[0].complete_info })
                return `Archivo erróneo`;
              }
              handleClose()
              return err.msg
            },
          }
        );
      } else { notifyError("Convenio no permite cargar archivo") }

    }, [handleClose, file, selected]);

  const DescargarReporte = useCallback(
    async (e) => {
      const fechaActual = new Date();
      const año = fechaActual.getFullYear();
      const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
      const dia = fechaActual.getDate().toString().padStart(2, '0');
      const fechaFormateada = `${año}-${mes}-${dia}`;
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const timebody = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
      );
      const body = {
        convenio_id: selected.pk_id_convenio_directo,
        nombre_convenio:selected.nombre_convenio,
        tipo_archivo:selected.fk_nombre_tipo_archivo,
        ...timebody
      }
      if (body.convenio_id === 2) {
        if (body.fecha_inicial >= fechaFormateada) {
          notifyError('Error al generar el reporte, se debe seleccionar una fecha menor a la del día de hoy')
        }else{
          const tipoArchivo = {
            'Asobancaria 2011': downloadTxtRecaudo,
          };
          try {
            tipoArchivo[selected.fk_nombre_tipo_archivo](body)
              .then(async (res) => {
                if (selected.fk_nombre_tipo_archivo === 'Asobancaria 2011') {
                  descargarTXT(`Reporte_${selected?.nombre_convenio}`, res)
                  return;
                }
                notifyError('Funcion para este archivo en desarrollo')
              })
              .catch((err) => {
                if (err?.cause === "custom") {
                  notifyError(err?.message);
                  return;
                }
                notifyError(err);
                handleClose();
              });
          } catch (e) { console.log(e) }
          handleClose();
        }
      }else{
        const tipoArchivo = {
          'Reporte Generico csv': downloadCsvRecaudo,
          'Asobancaria 2001': downloadTxtRecaudo,
          'Asobancaria 2011': downloadTxtRecaudo,
        };
        try {
          tipoArchivo[selected.fk_nombre_tipo_archivo](body)
            .then(async (res) => {
              if (selected.fk_nombre_tipo_archivo === 'Reporte Generico csv') {
                descargarCSV(`Reporte_${selected?.nombre_convenio}`, res)
                return;
              }
              if (selected.fk_nombre_tipo_archivo === 'Asobancaria 2001') {
                descargarTXT(`Reporte_${selected?.nombre_convenio}`, res)
                return;
              }
              if (selected.fk_nombre_tipo_archivo === 'Asobancaria 2011') {
                descargarTXT(`Reporte_${selected?.nombre_convenio}`, res)
                return;
              }
              notifyError('Funcion para este archivo en desarrollo')
            })
            .catch((err) => {
              if (err?.cause === "custom") {
                notifyError(err?.message);
                return;
              }
              notifyError(err);
              handleClose();
            });
        } catch (e) { console.log(e) }
        handleClose();
      }
      // const tipoArchivo = {
      //   'Reporte Generico csv': downloadCsvRecaudo,
      //   'Asobancaria 2001': downloadTxtRecaudo,
      //   'Asobancaria 2011': downloadTxtRecaudo,
      // };
      // try {
      //   tipoArchivo[selected.fk_nombre_tipo_archivo](body)
      //     .then(async (res) => {
      //       if (selected.fk_nombre_tipo_archivo === 'Reporte Generico csv') {
      //         descargarCSV(`Reporte_${selected?.nombre_convenio}`, res)
      //         return;
      //       }
      //       if (selected.fk_nombre_tipo_archivo === 'Asobancaria 2001') {
      //         descargarTXT(`Reporte_${selected?.nombre_convenio}`, res)
      //         return;
      //       }
      //       if (selected.fk_nombre_tipo_archivo === 'Asobancaria 2011') {
      //         descargarTXT(`Reporte_${selected?.nombre_convenio}`, res)
      //         return;
      //       }
      //       notifyError('Funcion para este archivo en desarrollo')
      //     })
      //     .catch((err) => {
      //       if (err?.cause === "custom") {
      //         notifyError(err?.message);
      //         return;
      //       }
      //       notifyError(err);
      //       handleClose();
      //     });
      // } catch (e) { console.log(e) }
      // handleClose();
    }, [handleClose, selected]);

  const DescargarErrores = useCallback(
    async () => {
      let errores = []

      if (Array.isArray(showModalErrors?.errores)) {
        errores.push(['Linea', 'Columna', 'Descripcion'])
        showModalErrors?.errores.map((err_esp) => {
          Object.keys(err_esp.error).map((item) => {
            errores.push([err_esp.line, item, err_esp.error[item]])
            return null
          })
          return null
        })
      } else {
        errores.push(['ERRORES EN HEADERS', ''], ['Columna', 'Descripcion'])
        Object.keys(showModalErrors?.errores).map((item) => {
          errores.push([item, showModalErrors?.errores[item]])
          return null
        })
      }
      descargarCSV('Errores_del_archivo', errores)
      handleClose();
    }, [handleClose, showModalErrors]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Gestión de Archivos de Recaudos</h1>
      <DataTable
        title="Convenios de Recaudos"
        headers={[
          "Código convenio",
          "Código EAN o IAC",
          "Nombre convenio",
          "Estado",
          "Fecha creación",
        ]}
        data={listRecaudos.map(
          ({
            pk_id_convenio_directo,
            ean13,
            nombre_convenio,
            estado,
            fecha_creacion,
          }) => {
            fecha_creacion = changeDateFormat(fecha_creacion)
            return {
              pk_id_convenio_directo,
              ean13,
              nombre_convenio,
              estado: estado ? "Activo" : "No activo",
              fecha_creacion: fecha_creacion ?? "ninguna",
            }
          }
        )}
        onClickRow={(_, index) => {
          setShowModal(true);
          setSelected(listRecaudos[index]);
        }}
        tblFooter={
          <Fragment>
            <DataTable.LimitSelector
              defaultValue={10}
              onChangeLimit={(limit) => {
                setSingleFilter("limit", limit);
                setSingleFilter("page", 1)
              }}
            />
            <DataTable.PaginationButtons
              onClickNext={(_) =>
                setSingleFilter("page", (oldPage) =>
                  isNextPage ? oldPage + 1 : oldPage
                )
              }
              onClickPrev={(_) =>
                setSingleFilter("page", (oldPage) =>
                  oldPage > 1 ? oldPage - 1 : oldPage
                )
              }
            />
          </Fragment>
        }
        onChange={(ev) => {
          setSearchFilters((old) => {
            const copy = new Map(old)
              .set(
                ev.target.name, ev.target.value
              )
              .set("page", 1);
            return copy;
          })
        }}
      >
        <Input
          id={"pk_codigo_convenio"}
          label={"Código de convenio"}
          name={"pk_id_convenio_directo"}
          type="tel"
          maxLength={"4"}
          onInput={(ev) => { ev.target.value = onChangeNumber(ev); }}
          autoComplete="off"
        />
        <Input
          id={"codigo_ean_iac_search"}
          label={"Código EAN o IAC"}
          name={"ean13"}
          type="tel"
          autoComplete="off"
          maxLength={"13"}
          onInput={(ev) => { ev.target.value = onChangeEan13Number(ev); }}
        />
        <Input
          id={"nombre_convenio"}
          label={"Nombre del convenio"}
          name={"nombre_convenio"}
          type="text"
          autoComplete="off"
          maxLength={"30"}
        />
      </DataTable>
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivos de recaudo
        </h2>
        <ButtonBar>
          {(selected.fk_id_tipo_convenio === 1 || selected.fk_id_tipo_convenio === 4) && selected.estado && (
            <Button
              onClick={() => {
                setShowMainModal(true);
                setShowModalOptions(true);
              }}
            >
              Cargar Archivo
            </Button>
          )}
          <Button
            onClick={() => {
              setShowMainModal(true);
            }}
          >
            Descargar Reporte
          </Button>
        </ButtonBar>
      </Modal>
      <Modal show={showMainModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivos de recaudo
        </h2>
        <Form onSubmit={showModalOptions ? CargarArchivo : DescargarReporte}>
          {showModalOptions && (
            <Input
              type="file"
              autoComplete="off"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              accept=".csv,.xlsx"
              required
            />
          )}
          {!showModalOptions && (
            <>
              <Input
                type="date"
                autoComplete="off"
                name={"fecha_inicial"}
                label={`Fecha${selected.fk_nombre_tipo_archivo === 'Reporte Generico csv'? " inicial":""}`}
                required
              />
              {selected.fk_nombre_tipo_archivo === 'Reporte Generico csv' && (
                <Input
                  type="date"
                  autoComplete="off"
                  name={"fecha_final"}
                  label={"Fecha final"}
                  required
                />
              )}

            </>
          )}
          <ButtonBar>
            <Button type="submit">
              {showModalOptions ? "Cargar Archivo" : "Descargar Reporte"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
      <Modal show={showModalErrors} handleClose={handleClose}>
        <h2 className="text-2xl mx-auto text-center mb-4">
          {showModalErrors?.msg ?? "Errores en el archivo"}
        </h2>
        <ButtonBar>
          <Button onClick={() => { DescargarErrores() }}>
            Descargar errores del archivo
          </Button>
        </ButtonBar>
      </Modal >
    </Fragment >
  );
};

export default GestionArchivosRecaudo;
