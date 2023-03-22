import { Fragment, useCallback, useEffect, useState } from "react";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { notifyError, notifyPending } from "../../../../utils/notify";
import {
  getRecaudosList,
  downloadFileRecaudo,
} from "../../utils/fetchFunctions";
import { ExportToCsv } from "export-to-csv";
import { cargarArchivoRecaudo } from "../../utils/functions";

const GestionArchivosRecaudo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [showModalOptions, setShowModalOptions] = useState(false);
  const [showModalErrors, setShowModalErrors] = useState(false);
  const [selected, setSelected] = useState(false); // fila selecionada

  const [listRecaudos, setListRecaudos] = useState("");
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [maxPages, setMaxPages] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [file, setFile] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    pk_id_convenio_directo: "",
    ean13: "",
    nombre_convenio: "",
  });

  useEffect(() => {
    setPageData((pageData) => ({ ...pageData, page: 1 }));
  }, [pageData.limit]);

  const getRecaudos = useCallback(async () => {
    await getRecaudosList({
      ...pageData,
      ...searchFilters,
    })
      .then((data) => {
        setListRecaudos(data?.obj?.results ?? []);
        setMaxPages(data?.obj?.maxPages ?? "");
      })
      .catch((err) => {
        // if (err?.cause === "custom") {
        //   notifyError(err?.message);
        //   return;
        // }
        console.error(err?.message);
      });
    setCargando(true);
  }, [pageData, searchFilters]);

  useEffect(() => {
    getRecaudos();
  }, [getRecaudos, pageData, searchFilters]);

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

      if (selected.fk_id_tipo_convenio === 1) {

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
              setShowModalErrors(err)
              return `Archivo erroneo`;
            },
          }
        );
      } else {
        notifyError("Convenio no permite cargar archivo");
      }
    },
    [handleClose, file, selected]
  );

  const DescargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const body = Object.fromEntries(
        Object.entries(Object.fromEntries(formData))
      );
      try {
        downloadFileRecaudo({
          ...body,
          convenio_id: selected.pk_id_convenio_directo,
        })
          .then(async (res) => {
            const options = {
              fieldSeparator: ";",
              quoteStrings: '"',
              decimalSeparator: ",",
              showLabels: true,
              showTitle: false,
              title: `Reporte_${selected?.nombre_convenio}`,
              useTextFile: false,
              useBom: true,
              useKeysAsHeaders: false,
              filename: `Reporte_${selected?.nombre_convenio}`,
            };
            const csvExporter = new ExportToCsv(options);
            const data = JSON.stringify(res);
            csvExporter.generateCsv(data);
          })
          .catch((err) => {
            if (err?.cause === "custom") {
              notifyError(err?.message);
              return;
            }
            notifyError(err);
            handleClose();
          });
      } catch (e) {
        console.log(e);
      }

      handleClose();
    },
    [handleClose, selected]
  );

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Gestion de Archivos de Recaudos</h1>
      {cargando ? (
        <>
          <TableEnterprise
            title="Convenios de Recaudos"
            headers={[
              "Código convenio",
              "Código EAN o IAC",
              "Nombre convenio",
              "Permite vencidos",
              "Estado",
              "Fecha creacion",
            ]}
            data={listRecaudos.map(
              ({
                pk_id_convenio_directo,
                ean13,
                nombre_convenio,
                permite_vencidos,
                estado,
                fecha_creacion,
              }) => ({
                pk_id_convenio_directo,
                ean13,
                nombre_convenio,
                permite_vencidos: permite_vencidos ? "Verdadero" : "Falso",
                estado: estado ? "Activo" : "No activo",
                fecha_creacion: fecha_creacion ?? "ninguna",
              })
            )}
            onSelectRow={(e, i) => {
              setShowModal(true);
              setSelected(listRecaudos[i]);
            }}
            maxPage={maxPages}
            onSetPageData={setPageData}
            onChange={(ev) => {
              setSearchFilters((old) => ({
                ...old,
                [ev.target.name]: ev.target.value,
              }));
            }}
          >
            <Input
              id={"pk_codigo_convenio"}
              label={"Código de convenio"}
              name={"pk_id_convenio_directo"}
              type="tel"
              autoComplete="off"
              maxLength={"4"}
              onChange={(ev) => { }}
            />
            <Input
              id={"codigo_ean_iac_search"}
              label={"Código EAN o IAC"}
              name={"ean13"}
              type="tel"
              autoComplete="off"
              maxLength={"13"}
              onChange={(ev) => { }}
            />
            <Input
              id={"nombre_convenio"}
              label={"Nombre del convenio"}
              name={"nombre_convenio"}
              type="text"
              autoComplete="off"
              maxLength={"30"}
              onChange={(ev) => { }}
            />
          </TableEnterprise>
        </>
      ) : (
        <>cargando...</>
      )}
      <Modal show={showModal} handleClose={handleClose}>
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestion de archivos de recaudo
        </h2>
        <ButtonBar>
          {selected.fk_id_tipo_convenio === 1 && selected.estado  && (
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
          Gestion de archivos de recaudo
        </h2>
        <Form onSubmit={showModalOptions ? CargarArchivo : DescargarArchivo}>
          {showModalOptions && (
            <Input
              // label='Seleccionar Archivo'
              type="file"
              accept=".csv"
              autoComplete="off"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
              required
            />
          )}
          {!showModalOptions && (
            <>
              <Input
                type="date"
                autoComplete="off"
                name={"fecha_inicial"}
                label={"Fecha inicial"}
                required
              />
              <Input
                type="date"
                autoComplete="off"
                name={"fecha_final"}
                label={"Fecha final"}
                required
              />
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
          {showModalErrors.msg ?? "Errores en el archivo"}
        </h2>
        {showModalErrors?.obj?.error?.map((err) => {
          return (<>
            {
              Array.isArray(err.complete_info) && err.complete_info.length > 1 ? (
                err.complete_info.map((err_esp,index) => {
                  return (
                    <div key={index+10}>
                      <h3>Linea {err_esp.line}</h3>
                      {Array.isArray(Object.keys(err_esp.error)) ? (
                        Object.keys(err_esp.error).map((item, index) => {
                          return (
                            <div key={index}>
                              <h3>{Object.keys(err_esp.error)[index]}</h3>
                              <h3>Descripcion: {Object.values(err_esp.error)[index]}</h3>
                            </div>
                          )
                        })
                      ) : (
                        <div key={index}>
                          <h3>{Object.keys(err_esp.error)}</h3>
                          <h3>Descripcion: {Object.values(err_esp.error)}</h3>
                        </div>
                      )
                      }
                      <hr></hr>
                    </div>
                  )
                })
              ) : (
                Object.keys(err.complete_info).map((item, index) => {
                  return (
                    <div key={index}>
                      <h3>{Object.keys(err.complete_info)[index]}</h3>
                      <h3>Descripcion: {Object.values(err.complete_info)[index]}</h3>
                      <hr></hr>
                    </div>
                  )
                })
              )
            }
          </>)
        })}

      </Modal>
    </Fragment>
  );
};

export default GestionArchivosRecaudo;
