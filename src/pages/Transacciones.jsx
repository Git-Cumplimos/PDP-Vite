import { useCallback, useEffect, useState } from "react";
import Button from "../components/Base/Button/Button";
import ButtonBar from "../components/Base/ButtonBar/ButtonBar";
import Form from "../components/Base/Form/Form";
import Modal from "../components/Base/Modal/Modal";
import Select from "../components/Base/Select/Select";
import Table from "../components/Base/Table/Table";
import Input from "../components/Base/Input/Input";
import { toast } from "react-toastify";
import SearchFormtres from "../apps/FundacionMujer/componentsmujer/SearchForm/SearchFormtres";
import Sellfundamujertransaccion from "../apps/FundacionMujer/componentsmujer/sellFundamujer/SellFundamujertransaccion";
import fetchData from "../utils/fetchData";
import { useAuth } from "../utils/AuthHooks";

const Transacciones = () => {
  const { roleInfo } = useAuth();
  const [respuestamujer, setRespuestamujer] = useState(null);
  const [
    respuestatipooperaciontransaccion,
    setrespuestatipooperaciontransaccion,
  ] = useState(null);

  const urls = {
    tiposoperaciones: process.env.REACT_APP_URL_TRXS_TIPOS,
    transacciones: process.env.REACT_APP_URL_TRXS_TRX,
  };

  console.log(respuestatipooperaciontransaccion);

  const [disabledBtns, setDocumento] = useState(false);

  const [tipobusqueda, setTiposBusqueda] = useState("");

  const [objecttransacciones, setobjecttransacciones] = useState("");

  const [transaction, settransation] = useState("");

  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [respTran, setRespTran] = useState("");
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [fechaInicial, setFechaInicial] = useState(null);
  const [fechaFinal, setFechaFinal] = useState(null);



    //transacciones uno
    const transacciones = useCallback(
      async (Tipo_operacion, page,fechaInicial,fechaFinal) => {
        const control={Comercio:2}/////////////////no debe ser quemado
        if(Tipo_operacion){
          control.Tipo_operacion=Tipo_operacion;
        }
        // if(response_status){
        //   control.response_status=response_status
        // }
        if(page){
          control.page=page
        }
        if(fechaInicial&&fechaFinal){
          console.log('Hola')
        }
        try {
          const res = await fetchData(urls.transacciones, "GET", control);
          console.log(res)
          return res;
        } catch (err) {
          console.log("back fallando");
        }
      },
      []
    );


    //consulta tipo de operaciones
    const tiposdeoperaciones = useCallback(async () => {
      try {
        const res = await fetchData(urls.tiposoperaciones, "GET", {});
  
        console.log(res);
        return res;
      } catch (err) {
        console.error(err);
      }
    }, []);
  
  const recauditosss = () => {
    setRespuestamujer(selected);
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
  }, []);



  
  const notify = (msg) => {
    toast.info(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  useEffect(() => {
    tiposdeoperaciones().then((res) => {
      const a = [{value:null,label:""}];
      for (const val of res.obj) {
        a.push({ value: val.id_tipo_operacion, label: val.Nombre });
      }
      setobjecttransacciones([...a]);
      console.log(a)
    });
    console.log(tiposdeoperaciones());
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setMaxPages(1)
    setPage(1)
    setTiposBusqueda("")

     
    transacciones(tipobusqueda,1,fechaFinal,fechaFinal).then((res) => {
      console.log(tipobusqueda);
      console.log(res)
      setRespTran(res?.obj?.trxs)
      setMaxPages(res?.obj?.maxpages)
      // const b = [];
      // for (const val of res.obj.trxs) {
      //   b.push({
      //     id: val.id_transaccion,
      //     label: val.Convenio,
      //     value: val.Created_at,
      //     operacion: val.Tipo_operacion,
      //     Monto: val.Monto,
      //     Documento: val.Response_obj["Documento"],
      //     Nombre: val.Response_obj["Nombres Cliente"],
      //   });
      // }
      // settransation([...b]);
    });
  };
  console.log(selected)
  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={objecttransacciones || []}
          value={tipobusqueda}
          
          onChange={(e) => {
            setTiposBusqueda(e.target.value);
          }}
        />
        
        {/* <Table
          headers={[
            "id",
            "Nombre",
            "Fecha",
            "operacion",
            "Monto",
            "Documento",
            "Nombre",
          ]}
          data={transaction || []}
          onSelectRow={(e, index) => {
            setSelected(transaction[index]);
            setShowModal(true);
          }}
        /> */}<br/>
        
            <Input
              id="dateInit"
              label="Fecha inicial"
              type="date"
              value={fechaInicial}
              onInput={(e) => {
                setFechaInicial(e.target.value);
              }}
              
            />
            <Input
              id="dateEnd"
              label="Fecha final"
              type="date"
              value={fechaFinal}
              onInput={(e) => {
                setFechaFinal(e.target.value);
              }}
              
            />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar transacciones
          </Button>
        </ButtonBar>
        <ButtonBar>
          <Button
            type="button"
            disabled={page < 2}
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                transacciones(tipobusqueda,page-1,fechaInicial,fechaFinal).then((res) => {
                  console.log(tipobusqueda);
                  console.log(res)
                  setRespTran(res?.obj?.trxs)
                  setMaxPages(res?.obj?.maxpages)
                });
              }
            }}
          >
            Anterior
          </Button>
          <Button
            type="button"
            disabled={page >= maxPages || respTran.length === 0}
            onClick={() => {
              if (page < maxPages) {
                setPage(page + 1);
                transacciones(tipobusqueda,page+1,fechaInicial,fechaFinal).then((res) => {
                  console.log(tipobusqueda);
                  console.log(res)
                  setRespTran(res?.obj?.trxs)
                  setMaxPages(res?.obj?.maxpages)
                });
              
              }
            }}
          >
            Siguiente
          </Button>
        </ButtonBar>
      </Form>
      {Array.isArray(respTran) && respTran.length > 0 ? (
        <>
          <div className="flex flex-row justify-evenly w-full my-4">
            <h1>Pagina: {page}</h1>
            <h1>Ultima pagina: {maxPages}</h1>
          </div>
          <Table
            headers={[
             
            "Fecha",
            "operacion",
            "Monto",
           
            ]}
            data={respTran.map(
              ({
                Created_at,
                Tipo_operacion,
                Monto,
              }) => {
                return {
                  Created_at,
                  Tipo_operacion,
                  Monto,
                 
                };
              }
            )}
            onSelectRow={(e, index) => {
              setSelected(respTran[index]);
              setShowModal(true);
            }}
          />
        </>
      ) : (
        ""
      )}

      <Modal show={showModal} handleClose={() => closeModal()}>
        {!respuestamujer ? (
          <SearchFormtres
            selected={selected}
            closeModal={closeModal}
            handleSubmit={(event) => {
              event.preventDefault();

              recauditosss();
            }}
          />
        ) : (
          <Sellfundamujertransaccion
            respuestamujer={respuestamujer}
            setRespuestamujer={setRespuestamujer}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </>
  );
};
export default Transacciones;
