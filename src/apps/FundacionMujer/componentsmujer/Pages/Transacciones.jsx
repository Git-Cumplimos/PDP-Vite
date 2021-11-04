import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Modal from "../../../../components/Base/Modal/Modal";
import Select from "../../../../components/Base/Select/Select";
import Table from "../../../../components/Base/Table/Table";


import { Usemujer } from "../../../FundacionMujer/componentsmujer/utils/mujerHooks";
import { toast } from "react-toastify";
import SearchFormtres from "../SearchForm/SearchFormtres";
import Sellfundamujertransaccion from "../../../FundacionMujer/componentsmujer/sellFundamujer/SellFundamujertransaccion";

const Transacciones = () => {
  const {
    infoLoto: {
      respuestamujer,
      setRespuestamujer,
      arreglo,
      setArreglo,
      RespuestaPagoRecaudo,
      setRespuestaPagoRecaudo,
      respuestatipooperaciontransaccion
    },
    transacciones,
    tiposdeoperaciones,
  } = Usemujer();


  console.log(respuestatipooperaciontransaccion)

  const [filtro, setFiltro] = useState("");
  const [disabledBtns, setDocumento] = useState(false);

  const [id_trx, setid_trx] = useState("");
  const [Tipo_operacion, setTipo_operacion] = useState("");
  const [Comercio, setComercio] = useState("");

  const [response_status, setresponse_status] = useState("");

  const [tipooperacion, setTipoOperacion] = useState("");
  const [aliado, setAliado] = useState("");
  const [tipobusqueda, setTiposBusqueda] = useState("");

  const [objecttransacciones, setobjecttransacciones] = useState("");

  const[transaction,settransation]=useState("");

  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const a = [];
      for (const val of res.obj) {
        a.push({ value: val.Tipo_operacion, label: val.Nombre });
      }
      setobjecttransacciones([...a]);
    });
    console.log(tiposdeoperaciones());
  }, []);



  const onSubmit = (e) => {
    e.preventDefault();
    transacciones().then((res) => {
      const b=[];
      console.log(res)
      for(const val of res.obj){
        b.push({
          id:val.id_transaccion,
          label:val.Convenio,
          value:val.Created_at,
          operacion:val.Tipo_operacion,
          Monto:val.Monto,
          Documento:val.Response_obj["Documento"] ,
          Nombre:val.Response_obj["Nombres Cliente"] })
      }
      settransation([...b])
    })
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
            headers={["id","Nombre", "Fecha","operacion","Monto","Documento","Nombre"]}
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
