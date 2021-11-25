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
import { useAuth } from "../../../utils/AuthHooks";

const Loteria = ({
  sorteo:
  sorteoOrdi,
  sorteoExtra,  
  sorteoOrdifisico,
  sorteoExtrafisico,
}) => {
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

  

  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [sorteo, setSorteo] = useState("");
  const [selecFrac, setSelecFrac] = useState([]);

  const [opcionesdisponibles, SetOpcionesDisponibles] = useState([{value:"",label:""}]);

  useEffect(() => {

    setSellResponse(null);
    setNumero("");
    setSerie("");
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setLoterias("");
    setPage(1);
    setMaxPages(1);


    
 
    const copy = [...opcionesdisponibles];
    if (sorteoOrdi !== null) {
      copy.push({
        value: `${sorteoOrdi.num_sorteo}-${sorteoOrdi.fisico}`,
        label: `Sorteo ordinario - ${sorteoOrdi.num_sorteo}`,
      });

      
    }
    if (sorteoExtra !== null) {
      copy.push({
        value: `${sorteoExtra.num_sorteo}-${sorteoExtra.fisico}`,
        label: `Sorteo extraordinario - ${sorteoExtra.num_sorteo}`,
      });
    }
    if (sorteoOrdifisico !== null) {
      copy.push({
        value: `${sorteoOrdifisico.num_sorteo}-${sorteoOrdifisico.fisico}`,
        label: `Sorteo ordinario  fisico- ${sorteoOrdifisico.num_sorteo}`,
      });
    }

    if (sorteoExtrafisico !== null) {
      
      copy.push({
        value: `${sorteoExtrafisico.num_sorteo}-${sorteoExtrafisico.fisico}`,
        label: `Sorteo extraordinario fisico - ${sorteoExtrafisico.num_sorteo}`,
      });
    }
    SetOpcionesDisponibles([...copy]);



    
  }, [setSellResponse, setNumero, setSerie, setCustomer, setLoterias]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSellResponse(null)
    setCustomer({ fracciones: "", phone: "", doc_id: "" });
    setSelected(null)
    setSelecFrac([])
    {sorteo.split('-')[1]==='true'? 
    searchLoteriafisica(sorteo, numero, serie, page)         
    :
    searchLoteria(sorteo, numero, serie, page)
    }
    

  }, [sorteo, numero, serie, searchLoteria,searchLoteriafisica, page]);

  return (
    <>
      <Form grid>
        {

        }
        <Select
          disabled={serie!=="" || numero!==""}
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
            if(!isNaN(e.target.value)){
              const num = (e.target.value);
              setNumero(num);
              }
          }}
          onLazyInput={{
            callback: (e) => {
              const num = parseInt(e.target.value) || "";
              setPage(1);
              {sorteo.split('-')[1]==='true'? 
              searchLoteriafisica(sorteo, num, serie, 1).then((max) => {
                if (max !== undefined) {
                  setMaxPages(Math.ceil(max / 10));
                }
              })
              :
              searchLoteria(sorteo, num, serie, 1).then((max) => {
                if (max !== undefined) {
                  setMaxPages(Math.ceil(max / 10));
                }
              })}
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
            if(!isNaN(e.target.value)){
              const num = (e.target.value);
              setSerie(num);
              }
          }}
          onLazyInput={{
            callback: (e) => {
              const num = parseInt(e.target.value) || "";
              setPage(1);
              {sorteo.split('-')[1]==='true'? 
              searchLoteriafisica(sorteo, num, serie, 1).then((max) => {
                if (max !== undefined) {
                  setMaxPages(Math.ceil(max / 10));
                }
              })
              :
              searchLoteria(sorteo, num, serie, 1).then((max) => {
                if (max !== undefined) {
                  setMaxPages(Math.ceil(max / 10));
                }
              })}
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
                {sorteo.split('-')[1]==='true'?
                searchLoteriafisica(sorteo, numero, serie, page - 1):
                searchLoteria(sorteo, numero, serie, page - 1)
                }
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
                {sorteo.split('-')[1]==='true'?
                searchLoteriafisica(sorteo, numero, serie, page + 1):
                searchLoteria(sorteo, numero, serie, page + 1)
                }
              
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
                serie: Serie_lot,
              }) => {
                return {
                  Num_billete,
                  Serie_lot,
                  Fracciones_disponibles,
                 
                };
              }
            )}
            onSelectRow={(e, index) => {
              console.log(loterias[index].Fracciones)
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
            sorteo={sorteo}
            selecFrac={selecFrac}
            setSelecFrac={setSelecFrac}
            selected={selected}
            setSelected={setSelected}
            customer={customer}
            setCustomer={setCustomer}
            closeModal={closeModal}
            handleSubmit={(event) => {
              {sorteo.split('-')[1]==='true'?
              sellLoteriafisica(sorteo,selecFrac):
              sellLoteria(sorteo)
              }
              
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
