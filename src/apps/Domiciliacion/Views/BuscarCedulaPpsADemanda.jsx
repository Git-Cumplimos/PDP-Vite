import { useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Input from "../../../components/Base/Input";
import Form from "../../../components/Base/Form";
import fetchData from "../../../utils/fetchData";

import { notifyError } from "../../../utils/notify";
import TipoPpsADemanda from "./TipoPpsADemanda";

const BuscarCedulaPpsADemanda = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [buscarCedula, setBuscarCedula] = useState(null);

  const [cantNum, setCantNum] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [estado, setEstado] = useState(false);
  const [estadoInput, setEstadoInput] = useState(false);
  const url = `${process.env.REACT_APP_URL_COLPENSIONES}`;
  // const url = "http://127.0.0.1:2500/";

  const hijoAPadre = () => {
    setBuscarCedula("");
    setDatosConsulta("");
    setEstado(false);
  };
  /* function hijoAPadre() {
    setBuscarCedula("");
  } */
  //------------------Constantes para Dar Estilos---------------------//

  //------------------Funcion Para Calcular la Cantidad De Digitos Ingresados---------------------//
  useEffect(() => {
    cantidadNumero(buscarCedula);
  }, [buscarCedula]);
  function cantidadNumero(numero) {
    let contador = 1;
    while (numero >= 1) {
      contador += 1;
      numero = numero / 10;
    }
    setCantNum(contador);
    // console.log(cantNum);
  }

  // const handleClose = useCallback(() => {
  //   setShowModal(false);
  //   setDatosConsulta(0);
  //   setBuscarCedula("");
  // }, []);

  const BuscarCedula = (e) => {
    setShowModal(true);
    e.preventDefault();
    if (cantNum >= 6 && cantNum <= 13) {
      fetchData(
        `${url}/domicilio`,
        "GET",
        { identificacion: buscarCedula },
        {},
        {},
        {}
      )
        .then((respuesta) => {
          // console.log(respuesta?.obj?.results);
          setDatosConsulta(respuesta?.obj?.results);
          setEstado(true);
        })
        .catch((err) => {
          // console.log(err);
          notifyError(
            "Error respuesta PDP: (Falló al consumir el servicio [0010002])"
          );
        });
    } else {
      if (cantNum < 6 || cantNum > 13) {
        notifyError("Ingrese un número valido para la consulta.");
      }
    }
  };

  const onCedChange = (e) => {
    const formData = new FormData(e.target.form);
    const cedula = (
      (formData.get("N° Identificación") ?? "").match(/\d/g) ?? []
    ).join("");
    setBuscarCedula(cedula);
  };
  return (
    <div>
      <Form grid onSubmit={(e) => BuscarCedula(e)}>
        <Input
          name="N° Identificación"
          label="N° Identificación"
          type="tel"
          autoComplete="off"
          minLength={"5"}
          maxLength={"10"}
          /* invalid={invalidCedula} */
          value={buscarCedula ?? ""}
          onChange={onCedChange}
          required
          disabled={estadoInput}
        />

        <ButtonBar className={"lg:col-span-2"} type="">
          {
            <Button type="submit" onClick={() => setEstadoInput(true)}>
              Buscar Cliente
            </Button>
          }
        </ButtonBar>
      </Form>
      {(datosConsulta?.length >= 0) & estado ? (
        <TipoPpsADemanda
          numCed={buscarCedula}
          fun={hijoAPadre}
        ></TipoPpsADemanda>
      ) : (
        ""
      )}
    </div>
  );
};

export default BuscarCedulaPpsADemanda;
