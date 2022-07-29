import { useState } from "react";
import Form from "../../components/Base/Form";
import Input from "../../components/Base/Input";
import Button from "../../components/Base/Button";
import ButtonBar from "../../components/Base/ButtonBar";
import { consultarPrefactura } from "./utils/fetchCirculemos";
import Prefactura from "./views/Prefactura";
import Select from "../../components/Base/Select";
import { notifyError } from "../../utils/notify";

const Circulemos = () => {
  const [prefactura, setPrefactura] = useState("");
  const [consulta, setConsulta] = useState("");
  const [total, setTotal] = useState("");

  const formatMoney = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  });

  const HandleClick = (e) => {
    e.preventDefault();
    const query = {
      numeroPrefactura: prefactura,
      codigoTipoIdentificacion: "",
      numeroIdentificacion: "",
      consultarTodosLosEstados: "true",
      codigoServicioFacturacion: "",
      radicadoSolicitud: "",
      codigoOrganismoTransito: 13001000,
      listadoEstadosPrefactura: [],
      username: "usuario4",
      password: "ithfnc45",
      codigoOrganismo: "13001000",
      origen: "c1",
    };
    consultarPrefactura(query)
      .then((res) => {
        if (res?.status == false) {
          notifyError(
            "Error de conexión, intente de nuevo o consulte con soporte"
          );
        }
        if (res?.obj?.codigo == "002") {
          notifyError(res?.obj?.descripcion);
        }
        setConsulta(res);
        setTotal(res?.obj?.prefacturas?.[0]?.valorTotal);
      })
      .catch((err) => {
      });
  };
  return (
    <div className="w-full flex flex-col justify-center items-center my-8">
      <h1 className="text-3xl mt-6">Consulta radicado</h1>
      <Form grid>
        <>
          <Input
            id="codigoTipoIdentificacion"
            label="Tipo Identificación"
            type="text"
            minLength="7"
            maxLength="12"
            autoComplete="off"
            value="Valor quemado"
          />
          <Input
            id="numeroIdentificacion"
            label="Numero identificación"
            type="text"
            minLength="7"
            maxLength="12"
            autoComplete="off"
            value="Valor quemado"
          />
          <Select
            id="codigoOrganismo"
            name="codigo"
            label="Código organismo"
            options={[
              { value: 0, label: "" },
              { value: 1, label: "13001000" },
            ]}
          />
          <Input
            id="numeroPrefactura"
            label="Numero prefactura"
            type="text"
            autoComplete="off"
            value={prefactura}
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setPrefactura(num);
              }
            }}
          />
          <ButtonBar className="col-auto md:col-span-2">
            <Button type="submit" onClick={(e) => HandleClick(e)}>
              Consultar radicado
            </Button>
          </ButtonBar>
        </>
      </Form>
      <Prefactura
        prefacturaInfo={consulta?.obj}
        numero={prefactura}
        totalPrefactura={total}
        setPrefactura={setPrefactura}
      />
    </div>
  );
};

export default Circulemos;
