import { useCallback, useEffect, useState } from "react";

import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import Table from "../../../components/Base/Table/Table";
import SellResp from "../components/SellResp/SellResp";
import SendForm from "../components/SendForm/SendForm";
import { useLoteria } from "../utils/LoteriaHooks";
import fetchData from "../../../utils/fetchData";
import SubPage from "../../../components/Base/SubPage/SubPage";

const urlLoto = `${process.env.REACT_APP_LOTO_SORTEOS}/contiploteria`;

const Loteria = ({ route }) => {
  const { label } = route;
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
  } = useLoteria();

  const [sorteoOrdi, setSorteoOrdi] = useState(null);
  const [sorteoExtra, setSorteoExtra] = useState(null);

  const [sorteoOrdifisico, setSorteofisico] = useState(null);
  const [sorteoExtrafisico, setSorteofisicoextraordinario] = useState(null);

  useEffect(() => {
    fetchData(urlLoto, "GET", {}, {})
      .then((res) => {
        ////sorteo virtual
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
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [selecFrac, setSelecFrac] = useState([]);
  const [tipoPago, setTipoPago] = useState(1);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([
    { value: "", label: "" },
  ]);

  useEffect(() => {
    setSellResponse(null);
    setNumero("");
    setSerie("");
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setLoterias("");
    setPage(1);
    setMaxPages(1);

    console.log(sorteoExtrafisico);
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
    setCustomer,
    setLoterias,
    setNumero,
    setSellResponse,
    setSerie,
    sorteoExtra,
    sorteoExtrafisico,
    sorteoOrdi,
    sorteoOrdifisico,
  ]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSellResponse(null);
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setSelected(null);
    setSelecFrac([]);

    sorteo.split("-")[1] === "true"
      ? searchLoteriafisica(sorteo, numero, serie, page)
      : searchLoteria(sorteo, numero, serie, page);
  }, [
    numero,
    page,
    searchLoteria,
    searchLoteriafisica,
    serie,
    setCustomer,
    setSelected,
    setSellResponse,
    sorteo,
  ]);
  console.log(selected);
  console.log(sellResponse);
  return (
    <SubPage label={label}>
      <Form grid>
        <Select
          disabled={serie !== "" || numero !== ""}
          id="selectSorteo"
          label="Tipo de sorteo"
          options={opcionesdisponibles}
          value={sorteo}
          onChange={(e) => setSorteo(e.target.value)}
        />
        <Input
          id="numTicket"
          label="Numero de billete"
          type="search"
          minLength="1"
          maxLength="4"
          autoComplete="off"
          value={numero}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              console.log("aver");
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
                  })
                : searchLoteria(sorteo, num, serie, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                  });
            },
            timeOut: 500,
          }}
        />
        <Input
          id="numSerie"
          label="Numero de serie"
          type="search"
          minLength="1"
          maxLength="3"
          autoComplete="off"
          value={serie}
          onInput={(e) => {
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
                : searchLoteria(sorteo, num, serie, 1).then((max) => {
                    if (max !== undefined) {
                      setMaxPages(Math.ceil(max / 10));
                    }
                  });
            },
            timeOut: 500,
          }}
        />
        <ButtonBar>
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
        </ButtonBar>
      </Form>
      {Array.isArray(loterias) && loterias.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={[
              "Numero",
              "Serie",
              "Fracciones disponibles",
              // "Valor por fraccion",
            ]}
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
              console.log(loterias[index].Fracciones);
              setSelected(loterias[index]);
              setShowModal(true);
            }}
          />
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
                ? sellLoteriafisica(sorteo, selecFrac, tipoPago)
                : sellLoteria(sorteo);
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
    </SubPage>
  );
};

export default Loteria;
