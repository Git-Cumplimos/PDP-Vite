import { useCallback, useEffect, useState, useMemo } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import Table from "../../../components/Base/Table";
import SellResp from "../components/SellResp/SellResp";
import SendForm from "../components/SendForm/SendForm";
import { useLoteria } from "../utils/LoteriaHooks";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import SubPage from "../../../components/Base/SubPage/SubPage";
import InputX from "../../../components/Base/InputX/InputX";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useLocation } from "react-router-dom";
import { notifyError } from "../../../utils/notify";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";

const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;

const Loteria = ({ route }) => {
  const { roleInfo } = useAuth
  const nitsLoterias = {
    "loteria-de-bogota": "899.999.270-1",
    "loteria-del-tolima": "809.008.775-0",
    "loteria-de-cundinamarca": "86.003.723-4",
  };
  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  const { tiposOperaciones } = useLoteria();

  const operacion = useMemo(() => {
    return tiposOperaciones;
  }, [tiposOperaciones]);

  const { label } = route;
  const { pathname } = useLocation();
  const {
    infoLoto: {
      numero,
      setNumero,
      serie,
      setSerie,
      loterias,
      setLoterias,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
    },
    searchLoteria,
    searchLoteriafisica,
    sellLoteria,
    sellLoteriafisica,
    codigos_lot,
    setCodigos_lot,
    loadConsulta,
    setLoadConsulta,

  } = useLoteria();
  const { idloteria } = useLoteria();
  const [sorteoOrdi, setSorteoOrdi] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);
  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);
  const [datosEscaneados, setDatosEscaneados] = useState("");
  const [nit_loteria, setNit_loteria] = useState(null);
  const [nom_loteria, setNom_loteria] = useState(null);
  const navigate = useNavigate();
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const validarEntradaScanner = useCallback(
    (validarNum) => {
      if (validarNum[0] === "]") {
        return validarNum.replace("]C1", "");
      } else {
        return validarNum;
      }
    },
    [datosEscaneados]
  );

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
    const nit = nitsLoterias?.[pathname.split("/")?.[2]];
    if (nit !== "" && nit !== undefined) {
      setNit_loteria(nit);
      idloteria(nit).then((res) => {
        if (res?.status) {
          setNom_loteria(res['obj'][0]['nombre'])
        } else {
          navigate(-1);
        }
      });
    }
  }, [pathname]);

  useEffect(() => {
    const query = {
      num_loteria: sorteosLOT,
    };
    fetchData(urlLoto, "GET", query, {})
      .then((res) => {
        setSorteoOrdi(null);
        setSorteoExtra(null);
        setSorteofisico(null);
        setSorteofisicoextraordinario(null);
        const sortOrd = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && !fisico;
        });
        const sortExt = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && !fisico;
        });
        if (sortOrd.length > 0) {
          setSorteoOrdi(sortOrd[0]);
        } else {
          /*  notifyError("No se encontraron sorteos ordinarios"); */
        }
        if (sortExt.length > 0) {
          setSorteoExtra(sortExt[0]);
        } else {
          /* notifyError("No se encontraron sorteos extraordinarios"); */
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////
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

  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [selecFrac, setSelecFrac] = useState([]);
  const [tipoPago, setTipoPago] = useState(null);
  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    setSellResponse(null);
    setDatosEscaneados("")
    setNumero("");
    setSerie("");
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setLoterias("");
    setPage(1);
    setMaxPages(1);

    const copy = [{ value: "", label: "" }];
    if (sorteoOrdi !== null) {
      copy.push({
        value: `${sorteoOrdi.num_sorteo}-${sorteoOrdi.fisico}-${sorteoOrdi.num_loteria}`,
        label: `Sorteo Ordinario Virtual- ${sorteoOrdi.num_sorteo}`,
      });
    }
    if (sorteoExtra !== null) {
      copy.push({
        value: `${sorteoExtra.num_sorteo}-${sorteoExtra.fisico}-${sorteoExtra.num_loteria}`,
        label: `Sorteo Extraordinario Virtual- ${sorteoExtra.num_sorteo}`,
      });
    }
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.fisico}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo Ordinario  Físico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.fisico}-${sorteoExtrafisico.num_loteria}`,
        label: `Sorteo Extraordinario Físico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);
  }, [
    setCustomer,
    setLoterias,
    setNumero,
    setSellResponse,
    setSerie,
    sorteoExtra,
    sorteoExtrafisico,
    sorteoOrdi,
    sorteoOrdifisico,
    sorteosLOT,
    codigos_lot,
  ]);

  const closeModal = useCallback(() => {
    navigate(-1);
    setShowModal(false);
    setSellResponse(null);
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setSelected(null);
    setSelecFrac([]);
    setTipoPago(null);
    sorteo.split("-")[1] === "true"
      ? searchLoteriafisica(sorteo, numero, serie, page)
      : searchLoteria(sorteo, numero, serie, page);
    }, 
    [numero,page,searchLoteria,searchLoteriafisica,serie,setCustomer,setSelected,setSellResponse,sorteo]
  );

  const ticket = useMemo(() => {
    return {
      title: "Recibo de pago",
      timeInfo: {
        "Fecha de pago": Intl.DateTimeFormat("es-CO", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
        Hora: Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      },
      commerceInfo: [
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", sellResponse?.["id_trx"]],
        ["Id Aut ", sellResponse?.id_Transaccion],
        ["Comercio", roleInfo?.["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],
      commerceName: sellResponse?.nom_loteria,
      trxInfo: [
        ["Sorteo", sellResponse?.sorteo],
        ["Billete", sellResponse?.num_billete],
        ["Serie", sellResponse?.serie],
        ["Fracciones", sellResponse?.fracciones],
        ["Tipo de Billete", sellResponse?.fisico === true ? "Fisico" : "Virtual"],
        ["", ""],
        ["Valor", formatMoney.format(sellResponse?.valor_pago)],
        ["", ""],
        ["Forma de Pago", parseInt(sellResponse?.tipoPago) ===
          parseInt(operacion?.Venta_Fisica) || sellResponse?.fisico === false
          ? "Efectivo"
          : "Bono"],
        ["", ""],
      ],
      disclamer:
        "Para quejas o reclamos comuniquese, al 3503485532(Servicio al cliente) o al 3102976460(chatbot)",
    };
  }, [sellResponse]
  );

  return (
    <>
      <h1 className="text-3xl mt-6">Venta {nom_loteria} </h1>
      <SimpleLoading show={loadConsulta}></SimpleLoading>
      <Select
        className={"place-self-strech"}
        disabled={serie !== "" || numero !== ""}
        id="selectSorteo"
        label="Tipo de sorteo"
        options={opcionesdisponibles}
        value={sorteo}
        onChange={(e) => setSorteo(e.target.value)}
      />
      {sorteo !== "" ?
        <Form grid>
          {sorteo.split("-")[1] === "true" ?
            <Input
              label="Escanee el código de barras"
              type="search"
              value={datosEscaneados}
              onInput={(e) => {
                const num = e.target.value || "";
                setDatosEscaneados(validarEntradaScanner(num));
                if (num?.length === 20) {
                  searchLoteriafisica(sorteo, String(num.substr(-9, 4)), String(num.substr(-5, 3)), 1)
                    .then((max) => {
                      if (max !== undefined) {
                        setMaxPages(Math.ceil(max / 10));
                      }
                    });
                  setNumero(String(num.substr(-9, 4)));
                  setSerie(String(num.substr(-5, 3)));
                } else {
                  setNumero("");
                  setSerie("");
                  setIsInputDisabled(true);
                }
              }}
              disabled={isInputDisabled}
            ></Input>
            : ""}
          <Input
            id="numTicket"
            label="Número de billete"
            type="search"
            minLength="1"
            maxLength="4"
            autoComplete="off"
            value={numero}
            onInput={(e) => {
              setDatosEscaneados("");
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setNumero(num);
              }
            }}
            onLazyInput={{
              callback: (e) => {
                const num = !isNaN(e.target.value) ? e.target.value : "";
                setPage(1);

                sorteo.split("-")[1] === "true"
                  ? searchLoteriafisica(sorteo, num, serie, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                    if (max === 0) {
                      notifyError("No se encontraron billetes asociados a la búsqueda")

                    }
                  })
                  : searchLoteria(sorteo, num, serie, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                    if (max === 0) {
                      notifyError("No hay fracciones para vender")
                    }
                  });
              },
              timeOut: 500,
            }}
          />
          <Input
            id="numSerie"
            label="Número de serie"
            type="search"
            minLength="1"
            maxLength="3"
            autoComplete="off"
            value={serie}
            onInput={(e) => {
              setDatosEscaneados("");
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setSerie(num);
              }
            }}
            onLazyInput={{
              callback: (e) => {
                const num = !isNaN(e.target.value) ? e.target.value : "";
                setPage(1);

                sorteo.split("-")[1] === "true"
                  ? searchLoteriafisica(sorteo, numero, num, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                  })
                  : searchLoteria(sorteo, numero, num, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                    if (max === 0) {
                      notifyError("No se encontraron billetes para esta búsqueda")
                    }
                  });
              },
              timeOut: 500,
            }}
          />
          {maxPages > 1 ?
            <ButtonBar className={"lg:col-span-2"}>
              <Button
                type="button"
                disabled={page < 2}
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1);

                    sorteo.split("-")[1] === "true"
                      ? searchLoteriafisica(sorteo, numero, serie, page - 1)
                      : searchLoteria(sorteo, numero, serie, page - 1);
                  }
                }}
              >
                Anterior
              </Button>
              <Button
                type="button"
                disabled={page >= maxPages || loterias.length === 0}
                onClick={() => {
                  if (page < maxPages) {
                    setPage(page + 1);

                    sorteo.split("-")[1] === "true"
                      ? searchLoteriafisica(sorteo, numero, serie, page + 1)
                      : searchLoteria(sorteo, numero, serie, page + 1);
                  }
                }}
              >
                Siguiente
              </Button>
            </ButtonBar> : ""}
        </Form>
        : ""}

      {Array.isArray(loterias) && loterias.length > 0 ? (
        <>
          <TableEnterprise
            headers={[
              "Número",
              "Serie",
              "Fracciones disponibles",
            ]}
            maxPage={maxPages}
            data={loterias.map(
              ({ Fracciones_disponibles, Num_billete, serie: Serie_lot }) => {
                return {
                  Num_billete,
                  Serie_lot,
                  Fracciones_disponibles,
                };
              }
            )}
            onSelectRow={(e, index) => {
              setSelected(loterias[index]);
              setShowModal(true);
            }}
          >

          </TableEnterprise>
        </>
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={() => closeModal()}>
        {sellResponse === null ? (
          <SendForm
            tipoPago={tipoPago}
            setTipoPago={setTipoPago}
            sorteo={sorteo}
            selecFrac={selecFrac}
            setSelecFrac={setSelecFrac}
            selected={selected}
            setSelected={setSelected}
            customer={customer}
            setCustomer={setCustomer}
            closeModal={closeModal}
            handleSubmit={(event) => {
              sorteo.split("-")[1] === "true"
                ? sellLoteriafisica(sorteo, selecFrac, tipoPago, ticket)
                : sellLoteria(sorteo, ticket);
            }}
          />
        ) : (
          <SellResp
            sellResponse={sellResponse}
            setSellResponse={setSellResponse}
            closeModal={closeModal}
            setCustomer={setCustomer}
          />
        )}
      </Modal>
    </>
  );
};

export default Loteria;
