import { useState, useCallback, useEffect} from "react";
import Button from "../../../components/Base/Button";
import { useLoteria } from "../utils/LoteriaHooks";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import DescargaForm from "../components/DescargaForm/DescargaForm";
import ReportVentasForm from "../components/ReportVentasForm/ReportVentasForm";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { notifyError } from "../../../utils/notify";

const DescargarArchivosS3 = ({ route }) => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { descargaVentas_S3 } = useLoteria();
  const [urls, setUrls] = useState(false);
  const { con_SortVentas_S3 } = useLoteria();
  const [showModal2, setShowModal2] = useState(false);
  const [resp_con_sort, setResp_con_sort] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit}, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    fecha_ini: "",
    fecha_fin: "",
    sorteo: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setShowModal2(true);
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  const closeModal2 = useCallback(async () => {
    setShowModal2(false);
  }, []);

  const handleChange = (e) => {
    if (e.target.value) {
      setDatosTrans((old) => {
        return { ...old, fecha_ini: e.target.value };
      });
    }
  };

  const handleChange2 = (e) => {
    if (e.target.value) {
      setDatosTrans((old) => {
        return { ...old, fecha_fin: e.target.value };
      });
    }
  };

  useEffect(() => {
    fecthTablaSorteos();
  }, [datosTrans,page, limit])
  
  const fecthTablaSorteos = () => {
    con_SortVentas_S3({ 
      fecha_ini: datosTrans.fecha_ini,
      fecha_fin: datosTrans.fecha_fin,
      sorteo: datosTrans.sorteo,
      page,
      limit,
    })
      .then((res) => {
        if (res !== undefined) {
          if (!("msg" in res)) {
            setResp_con_sort(res.info ?? []);
            setMaxPages(res.num_datos ?? 1);

          } else {
            notifyError(res.msg);
            setResp_con_sort([]);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h1 class="text-3xl">Descarga de archivos</h1>
      <Form formDir="col" onSubmit={onSubmit}>
        <Button type="submit">Reporte ventas</Button>
      </Form>
      <Modal show={showModal} handleClose={closeModal}>
        <DescargaForm
          setShowModal={setShowModal}
          closeModal={closeModal} urls={urls} setUrls={setUrls} />
      </Modal>
      <Modal show={showModal2} handleClose={closeModal2}>
        <ReportVentasForm closeModal={closeModal2} Oficina="" />
      </Modal>
      <TableEnterprise
        title='Reporte de ventas'
        maxPage={maxPages}
        headers={["Sorteo", "Fecha de juego"]}
        onSetPageData={setPageData}
        data={resp_con_sort.map(({ num_sorteo, fecha_juego }) => {
          return {
            num_sorteo,
            fecha_juego,
          };
        })}
        onSelectRow={(_e, index) => {
          setSelected(resp_con_sort[index]);
          descargaVentas_S3(resp_con_sort[index]).then((res) => {
            if (res !== undefined) {
              if (!("msg" in res) && res?.length !== 0) {
                setUrls(res);
                setShowModal(true);
              } else {
                notifyError("No existen archivos")
              }
            } else {
              notifyError("No existen archivos parar descargar")
            }
          });
        }}
      >
        <Input
          id="num_sorteo"
          label="Número de sorteo"
          type="search"
          minLength="1"
          maxLength="4"
          autoComplete="false"
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, sorteo: e.target.value };
            });
          }}
        />
        <Input
          id="dateInit"
          label="Fecha inicial"
          type="date"
          onChange={handleChange}
        />
        <Input
          id="dateEnd"
          label="Fecha final"
          type="date"
          onInput={handleChange2}
        />
      </TableEnterprise>
      {/* <div>
        <Form grid>
          <Input
            id="num_sorteo"
            label="Número de sorteo"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="false"
            value={sorteo}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                setFecha_ini("");
                setFecha_fin("");
                setSorteo(e.target.value);
              }
            }}
            onLazyInput={{
              callback: (e) => {
                if (e.target.value !== "") {
                  con_SortVentas_S3(e.target.value, null, null, page).then(
                    (res) => {
                      if (res !== undefined) {
                        if (!("msg" in res)) {
                          setResp_con_sort(res.info);
                          setMaxPages(res.num_datos);
                        } else {
                          notifyError(res.msg);
                          setResp_con_sort("");
                        }
                      }
                    }
                  );
                }
              },
              timeOut: 1000,
            }}
          />
          {sorteo === "" ? (
            <>
              <div className="flex flex-row justify-center w-full">
              </div>

              <Input
                id="dateInit"
                label="Fecha inicial"
                type="date"
                value={fecha_ini}
                onChange={handleChange}
                onLazyInput={{
                  callback: (e) => {
                    if (fecha_fin !== "") {
                      con_SortVentas_S3(
                        sorteo,
                        e.target.value,
                        fecha_fin,
                        page
                      ).then((res) => {
                        if (res !== undefined) {
                          if (!("msg" in res)) {
                            setResp_con_sort(res.info);
                            setMaxPages(res.num_datos);
                          } else {
                            notifyError(res.msg);
                          }
                        }
                      });
                    }
                  },
                  timeOut: 1000,
                }}
              />
              <div className="flex flex-row justify-center w-full">
              </div>
              <Input
                id="dateEnd"
                label="Fecha final"
                type="date"
                value={fecha_fin}
                onInput={handleChange2}
                onLazyInput={{
                  callback: (e) => {
                    if (fecha_ini !== "") {
                      con_SortVentas_S3(
                        sorteo,
                        fecha_ini,
                        e.target.value,
                        page
                      ).then((res) => {
                        if (res !== undefined) {
                          if (!("msg" in res) && res?.length !== 0) {
                            setResp_con_sort(res.info);
                            setMaxPages(res.num_datos);
                          } else {
                            notifyError(res.msg)
                          }
                        }
                      });
                    }
                  },
                  timeOut: 1000,
                }}
              />
            </>
          ) : (
            ""
          )}
        </Form>
        {Array.isArray(resp_con_sort) && resp_con_sort.length > 0 ? (
          <>
            <Table
              headers={["Sorteo", "Fecha de juego"]}
              data={resp_con_sort.map(({ num_sorteo, fecha_juego }) => {
                return {
                  num_sorteo,
                  fecha_juego,
                };
              })}
              onSelectRow={(_e, index) => {
                setSelected(resp_con_sort[index]);
                descargaVentas_S3(resp_con_sort[index]).then((res) => {
                  if (res !== undefined) {
                    if (!("msg" in res) && res?.length !== 0) {
                      setUrls(res);
                      setShowModal(true);
                    } else {
                      notifyError("No existen archivos")
                    }
                  } else {
                    notifyError("No existen archivos parar descargar")

                  }
                });
              }}
            />
          </>
        ) : (
          ""
        )}
      </div> */}
    </>
  );
};

export default DescargarArchivosS3;
