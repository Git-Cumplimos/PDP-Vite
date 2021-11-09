import { useCallback, useEffect, useState } from "react";
import Button from "../components/Base/Button/Button";
import ButtonBar from "../components/Base/ButtonBar/ButtonBar";
import Form from "../components/Base/Form/Form";
import Modal from "../components/Base/Modal/Modal";
import Select from "../components/Base/Select/Select";
import Table from "../components/Base/Table/Table";
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
    tiposoperaciones:
      "http://tipos-operaciones-pdp-dev.us-east-2.elasticbeanstalk.com/tipos-operaciones",
    transacciones:
      "http://transacciones-pdp-dev.us-east-2.elasticbeanstalk.com/transaciones-view",
  };

  console.log(respuestatipooperaciontransaccion);

  const [disabledBtns, setDocumento] = useState(false);

  const [tipobusqueda, setTiposBusqueda] = useState("");

  const [objecttransacciones, setobjecttransacciones] = useState("");

  const [transaction, settransation] = useState("");

  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState(false);


    //transacciones uno
    const transacciones = useCallback(
      async (Tipo_operacion, response_status) => {
        const control={Comercio:2}
        if(Tipo_operacion){
          control.Tipo_operacion=Tipo_operacion;
        }
        if(response_status){
          control.response_status=response_status
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
     console.log(transacciones());
    transacciones(tipobusqueda).then((res) => {
      console.log(tipobusqueda);
      const b = [];
      for (const val of res.obj) {
        b.push({
          id: val.id_transaccion,
          label: val.Convenio,
          value: val.Created_at,
          operacion: val.Tipo_operacion,
          Monto: val.Monto,
          Documento: val.Response_obj["Documento"],
          Nombre: val.Response_obj["Nombres Cliente"],
        });
      }
      settransation([...b]);
    });
  };

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
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar transacciones
          </Button>
        </ButtonBar>
        <Table
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
        />
      </Form>

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
