import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending, notify } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import { enumParametrosCreditosPDP } from "../../utils/enumParametrosCreditosPdp";
import { useReactToPrint } from "react-to-print";
import Select from "../../../../components/Base/Select/Select";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import { postConsultaCreditosCEACRC } from "../../hooks/fetchCreditoFacil";
import TableEnterprise from "../../../../components/Base/TableEnterprise";

const URL_REALIZAR_CONSULTA_DECISOR = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/consulta-preaprobado-decisor`;
const URL_REALIZAR_SIMULACION_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/simulacion-credito-siian`;
const URL_CONSULTAR_ESTADO_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/check-estado-credito-facil`;
const URL_REALIZAR_DESEMBOLSO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil/desembolso-credito-facil`;

const DesembolsoCEACRC = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [listadoCuotas, setListadoCuotas] = useState([]);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [dataCredito, setDataCredito] = useState({
    valorPreaprobado: 0,
    valorSimulacion: 0,
    validacionValor: false,
    consultDecisor: {},
    consultSiian: {},
    estadoPeticion: 0,
    formPeticion: 0,
    showModal: false,
    showModalOtp: false,
    cosultEnvioOtp: {},
  });
  const [filteredComercio, setFilteredComercio] = useState(listadoCuotas);
  const [datosTrx, setDatosTrx] = useState({
    year: currentYear,
    month: currentMonth,
  });

  useEffect(() => {
    consultaCreditos();
  }, []);

  useEffect(() => {
    handleSearchComercioChange({ target: { value: "" } });
  }, [listadoCuotas]);

  const consultaCreditos = async () => {
    postConsultaCreditosCEACRC().then((res) => {
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setListadoCuotas(res?.obj);
      }
    });
  };

  const handleSearchComercioChange = useCallback(
    (e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      const filteredResults = listadoCuotas.filter((cuota) =>
        cuota.Idtercero.toString().toLowerCase().includes(searchTerm)
      );
      setFilteredComercio(filteredResults);
      setMaxPages(Math.ceil(filteredResults.length / limit));
      setPageData({ page: 1, limit });
    },
    [listadoCuotas, limit]
  );

  const tablaSimulacionCreditos = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const currentPageCuotas = filteredComercio.slice(startIndex, endIndex);

    return currentPageCuotas.map(
      ({
        Idtercero,
        Sucursal,
        Id,
        Valordesembolso,
        Cuotasmora,
        Fechadesembolso,
        Estado,
        Nombreasesor,
      }) => ({
        IdComercio: Idtercero,
        NombreComercio: Sucursal,
        NroSolicitud: Id,
        ValorCredito: formatMoney.format(Valordesembolso),
        Cuotas: Cuotasmora,
        FechaPreaprobado: new Date(Fechadesembolso).toLocaleDateString(
          "es-ES",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        ),
        EstadoCredito: Estado,
        NombreAsesor: Nombreasesor,
        Fechadesembolso: new Date(Fechadesembolso).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })
    );
  }, [filteredComercio, page, limit]);

  return (
    <>
      {isModalOpen ? (
        <Modal show={isModalOpen} className="flex align-middle">
          <>
            <Form>
              {dataCredito?.estadoPeticion === 1 ? (
                <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                  <h1 className="text-2xl text-center mb-5 font-semibold">
                    Simulación de Crédito
                  </h1>
                  <MoneyInput
                    id="valor"
                    name="valor"
                    label="Valor a simular"
                    type="text"
                    min={enumParametrosCreditosPDP.MINCREDITOPREAPROBADO}
                    max={dataCredito?.valorPreaprobado}
                    autoComplete="off"
                    maxLength={"12"}
                    value={dataCredito?.valorSimulacion}
                    required
                    onInput={(e, val) => {
                      setDataCredito((old) => ({
                        ...old,
                        valorSimulacion: val,
                      }));
                    }}
                    equalError={false}
                    equalErrorMin={false}
                  />
                  <>
                    <ButtonBar>
                      <Button type="submit">Realizar Simulación</Button>
                    </ButtonBar>
                  </>
                </div>
              ) : (
                <></>
              )}
            </Form>
          </>
        </Modal>
      ) : (
        <TableEnterprise
          title=""
          headers={[
            "Id Comercio",
            "Nombre Comercio",
            "No. Solicitud",
            "Valor Crédito",
            "No. Cuotas",
            "Fecha Pre-aprobado",
            "Estado",
            "Usuario Aprueba",
            "Fecha Aprobación",
          ]}
          data={tablaSimulacionCreditos}
          onSetPageData={setPageData}
          maxPage={maxPages}
          onSelectRow={(e, i) => {
            setModalOpen(true);
            console.log(tablaSimulacionCreditos[i]);
          }}
        >
          <Input
            id="searchComercio"
            name="searchComercio"
            label={"ID Comercio"}
            minLength="1"
            maxLength="20"
            type="text"
            autoComplete="off"
            onInput={handleSearchComercioChange}
          />
          <Input
            type="month"
            id="fecha"
            name="fecha"
            label="Fecha"
            autoComplete="off"
            value={`${datosTrx?.year}-${datosTrx?.month}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setDatosTrx((prevState) => ({
                ...prevState,
                year: year,
                month: month,
              }));
            }}
            required
          />
        </TableEnterprise>
      )}
    </>
  );
};

export default DesembolsoCEACRC;
