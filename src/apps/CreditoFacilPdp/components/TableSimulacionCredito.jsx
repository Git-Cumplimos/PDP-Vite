import { useCallback, useMemo, useState } from "react";
import { formatMoney } from "../../../components/Base/MoneyInput";
import { useAuth } from "../../../hooks/AuthHooks";
import ButtonBar from "../../../components/Base/ButtonBar";
import Button from "../../../components/Base/Button";
import { notifyError, notify } from "../../../utils/notify";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { postDescargarSimulacion } from "../hooks/fetchCreditoFacil";

const TableSimulacionCredito = ({
  dataCredito,
  setDataCredito,
  listadoCuotas,
}) => {
  const { roleInfo } = useAuth();
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const handleCloseCancelarSimulacion = useCallback(() => {
    setDataCredito((oldData) => ({
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
    // consultaDecisor();
  }, [setDataCredito]);

  const fecthDescargarSimulacion = () => {
    let obj = {
      response: dataCredito?.consultSiian,
      nombre_comercio: roleInfo?.nombre_comercio,
    };
    postDescargarSimulacion(obj)
      .then(async (res) => {
        if (res?.status) {
          notify(res?.msg);
          window.open(res?.obj?.url);
        }
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        console.error(err);
      });
  };

  const tablaSimulacionCreditos = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, listadoCuotas.length);
    const currentPageCuotas = listadoCuotas.slice(startIndex, endIndex);
    const totalPages = Math.ceil(listadoCuotas.length / limit);

    setMaxPages(totalPages);
    setPageData({ page, limit });

    return [
      ...currentPageCuotas.map(
        ({
          cuota,
          fechaPago,
          valorCuota,
          abonoCapital,
          abonoIntereses,
          saldoCapital,
        }) => {
          return {
            Cuota: cuota,
            FechaPago: new Date(fechaPago).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            ValorCuota: formatMoney.format(valorCuota),
            AbonoCapital: formatMoney.format(abonoCapital),
            AbonoInteres: formatMoney.format(abonoIntereses),
            SaldoCapital: formatMoney.format(saldoCapital),
          };
        }
      ),
    ];
  }, [listadoCuotas, page, limit]);

  return (
    <div className="flex flex-col justify-center ">
      <h1 className="text-4xl text-center">Simulación de Crédito</h1>
      <br />
      <div className="grid grid-cols-3 gap-4">
        <h2 className="text-xl ml-10">{`Comercio: ${
          dataCredito?.consultSiian?.nombre ?? ""
        }`}</h2>
        <h2 className="text-xl ml-10">{`Monto del Crédito: ${
          formatMoney.format(dataCredito?.consultSiian?.monto) ?? ""
        }`}</h2>
        <h2 className="text-xl ml-10">{`Plazo Crédito en Días: ${
          dataCredito?.plazo ?? ""
        }`}</h2>
      </div>
      <TableEnterprise
        title=""
        headers={[
          "Cuota",
          "Fecha de Pago",
          "Valor Cuota",
          "Abono Capital",
          "Abono Interés",
          "Saldo Capital",
        ]}
        data={tablaSimulacionCreditos}
        onSetPageData={setPageData}
        maxPage={maxPages}
        children={false}
      ></TableEnterprise>
      <ButtonBar className="lg:col-span-2">
        <Button type="button" onClick={handleCloseCancelarSimulacion}>
          Regresar
        </Button>
        <Button type="submit" onClick={fecthDescargarSimulacion}>
          Descargar Simulación
        </Button>
        <Button
          type="submit"
          onClick={() => {
            setDataCredito((old) => ({
              ...old,
              formPeticion: 2,
            }));
          }}
        >
          Desembolsar
        </Button>
      </ButtonBar>
    </div>
  );
};

export default TableSimulacionCredito;
