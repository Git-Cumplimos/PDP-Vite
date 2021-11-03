import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import Select from "../../../../components/Base/Select/Select";
import Table from "../../../../components/Base/Table/Table";
import { Usemujer } from "../../../FundacionMujer/componentsmujer/utils/mujerHooks";
import { toast } from "react-toastify";
import SearchFormdos from "../SearchForm/SearchFormdos";

import Sellfundamujerrecaudo from "../../../FundacionMujer/componentsmujer/sellFundamujer/SellFundamujerrecaudo";

const Recaudo = () => {
  const {
    infoLoto: { respuestamujer, setRespuestamujer, arreglo, setArreglo  ,RespuestaPagoRecaudo,
      setRespuestaPagoRecaudo },
    recaudo,
    recaudo2,
    pagorecaudo,
  } = Usemujer();

  const [Documentoselect, setDocumentoselect] = useState("");
  const [documento, setDocumento] = useState("");
  const [numerocredito, Setnumerocredito] = useState("");
  const [tipobusqueda, setTiposBusqueda] = useState("");
  const [disabledBtns, setDisabledBtns] = useState(false);
  const [cedula, setCedula] = useState("");
  const [comercio, setComercio] = useState("");
  const [selected, setSelected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [recauditoss, setRecauditoss] = useState("");

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
  const notifyError = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const closeModal = useCallback(async () => {
    setShowModal(false);
    recaudo("")
    recaudo2("")
    pagorecaudo("")
  }, []);

  //////////////////////
  const onSubmit = (e) => {
    e.preventDefault();
    setDisabledBtns(true);
    /// recaudo
    recaudo(cedula, comercio)
      .then((res) => {
        setDisabledBtns(false);
        if ("msg" in res) {
          notify("recaudo confirmado");
        }
        console.log(res);
        setRecauditoss(res);
      })
      .catch(() => setDisabledBtns(false));
    ///reacudo 2
    recaudo2(cedula, comercio)
      .then((res) => {
        setDisabledBtns(false);
        if ("msg" in res) {
          notify("recaudo confirmado");
        }
        console.log(res);
        setRecauditoss(res);
      })
      .catch(() => setDisabledBtns(false));
    //pagorecaudo
   /*  pagorecaudo()
      .then((res) => {
        setDisabledBtns(false);
        console.log(res);
      })
      .catch(() => setDisabledBtns(false)); */
  };


  ///////////////////////////////////////////////
  const recauditosss = () => {
    setRespuestamujer({...RespuestaPagoRecaudo?.obj });
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Select
          id="searchBySorteo"
          label="Tipo de busqueda"
          options={[
            { value: "", label: "" },
            {
              value: 1,
              label: `Documento  ${Documentoselect}`,
            },
            {
              value: 2,
              label: `Nº credito ${numerocredito}`,
            },
          ]}
          value={tipobusqueda}
          onChange={(e) => {
            setTiposBusqueda(e.target.value);
          }}
        />
        {tipobusqueda == 1 ? (
          <Input
            id="numpin"
            label="Numero Documento"
            type="text"
            minLength="4"
            maxLength="4"
            autoComplete="false"
            value={documento}
            onInput={(e) => {
              const num = parseInt(e.target.value) || "";
              setDocumento(num);
            }}
          />
        ) : (
          <Input
            id="numpin"
            label="Numero credito"
            type="text"
            minLength="4"
            maxLength="4"
            autoComplete="false"
            value={numerocredito}
            onInput={(e) => {
              const num = parseInt(e.target.value) || "";
              Setnumerocredito(num);
            }}
          />
        )}{" "}
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar recaudos
          </Button>
        </ButtonBar>
       
       
       
        {tipobusqueda == 1 ? (
          <Table
            headers={[
              "Numero de credito",
              "cedula",
              "Nombre cliente",
              "valor a pagar",
            ]}
            data={recauditoss?.obj || []}
            onSelectRow={(e, index) => {
              setSelected(recauditoss?.obj[index]);
              setShowModal(true);
            }}
          />
        ) : (
          <Table
            headers={[
              "Numero de credito",
              "cedula",
              "Nombre cliente",
              "valor a pagar",
            ]}
            data={recauditoss?.obj || []}
            onSelectRow={(e, index) => {
              setSelected(recauditoss?.obj[index]);
              setShowModal(true);
            }}
          />
        )}
      </Form>

      <Modal show={showModal} handleClose={() => closeModal()}>
        {!respuestamujer ? (
          <SearchFormdos
            selected={selected}
            closeModal={closeModal}
            handleSubmit={(event) => {
              event.preventDefault();
              pagorecaudo()
              recauditosss();
              
            }}
          />
        ) : (
          <Sellfundamujerrecaudo
            respuestamujer={respuestamujer}
            setRespuestamujer={setRespuestamujer}
            closeModal={closeModal}
          />
        )}
      </Modal>
    </>
  );
};
export default Recaudo;
