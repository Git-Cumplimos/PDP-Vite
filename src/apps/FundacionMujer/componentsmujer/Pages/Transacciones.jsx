import { useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import Select from "../../../../components/Base/Select/Select";
import Table from "../../../../components/Base/Table/Table";
import SellResp from "../../../LoteriaBog/components/SellResp/SellResp";
import SendForm from "../../../LoteriaBog/components/SendForm/SendForm";
import { useLoteria } from "../../../LoteriaBog/utils/LoteriaHooks";
import { Usemujer } from "../../../FundacionMujer/componentsmujer/utils/mujerHooks";
const Transacciones = () => {
  const {
    infoLoto: {
      respuestamujer,
      setRespuestamujer,
      arreglo,
      setArreglo,
      RespuestaPagoRecaudo,
      setRespuestaPagoRecaudo,
    },
    transacciones,
    transaccionesuno,
    transaccionesdos,
    transaccionestres,
    transaccionescuatro,
    transaccionescinco,
    transaccionesseis,
    transaccionessieste,
    transaccionesocho,
  } = Usemujer();

  const [filtro, setFiltro] = useState("");
  const [disabledBtns, setDocumento] = useState(false);
  const [filtro2, setfiltro2] = useState("");
  const [filtro3, setfiltro3] = useState("");
  const [id_trx, setid_trx] = useState("");
  const [Tipo_operacion, setTipo_operacion] = useState("");
  const [Comercio, setComercio] = useState("");

  const [response_status, setresponse_status] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    transacciones()
    transaccionesuno(id_trx);
    transaccionesdos(Tipo_operacion);
    transaccionestres(Comercio);
    transaccionescuatro(response_status);
    transaccionescinco(Tipo_operacion, Comercio);
    transaccionesseis(Tipo_operacion, response_status);
    transaccionessieste(Comercio, response_status);
    transaccionesocho(Tipo_operacion, Comercio, response_status);
    


    
    console.log(transacciones)
    console.log(transaccionesuno(id_trx));
    console.log(transaccionesdos(Tipo_operacion));
    console.log(transaccionestres(Comercio));
    console.log(transaccionescuatro(response_status));
    console.log(transaccionescinco(Tipo_operacion, Comercio));
    console.log(transaccionesseis(Tipo_operacion, response_status));
    console.log(transaccionessieste(Comercio, response_status));
    console.log(transaccionesocho(Tipo_operacion, Comercio, response_status));
  };

  return (
    <>
      <Form onSubmit={onSubmit} grid>
        <Input
          id="Filtro1"
          label="Filtro1"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={filtro}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setFiltro(num);
          }}
        />
        <Input
          id="Filtro2"
          label="Filtro2"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={filtro2}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setfiltro2(num);
          }}
        />
        <Input
          id="Filtro2"
          label="Filtro3"
          type="text"
          minLength="4"
          maxLength="4"
          autoComplete="false"
          value={filtro3}
          onInput={(e) => {
            const num = parseInt(e.target.value) || "";
            setfiltro3(num);
          }}
        />

        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit" disabled={disabledBtns}>
            Consultar transacciones
          </Button>
        </ButtonBar>
        <Table
          headers={["No transaccion", "Tipo transaccion", "fecha", "valor "]}
          data={[
            { hola: "2322 1232 1321 3213" },
            { fundaciones: "fundacion" },
            { fecha: "2021-10-21" },
            { valorapagar: "45.000" },
          ]}
        />
      </Form>
    </>
  );
};
export default Transacciones;
