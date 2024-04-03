import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Base/Input";
import { formatMoney } from "../../../components/Base/MoneyInput";
import Form from "../../../components/Base/Form/Form";
import Fieldset from "../../../components/Base/Fieldset";
import { useAuth } from "../../../hooks/AuthHooks";
import { useFetch } from "../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyError, notifyPending } from "../../../utils/notify";
import { enumParametrosCreditosPDP } from "../utils/enumParametrosCreditosPdp";

const URL_REALIZAR_CONSULTA_DECISOR = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/consulta-preaprobado-decisor`;

const FormDecisorRealizarCredito = ({ dataCredito, setDataCredito }) => {
  const navigate = useNavigate();
  const { roleInfo } = useAuth();

  const consultaDecisor = useCallback(() => {
    const data = {
      id_comercio: roleInfo?.id_comercio,
    };
    notifyPending(
      peticionConsultaPreaprobado({}, data),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          const val = res?.obj?.Respuesta1;
          const cadena = val.split(";");
          const valorFinal = parseInt(cadena[2]);
          setDataCredito((old) => ({
            ...old,
            valorPreaprobado: valorFinal,
            consultDecisor: res?.obj,
          }));
          if (
            valorFinal < enumParametrosCreditosPDP.MINCREDITOPREAPROBADO ||
            valorFinal >= enumParametrosCreditosPDP.MAXCREDITOPREAPROBADO
          ) {
            notifyError("El comercio no dispone de un Crédito Pre-aprobado");
          } else {
            setDataCredito((old) => ({
              ...old,
              validacionValor: true,
              estadoPeticion: 1,
            }));
          }
          return "Consulta satisfactoria";
        },
      },
      {
        render: ({ data: error }) => {
          navigate(-1);
          return error?.message ?? "Consulta fallida";
        },
      }
    );
  }, [roleInfo]);
  const [loadingPeticionConsultaPreaprobado, peticionConsultaPreaprobado] =
    useFetch(
      fetchCustom(
        URL_REALIZAR_CONSULTA_DECISOR,
        "POST",
        "Consultar crédito preaprobado"
      )
    );

  useEffect(() => {
    consultaDecisor();
  }, []);

  const handleCloseDecisor = useCallback(() => {
    setDataCredito(oldData => ({
      ...oldData,
      valorPreaprobado: 0,
      valorSimulacion: 0,
      validacionValor: false,
      consultDecisor: {
        plazo: "",
        fecha_preaprobado: "",
      },
      consultSiian: {},
      estadoPeticion: 0,
      formPeticion: 0,
      showModal: false,
      plazo: 0,
      showModalOtp: false,
      cosultEnvioOtp: {},
    }));
    navigate(-1);
    notifyError("Transacción cancelada por el usuario");
  }, [setDataCredito, navigate]);

  return (
    <Form
      onSubmit={() => {
        setDataCredito((old) => ({
          ...old,
          showModal: true,
        }));
      }}
      grid
    >
      <Fieldset
        legend="Datos del crédito Pre-aprobado"
        className="lg:col-span-2"
      >
        <Input
          id="idComercio"
          name="idComercio"
          label={"Id comercio"}
          type="text"
          autoComplete="off"
          value={roleInfo?.id_comercio}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="nombreComercio"
          name="nombreComercio"
          label={"Nombre comercio"}
          type="text"
          autoComplete="off"
          value={roleInfo?.["nombre comercio"]}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="valorCredito"
          name="valorCredito"
          label={"Valor del crédito"}
          type="text"
          autoComplete="off"
          value={formatMoney.format(dataCredito?.valorPreaprobado)}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="numeroCuotas"
          name="numeroCuotas"
          label={"No. Cuotas"}
          type="text"
          autoComplete="off"
          value={dataCredito?.consultDecisor?.plazo}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="fechaPreAprobado"
          name="fechaPreAprobado"
          label={"Fecha de Preaprobado"}
          type="text"
          autoComplete="off"
          value={dataCredito?.consultDecisor?.fecha_preaprobado}
          onChange={() => {}}
          required
          disabled={true}
        />
        <Input
          id="estadoCredito"
          name="estadoCredito"
          label={"Estado"}
          type="text"
          autoComplete="off"
          value={"Pre-aprobado"}
          onChange={() => {}}
          required
          disabled={true}
        />
      </Fieldset>
      <ButtonBar className="lg:col-span-2">
        <Button
          type="button"
          onClick={handleCloseDecisor}
          disabled={loadingPeticionConsultaPreaprobado}
        >
          Cancelar
        </Button>
        {dataCredito?.validacionValor && (
          <ButtonBar>
            <Button type="submit" disabled={loadingPeticionConsultaPreaprobado}>
              Simular crédito
            </Button>
          </ButtonBar>
        )}
      </ButtonBar>
    </Form>
  );
};

export default FormDecisorRealizarCredito;
