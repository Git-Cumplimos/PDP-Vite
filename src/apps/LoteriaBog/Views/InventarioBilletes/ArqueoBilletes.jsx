import { useState, useCallback, useEffect, useMemo } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { useLoteria } from "../../utils/LoteriaHooks";
import Form from "../../../../components/Base/Form";
import Table from "../../../../components/Base/Table";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import DescargaForm from "../../components/DescargaForm/DescargaForm";
import SubPage from "../../../../components/Base/SubPage/SubPage";
import ReportVentasForm from "../../components/ReportVentasForm/ReportVentasForm";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import fetchData from "../../../../utils/fetchData";
import Select from "../../../../components/Base/Select";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

const formatMoney = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const url_reportVentas = `${process.env.REACT_APP_URL_LOTERIAS}/reportes_ventas`;
const url_Arqueobilletes = `${process.env.REACT_APP_URL_LOTERIAS}/arqueobilletes`;
const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;

const ArqueoBilletes = ({ route }) => {
  /*__________ Fechas para consulta de transacciones del día________________ */
  const fecha = new Date();
  const fecha_ini = fecha.toISOString();
  fecha.setDate(fecha.getDate() + 1);
  const fecha_fin = fecha.toISOString();
  /*_________________________________________________________ */

  const { userPermissions } = useAuth();

  const { label } = route;

  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [resp_con_sort, setResp_con_sort] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fracDisp, setFracDisp] = useState("");
  const [total, setTotal] = useState(null);
  const [showArqueo, setShowArqueo] = useState(false);
  const [id_arqueo, setId_arqueo] = useState("");
  const { roleInfo } = useAuth();

  const { con_SortVentas_S3 } = useLoteria();
  const [showModal2, setShowModal2] = useState(false);

  const [sorteoOrdi, setSorteoOrdi] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);

  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);
  const [idComercio, setIdComercio] = useState(-1);
  const [datosArqueo, setDatosArqueo] = useState([]);
  const [date_init, setDate_init] = useState("");
  const [date_end, setDate_end] = useState("");
  const [showInput, setShowInput] = useState(false)

  const { codigos_lot, setCodigos_lot, codigosOficina, setCodigosOficina } =
    useLoteria();

  const sorteosLOT = useMemo(() => {
    var cod = "";
    if (codigos_lot?.length === 2) {
      cod = `${codigos_lot?.[0]?.cod_loteria},${codigos_lot?.[1]?.cod_loteria}`;
    } else {
      cod = `${codigos_lot?.[0]?.cod_loteria}`;
    }
    return cod;
  }, [codigos_lot]);

  useEffect(() => {
    setIdComercio(roleInfo?.id_comercio || -1);
  }, [roleInfo]);

  useEffect(() => {
    const query = {
      num_loteria: sorteosLOT,
    };
    fetchData(urlLoto, "GET", query, {})
      .then((res) => {
        ////sorteo virtual
        setSorteoOrdi(null);
        setSorteoExtra(null);
        setSorteofisico(null);
        setSorteofisicoextraordinario(null);
        ///sorteo fisico
        const sortOrdfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && fisico;
        });
        const sortExtfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && fisico;
        });

        if (sortOrdfisico.length > 0) {
          setSorteofisico(sortOrdfisico[0]);
        } else {
          /*    notifyError("No se encontraron extraordinarios fisicos"); */
        }

        if (sortExtfisico.length > 0) {
          setSorteofisicoextraordinario(sortExtfisico[0]);
        } else {
          /*   notifyError("No se encontraron extraordinarios fisicos"); */
        }
      })
      .catch((err) => console.error(err));
  }, [codigos_lot, sorteosLOT]);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    const copy = [{ value: "", label: "" }];
    if (sorteoOrdi !== null) {
      copy.push({
        value: `${sorteoOrdi.num_sorteo}-${sorteoOrdi.fisico}-${sorteoOrdi.num_loteria}`,
        label: `Sorteo ordinario - ${sorteoOrdi.num_sorteo}`,
      });
    }
    if (sorteoExtra !== null) {
      copy.push({
        value: `${sorteoExtra.num_sorteo}-${sorteoExtra.fisico}-${sorteoExtra.num_loteria}`,
        label: `Sorteo extraordinario - ${sorteoExtra.num_sorteo}`,
      });
    }
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.fisico}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo ordinario  fisico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.fisico}-${sorteoExtrafisico.num_loteria}`,
        label: `Sorteo extraordinario fisico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);
  }, [
    sorteoExtra,
    sorteoExtrafisico,
    sorteoOrdi,
    sorteoOrdifisico,
    sorteosLOT,
    codigos_lot,
  ]);

  const onSubmit = (e) => {
    e.preventDefault();
    crearArqueoBilletes(fecha_ini, fracDisp, total, id_arqueo, sorteo).then(
      (res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          setShowArqueo(false);
          consultaArqueoBilletes(
            1,
            fecha_ini,
            fecha_fin,
            sorteo,
            idComercio
          ).then((res) => {
            if (!res?.status) {
              notifyError(res.msg);
              // setDisabledBtns(true);
            } else {
              // setResp_report(res.data);
              setId_arqueo(res?.obj?.data?.[0].id_arqueo);
              // setDisabledBtns(false);
            }
          });
          // setDisabledBtns(true);
        } else {
          // setResp_report(res.data);
          setShowArqueo(true);
          notify(res.msg);
          consultaArqueoBilletes(
            1,
            fecha_ini,
            fecha_fin,
            sorteo,
            idComercio
          ).then((res) => {
            if (!res?.status) {
              notifyError(res.msg);
              // setDisabledBtns(true);
            } else {
              // setResp_report(res.data);
              setId_arqueo(res?.obj?.data?.[0].id_arqueo);
              // setDisabledBtns(false);
            }
          });
          // setDisabledBtns(false);
        }
      }
    );
  };

  const reportVentas = useCallback(
    async (fecha_ini, fecha_fin, sorteo) => {
      if (sorteo !== "") {
        try {
          const query = {
            fecha_ini: fecha_ini.substr(0, 10),
            fecha_fin: fecha_fin.substr(0, 10),
            num_loteria: sorteosLOT,
          };
          if ("cod_oficina_lot" in codigosOficina) {
            query.cod_distribuidor = codigosOficina?.cod_oficina_lot;
            query.cod_sucursal = codigosOficina?.cod_sucursal_lot;
          }
          if (sorteo !== null) {
            query.sorteo = sorteo;
          }

          // query.arqueo = "Si";
          const res = await fetchData(url_reportVentas, "GET", query);

          return res;
        } catch (err) {
          console.error(err);
        }
      }
    },
    [sorteosLOT, codigosOficina]
  );

  const crearArqueoBilletes = useCallback(
    async (fecha_ini, fracDisp, total, id_arqueo, sorteo) => {
      try {
        const body = {
          cod_distribuidor: codigosOficina?.cod_oficina_lot,
          cod_sucursal: codigosOficina?.cod_sucursal_lot,
          id_comercio: roleInfo?.id_comercio,
          id_usuario: roleInfo?.id_usuario,
          id_terminal: roleInfo?.id_dispositivo,
          fecha: fecha_ini.substr(0, 10),
          frac_vendidas: total === null ? 0 : total?.total_frac,
          val_total: total === null ? 0 : total?.val_total,
          fracciones_restantes: fracDisp,
          sorteo: sorteo,
        };

        if (id_arqueo) {
          body.id_arqueo = id_arqueo;
        } else {
          body.id_arqueo = "";
        }
        const res = await fetchData(url_Arqueobilletes, "POST", {}, body);

        return res;
      } catch (err) {
        console.error(err);
      }
    },
    [codigosOficina, roleInfo]
  );

  const consultaArqueoBilletes = useCallback(
    async (page, fecha_ini, fecha_fin, sorteo, Comercio) => {
      if (sorteo !== "") {
        try {
          const query = {
            numero: page,
            sorteo: sorteo,
          };

          if (fecha_ini !== "" && fecha_fin !== "") {
            query.fecha_ini = fecha_ini.substr(0, 10);
            query.fecha_fin = fecha_fin.substr(0, 10);
          }

          if (!(Comercio === -1 || Comercio === "")) {
            query.id_comercio = parseInt(Comercio);
          }

          const res = await fetchData(url_Arqueobilletes, "GET", query);

          return res;
        } catch (err) {
          console.error(err);
        }
      }
    },
    []
  );

  // useEffect(() => {
  //   if (userPermissions.map(({ id_permission }) => id_permission).includes(3)) {
  //     reportVentas(fecha_ini, fecha_fin).then((res) => {
  //       if ("msg" in res) {
  //         notifyError(res.msg);
  //         // setDisabledBtns(true);
  //       } else {
  //         // setResp_report(res.data);
  //         setTotal(res.total);
  //         // setDisabledBtns(false);
  //       }
  //     });
  //   }
  // }, [userPermissions]);

  // useEffect(() => {
  //   if (userPermissions.map(({ id_permission }) => id_permission).includes(3)) {
  //     consultaArqueoBilletes(1, fecha_ini, fecha_fin).then((res) => {
  //       if (!res.status) {
  //         notifyError(res.msg);
  //         // setDisabledBtns(true);
  //       } else {
  //         // setResp_report(res.data);
  //         setId_arqueo(res?.obj?.data?.[0].id_arqueo);
  //         // setDisabledBtns(false);
  //       }
  //     });
  //   }
  // }, [userPermissions]);

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);

  const closeModal2 = useCallback(async () => {
    setShowModal2(false);
  }, []);

  return (
    <>
      <Form formDir="col" onSubmit={onSubmit}>
        {userPermissions
          .map(({ id_permission }) => id_permission)
          .includes(500) ? (
          <>
            <Input
              id="dateInit"
              label="Fecha inicial"
              type="date"
              value={date_init}
              onInput={(e) => {
                setDate_init(e.target.value);
                if (date_end !== "" && sorteo !== "") {
                  setPage(1);
                  setDatosArqueo([]);
                  setMaxPages(1);
                  consultaArqueoBilletes(
                    1,
                    e.target.value,
                    date_end,
                    sorteo,
                    idComercio
                  ).then((res) => {
                    if (!res.status) {
                      notifyError(res.msg);
                      // setDisabledBtns(true);
                    }
                    else if (!res?.obj?.data) {
                      notifyError("No hay arqueos registrados")
                    }
                    else {
                      // setResp_report(res.data);
                      setDatosArqueo(res?.obj?.data);
                      setMaxPages(Math.ceil(res?.obj?.maxpage / 10));
                      // setDisabledBtns(false);
                    }
                  });
                }
              }}
            />
            <Input
              id="dateEnd"
              label="Fecha final"
              type="date"
              value={date_end}
              onInput={(e) => {
                setDate_end(e.target.value);
                if (date_init !== "" && sorteo !== "") {
                  setPage(1);
                  setDatosArqueo([]);
                  setMaxPages(1);
                  consultaArqueoBilletes(
                    1,
                    date_init,
                    e.target.value,
                    sorteo,
                    idComercio
                  ).then((res) => {
                    if (!res.status) {
                      notifyError(res.msg);
                      // setDisabledBtns(true);
                    }
                    else if (!res?.obj?.length) {
                      notifyError("No hay arqueos registrados")
                    }
                    else {
                      // setResp_report(res.data);
                      setDatosArqueo(res?.obj?.data);
                      setMaxPages(Math.ceil(res?.obj?.maxpage / 10));
                      // setDisabledBtns(false);
                    }
                  });
                }
              }}
            />
            <Select
              // disabled={serie !== "" || numero !== ""}
              id="selectSorteo"
              label="Sorteo"
              options={opcionesdisponibles}
              value={sorteo}
              onChange={(e) => {
                if (e.target.value !== "") {
                  setSorteo(e.target.value);
                  setShowArqueo(false);
                  setFracDisp(null);
                  setDatosArqueo([]);
                  setMaxPages(1);
                  consultaArqueoBilletes(
                    1,
                    date_init,
                    date_end,
                    e.target.value,
                    idComercio
                  ).then((res) => {
                    if (!res.status) {
                      notifyError(res.msg);
                      // setDisabledBtns(true);
                    }
                    else if (!res?.obj?.length) {
                      notifyError("No hay arqueos registrados")
                    }
                    else {
                      // setResp_report(res.data);
                      setDatosArqueo(res?.obj?.data);
                      setMaxPages(Math.ceil(res?.obj?.maxpage / 10));
                      // setDisabledBtns(false);
                    }
                  });
                }
              }}
            />
            {datosArqueo.length ? (
              <>
                <ButtonBar>
                  <Button
                    type="button"
                    disabled={page < 2}
                    onClick={() => {
                      if (page > 1) {
                        setPage(page - 1);
                        consultaArqueoBilletes(
                          page - 1,
                          date_init,
                          date_end,
                          sorteo,
                          idComercio
                        ).then((res) => {
                          if (!res.status) {
                            notifyError(res.msg);
                            // setDisabledBtns(true);
                          } else {
                            // setResp_report(res.data);
                            setDatosArqueo(res?.obj?.data);
                            setMaxPages(Math.ceil(res?.obj?.maxpage / 10));
                            // setDisabledBtns(false);
                          }
                        });
                      }
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    disabled={page >= maxPages || datosArqueo.length === 0}
                    onClick={() => {
                      if (page < maxPages) {
                        setPage(page + 1);
                        consultaArqueoBilletes(
                          page + 1,
                          date_init,
                          date_end,
                          sorteo,
                          idComercio
                        ).then((res) => {
                          if (!res.status) {
                            notifyError(res.msg);
                            // setDisabledBtns(true);
                          } else {
                            // setResp_report(res.data);
                            setDatosArqueo(res?.obj?.data);
                            setMaxPages(Math.ceil(res?.obj?.maxpage / 10));
                            // setDisabledBtns(false);
                          }
                        });
                      }
                    }}
                  >
                    Siguiente
                  </Button>
                </ButtonBar>
                <TableEnterprise
                  headers={[
                    "Sorteo",
                    "Comercio",
                    "Fecha arqueo",
                    "Fracciones Base de datos",
                    "Fracciones contadas",
                  ]}
                  data={datosArqueo.map(
                    ({
                      sorteo,
                      id_comercio,
                      fecha,
                      frac_disponibles,
                      frac_arqueo,
                    }) => {
                      const tempDate = new Date(fecha);
                      tempDate.setHours(tempDate.getHours() + 5);
                      fecha = Intl.DateTimeFormat("es-CO", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      }).format(tempDate);
                      return {
                        sorteo,
                        id_comercio,
                        fecha,
                        frac_disponibles,
                        frac_arqueo,
                      };
                    }
                  )}
                >

                </TableEnterprise>
              </>
            ) : (
              ""
            )}
          </>
        ) : (
          <>
            <Select
              // disabled={serie !== "" || numero !== ""}
              id="selectSorteo"
              label="Sorteo"
              options={opcionesdisponibles}
              value={sorteo}
              onChange={(e) => {
                setSorteo(e.target.value);
                setShowArqueo(false);
                setFracDisp(null);
                if (e.target.value !== "") {
                  reportVentas(fecha_ini, fecha_fin, e.target.value).then(
                    (res) => {
                      setShowInput(false)
                      if ("msg" in res) {
                        notifyError("El comercio no ha realizado ventas, no es necesario realizar arqueo");
                        setShowInput(false)
                        // setDisabledBtns(true);
                      } else {
                        // setResp_report(res.data);
                        setTotal(res.total);
                        setShowInput(true)
                        // setDisabledBtns(false);
                      }
                    }
                  );

                  consultaArqueoBilletes(
                    1,
                    fecha_ini,
                    fecha_fin,
                    e.target.value,
                    idComercio
                  ).then((res) => {
                    if (!res.status) {
                      notifyError(res.msg);
                    } else {
                      // setResp_report(res.data);
                      setId_arqueo(res?.obj?.data?.[0].id_arqueo);
                    }
                  });
                }
              }}
            />
            {sorteo !== "" && showInput ? (
              <>
                <Input
                  id="frac_disponibles"
                  label="Fracciones disponibles"
                  type="text"
                  required="true"
                  value={fracDisp}
                  onInput={(e) => {
                    if (!isNaN(e.target.value)) {
                      const num = e.target.value;
                      setFracDisp(num);
                    }
                  }}
                />

                {showArqueo ? (
                  <>
                    <Input
                      id="frac_venta"
                      label="Fracciones vendidas"
                      type="text"
                      required="true"
                      value={total === null ? 0 : total?.total_frac}
                    />
                    <Input
                      id="val_total"
                      label="Total ventas"
                      type="text"
                      required="true"
                      value={formatMoney.format(
                        total === null ? 0 : total?.val_total
                      )}
                    />
                  </>
                ) : (
                  ""
                )}
                <Button type="submit">Arqueo</Button>
              </>
            ) : (
              ""
            )}
          </>
        )}
      </Form>
      <div>
        <Modal show={showModal} handleClose={closeModal}>
          <DescargaForm closeModal={closeModal} selected={selected} />
        </Modal>
        <Modal show={showModal2} handleClose={closeModal2}>
          <ReportVentasForm closeModal={closeModal2} Oficina="" />
        </Modal>
      </div>
    </>
  );
};

export default ArqueoBilletes;
