import { useCallback, useEffect, useState, useMemo } from "react";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import SellResp from "../components/SellResp/SellResp";
import SendForm from "../components/SendForm/SendForm";
import { useLoteria } from "../utils/LoteriaHooks";
import { LineasLot_disclamer } from "../utils/enum";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import BarcodeReader from "../../../components/Base/BarcodeReader/BarcodeReader";
import Button from "../../../components/Base/Button/Button";
import { useLocation } from "react-router-dom";
import { notifyError } from "../../../utils/notify";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { useAuth } from "../../../hooks/AuthHooks";

const urlLoto = `${process.env.REACT_APP_URL_LOTERIAS}/contiploteria`;

const Loteria = ({ route }) => {
  const { roleInfo } = useAuth();
  const { searchLoteriafisica, searchLoteria } = useLoteria();
  const { pathname } = useLocation();
  const nitsLoterias = {
    "loteria-de-bogota": "899.999.270-1",
    "loteria-del-tolima": "809.008.775-0",
    "loteria-de-cundinamarca": "86.003.723-4",
  };
  const [maxPages, setMaxPages] = useState(0);
  const [loterias, setLoterias] = useState([]);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const [fecha_trx, setFecha_trx] = useState(new Date());

  const {
    infoLoto: {
      numero,
      setNumero,
      serie,
      setSerie,
      selected,
      setSelected,
      customer,
      setCustomer,
      sellResponse,
      setSellResponse,
    },
    sellLoteria,
    sellLoteriafisica,
    codigos_lot,
    loadConsulta,
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
  const [flagEscaner, setFlagEscaner] = useState(false);

  const validarEntradaScanner = useCallback(
    (validarNum) => {
      var cod = "";
      if (codigos_lot?.length === 2) {
        cod = [`0${codigos_lot?.[0]?.cod_loteria}`,`${codigos_lot?.[1]?.cod_loteria}`];
      } else {
        cod = [`0${codigos_lot?.[0]?.cod_loteria}`];
      }
      if (validarNum?.length===23){
        if (validarNum.substring(0, 3) === "]C1") {
          if (cod.includes(validarNum.substring(4, 7))){
            setNumero(String(validarNum.substr(-9, 4)));
            setSerie(String(validarNum.substr(-5, 3)));
            setFlagEscaner(true)
            setDatosEscaneados(validarNum.replace("]C1", ""));
          } else{
            setFlagEscaner(false)
            notifyError("El código de barras escaneado no corresponde a la lotería seleccionada")
          }
        } else {
          setFlagEscaner(false)
          notifyError("El código de barras escaneado es incorrecto")
        }
      } else {
        setFlagEscaner(false)
        notifyError("El código de barras escaneado es incorrecto")
      }
    },
    [setNumero,setSerie,codigos_lot]
  );

  const limpiarCampos = () =>{
    setNumero("");
    setSerie("");
    setFlagEscaner(false)
  }

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
          setNom_loteria(res["obj"][0]["nombre"]);
        } else {
          navigate(-1);
        }
      });
    }
  }, [pathname, idloteria, navigate]);

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
        }
        if (sortExt.length > 0) {
          setSorteoExtra(sortExt[0]);
        }
        ///sorteo fisico
        const sortOrdfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 1 && fisico;
        });
        const sortExtfisico = res.filter(({ tip_sorteo, fisico }) => {
          return tip_sorteo === 2 && fisico;
        });
        if (sortOrdfisico.length > 0) {
          setSorteofisico(sortOrdfisico[0]);
        }
        if (sortExtfisico.length > 0) {
          setSorteofisicoextraordinario(sortExtfisico[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [codigos_lot, sorteosLOT, loterias]);

  const [showModal, setShowModal] = useState(false);
  const [sorteo, setSorteo] = useState("");
  const [selecFrac, setSelecFrac] = useState([]);
  const [tipoPago, setTipoPago] = useState(null);
  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    setSellResponse(null);
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    const copy = [{ value: "", label: "" }];
    if (sorteoOrdi !== null) {
      copy.push({
        value: `${sorteoOrdi.num_sorteo}-${sorteoOrdi.fisico}-${sorteoOrdi.num_loteria}`,
        label: `Sorteo Ordinario Virtual - ${sorteoOrdi.num_sorteo}`,
      });
    }
    if (sorteoExtra !== null) {
      copy.push({
        value: `${sorteoExtra.num_sorteo}-${sorteoExtra.fisico}-${sorteoExtra.num_loteria}`,
        label: `Sorteo Extraordinario Virtual - ${sorteoExtra.num_sorteo}`,
      });
    }
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.fisico}-${sorteoOrdifisico.num_loteria}`,
        label: `Sorteo Ordinario Físico - ${sorteoOrdifisico.num_sorteo}`,
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
    loterias,
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
  }, [setCustomer, setSelected, setSellResponse, navigate]);

  useEffect(() => {
    if (sellResponse !== null) {
      const fecha_venta = new Date();
      setFecha_trx(fecha_venta);
    }
  }, [sellResponse]);

  const ticket = useMemo(() => {
    return {
      title: "VENTA LOTERÍA",
      timeInfo: {
        "Fecha de pago": "",
        Hora: "",
      },
      commerceInfo: [
        ["Razón social", "Soluciones en Red S.A.S."],
        ["Nit", "830.084.645-1"],
        ["Id Comercio", roleInfo?.id_comercio],
        ["No. terminal", roleInfo?.id_dispositivo],
        ["Id Trx ", ""],
        ["Id Aut ", ""],
        ["Comercio", roleInfo?.["nombre comercio"]],
        ["", ""],
        ["Dirección", roleInfo?.direccion],
        ["", ""],
      ],
      commerceName:
        sellResponse?.obj?.cod_loteria !== "064"
          ? sellResponse?.obj?.nom_loteria
          : sellResponse?.obj?.nom_loteria + " Extraordinario",
      descriPM: "***Descripción del premios mayor asociado al sorteo***",
      trxInfo: [
        ["Sorteo", sorteo],
        ["Fecha del sorteo", ""],
        ["", ""],
        ["Número", numero],
        ["Serie", serie],
        ["Fracción", ""],
        ["Tipo de billete", ""],
        ["", ""],
        ["", ""],
        ["Valor", ""],
        ["", ""],
        ["", ""],
        ["Forma de pago", ""],
        ["", ""],
        ["", ""],
      ],
      disclamer: LineasLot_disclamer[sellResponse?.obj?.nom_loteria],
    };
  }, [roleInfo, sellResponse, sorteo, serie, numero]);

  useEffect(() => {
    if (sorteo.split("-")[0] !== "") {
      fetchTablaBilletes();
    }
  }, [page, limit, sorteo, numero, serie]);

  const fetchTablaBilletes = () => {
    if (sorteo.split("-")[1] === "true") {
      searchLoteriafisica({
        sorteo: sorteo.split("-")[0],
        lot: sorteo.split("-")[2],
        num: numero,
        ser: serie,
        page,
        limit,
      })
        .then((res) => {
          if (res !== undefined) {
            if (!("msg" in res)) {
              setLoterias(res.Resultado ?? []);
              setMaxPages(res.Num_Datos ?? 1);
            } else {
              notifyError(res.msg, 5000, { toastId: "notify-lot" });
              setLoterias([]);
            }
          }
        })
        .catch((err) => console.error(err));
    } else {
      searchLoteria({
        sorteo: sorteo.split("-")[0],
        lot: sorteo.split("-")[2],
        num: numero,
        ser: serie,
        page,
        limit,
      })
        .then((res) => {
          if (res !== undefined) {
            if (!("msg" in res)) {
              setLoterias(res.Resultado ?? []);
              setMaxPages(res.Num_Datos ?? 1);
            } else {
              notifyError(res.msg, 5000, { toastId: "notify-lot2" });
              setLoterias([]);
            }
          }
        })
        .catch((err) => console.error(err));
    }
  };
  // *****************************************BANDERA******************
  return (
    <>
      <h1 className="text-3xl mt-6">Venta {nom_loteria} </h1>
      <SimpleLoading show={loadConsulta}></SimpleLoading>
      <Select
        className={"place-self-strech"}
        // disabled={serie !== "" || numero !== ""}
        id="selectSorteo"
        label="Tipo de sorteo"
        options={opcionesdisponibles}
        value={sorteo}
        onChange={(e) => {
          setSorteo(e.target.value);
          setNumero("");
          setSerie("");
        }}
      />
      {sorteo !== "" ? (
        <TableEnterprise
          title={
            sorteo.split("-")[1] === "true"
              ? "Billetería física"
              : "Billetería virtual"
          }
          maxPage={maxPages}
          headers={["Número", "Serie", "Fracciones disponibles"]}
          onSetPageData={setPageData}
          data={loterias.map(
            ({ Num_billete, serie: Serie_lot, Fracciones_disponibles }) => {
              return { Num_billete, serie: Serie_lot, Fracciones_disponibles };
            }
          )}
          onSelectRow={(e, index) => {
            setSelected(loterias[index]);
            setShowModal(true);
          }}
        >
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
            disabled={flagEscaner}
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
            disabled={flagEscaner}
          />
          {sorteo.split("-")[1] === "true" ? (
            !flagEscaner ? (
              <>
                <BarcodeReader onSearchCodigo={validarEntradaScanner}/>
                <Button type="reset">Escanear de nuevo</Button>
              </>
             ) :
             <>
              <Input
              label="Código de barras"
              type="text"
              autoComplete="off"
              value={datosEscaneados}
              disabled
              />
              <Button onClick={()=>limpiarCampos()}>Limpiar campos</Button>
             </>                 
          ) : (
            ""
          )}
        </TableEnterprise>
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
                : sellLoteria(sorteo, selecFrac, ticket, tipoPago);
            }}
          />
        ) : (
          <SellResp
            codigos_lot={codigos_lot}
            rta_billeteria={loterias}
            sellResponse={sellResponse}
            setSellResponse={setSellResponse}
            closeModal={closeModal}
            setCustomer={setCustomer}
            selecFrac={selecFrac}
            setSelecFrac={setSelecFrac}
            fecha_trx={fecha_trx}
          />
        )}
      </Modal>
    </>
  );
};

export default Loteria;
