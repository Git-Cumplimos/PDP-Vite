import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Input from "../../../components/Base/Input";
import { notify, notifyError } from "../../../utils/notify";
import TipoPpsADemanda from "./TipoPpsADemanda";

const BuscarCedulaPpsADemanda = () => {
  const [datosConsulta, setDatosConsulta] = useState("");
  const [buscarCedula, setBuscarCedula] = useState("");
  const url = `${process.env.REACT_APP_URL_TRXS_TRX}`;
  const BuscarComercio = (e) => {
    e.preventDefault();
    if (emailComercio != "") {
      fetchData(
        `${url}/consultaemail`,
        "GET",
        { correo: emailComercio },
        {},
        {},
        {}
      )
        .then((respuesta) => {
          console.log(respuesta);
          setDatosConsulta(respuesta?.obj);
          setEstadoConsulta(true);
          if (
            respuesta?.obj?.msg ==
            "Fallo peticion de datos para correo suser: El usuario no existe o se encuentra en estado INACTIVO. Por favor validar e intentar nuevamente !"
          ) {
            notifyError(
              "El usuario no existe o se encuentra en estado INACTIVO"
            );
          } else {
            if (
              respuesta?.msg == "La consulta a Suser del Email a sido exitosa"
            ) {
              notify("Consulta Exitosa");
              setEstadoConsulta(true);
              setShowModal(true);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          notifyError("Error al Consultar Email");
        });
    } else {
      notifyError("Ingrese un Correo para la Consulta");
    }
  };
  return (
    <div>
      {datosConsulta === "" ? (
        <Fragment>
          <Input
            label={"Numero Cédula"}
            placeholder={"Ingrese Numero de Cédula"}
            value={buscarCedula}
            onChange={(e) => setBuscarCedula(e.target.value)}
            type={"number"}
            required
          ></Input>
          <ButtonBar className={"lg:col-span-2"} type="">
            {
              <Button type="submit" /* onClick={(e) => BuscarComercio(e)} */>
                Buscar Cliente
              </Button>
              /*  ) : null */
            }
          </ButtonBar>
        </Fragment>
      ) : datosConsulta != "" ? (
        <TipoPpsADemanda></TipoPpsADemanda>
      ) : (
        ""
      )}
    </div>
  );
};

export default BuscarCedulaPpsADemanda;
