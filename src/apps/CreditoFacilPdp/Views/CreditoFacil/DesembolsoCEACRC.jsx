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
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [listadoCuotas, setListadoCuotas] = useState([]);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  // const [dataCredito, setDataCredito] = useState({
  //   valorPreaprobado: 0,
  //   valorSimulacion: 0,
  //   validacionValor: false,
  //   consultDecisor: {},
  //   consultSiian: {},
  //   estadoPeticion: 0,
  //   formPeticion: 0,
  //   showModal: false,
  //   showModalOtp: false,
  //   cosultEnvioOtp: {},
  // });
  const [filteredComercio, setFilteredComercio] = useState(listadoCuotas);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [dataCredito, setDataCredito] = useState({});
  const [formasPago, setFormasPago] = useState("19");

  const optionsFormasPago = [
    { value: "19", label: "Cuenta Corriente Banco Colpatria" },
    { value: "20", label: "Cuenta Ahorros Banco Agrario" },
    { value: "22", label: "Cuenta Corriente Bancolombia" },
    { value: "23", label: "Cuenta Corriente Davivienda" },
    { value: "24", label: "Cuenta Corriente Itau" },
    { value: "28", label: "Desembolso Crédito Comercios" },
  ];

  useEffect(() => {
    consultaCreditos();
  }, []);

  const consultaCreditos = async () => {
    postConsultaCreditosCEACRC().then((res) => {
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setListadoCuotas(res?.obj);
      }
    });
  };

  const handleSearchComercioChange = useCallback((e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    setFiltroBusqueda(searchTerm);
  }, []);

  const handleFechaChange = useCallback((e) => {
    const newFecha = e.target.value;
    setFiltroFecha(newFecha);
  }, []);

  useEffect(() => {
    let filteredResults = listadoCuotas;

    if (filtroBusqueda) {
      filteredResults = filteredResults.filter((cuota) =>
        cuota.Idtercero.toString().toLowerCase().includes(filtroBusqueda)
      );
    }

    if (filtroFecha) {
      filteredResults = filteredResults.filter((cuota) =>
        cuota.Fechadesembolso.includes(filtroFecha)
      );
    }

    setFilteredComercio(filteredResults);
    setMaxPages(Math.ceil(filteredResults.length / limit));
    setPageData({ page: 1, limit });
  }, [listadoCuotas, limit, filtroBusqueda, filtroFecha]);

  useEffect(() => {
    setFilteredComercio(listadoCuotas);
    setMaxPages(Math.ceil(listadoCuotas.length / limit));
    setPageData({ page: 1, limit });
  }, [listadoCuotas, limit]);

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
              <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                <h1 className="text-2xl text-center mb-5 font-semibold">
                  Desembolso de Crédito
                </h1>
                <h2 className="text-xl ml-10">{`Nombre del comercio: ${
                  dataCredito?.NombreComercio ?? ""
                }`}</h2>
                <h2 className="text-xl ml-10">{`Valor a desembolsar: ${
                  dataCredito?.ValorCredito ?? ""
                }`}</h2>
                <h2 className="text-xl ml-10">{`Estado del crédito: ${
                  dataCredito?.EstadoCredito ?? ""
                }`}</h2>
                <h2 className="text-xl ml-10">{`Usuario que aprueba: ${
                  dataCredito?.NombreAsesor ?? ""
                }`}</h2>
                <Select
                  id="formasPagoCredito"
                  label="Forma de desembolso"
                  options={optionsFormasPago}
                  value={formasPago}
                  onChange={(e) => {
                    setFormasPago(e.target.value);
                  }}
                  required
                />
                <h2 className="text-xl ml-10">{`Usuario que aprueba: ${
                  pdpUser?.uname ?? ""
                }`}</h2>
                <>
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={(e) => {
                        navigate(-1);
                        notifyError("Transacción cancelada por el usuario");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Desembolsar </Button>
                  </ButtonBar>
                </>
              </div>
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
            setDataCredito(tablaSimulacionCreditos[i]);
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
            value={filtroBusqueda}
            onInput={handleSearchComercioChange}
            onBlur={() =>
              handleSearchComercioChange({ target: { value: filtroBusqueda } })
            }
          />
          <Input
            type="month"
            id="fecha"
            name="fecha"
            label="Fecha"
            autoComplete="off"
            value={filtroFecha}
            onChange={handleFechaChange}
            required
          />
        </TableEnterprise>
      )}
    </>
  );
};

export default DesembolsoCEACRC;
