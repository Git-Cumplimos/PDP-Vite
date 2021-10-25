

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

const Loteria = ({ sorteo: sorteoOrdi, sorteoExtra }) => {
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
    sellLoteria,
  } = useLoteria();

  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  

 
  useEffect(() => {
    setSellResponse(null);
    setNumero("");
    setSerie("");
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setLoterias("");
    setPage(1);
    setMaxPages(1);
    
  }, [setSellResponse, setNumero, setSerie, setCustomer, setLoterias]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    searchLoteria(sorteo, numero, serie, page);
  }, [sorteo, numero, serie, searchLoteria, page]);

  return (
    <>
      <Form grid>
        <Select
          disabled={serie!=="" || numero!==""}
          id="selectSorteo"
          label="Tipo de sorteo"
          options={[
            { value: "", label: "" },
            { value: sorteoOrdi, label: `Sorteo ordinario - ${sorteoOrdi}` },
            {
              value: sorteoExtra,
              label: `Sorteo extraordinario - ${sorteoExtra}`,
            },
          ]}
          value={sorteo}
          onChange={(e) => setSorteo(e.target.value)}
        />
        <Input
          id="numTicket"
          label="Numero de billete"
          type="search"
          minLength="1"
          maxLength="4"
          autoComplete="false"
          value={numero}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setNumero(num);
            
            
          }}
          onLazyInput={{
            callback: (e) => {
              const num = parseInt(e.target.value) || "";
              setPage(1);
              searchLoteria(sorteo, num, serie, 1).then((max) => {
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
          autoComplete="false"
          value={serie}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setSerie(num);
            
          }}
          onLazyInput={{
            callback: (e) => {
              const num = parseInt(e.target.value) || "";
              setPage(1);
              searchLoteria(sorteo, numero, num, 1).then((max) => {
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
                searchLoteria(sorteo, numero, serie, page - 1);
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
                searchLoteria(sorteo, numero, serie, page + 1);
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
              ({
                Fracciones_disponibles,
                Num_billete,
                // Valor_fraccion,
                serie: Serie_lot,
              }) => {
                return {
                  Num_billete,
                  Serie_lot,
                  Fracciones_disponibles,
                  // Valor_fraccion,
                };
              }
            )}
            onSelectRow={(e, index) => {
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
            selected={selected}
            customer={customer}
            setCustomer={setCustomer}
            closeModal={closeModal}
            handleSubmit={(event) => {
              event.preventDefault();
              sellLoteria(sorteo);
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
