import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { notifyError, notifyPending } from "../../../../utils/notify";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import Form from "../../../../components/Base/Form/Form";
import { useAuth } from "../../../../hooks/AuthHooks";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput/MoneyInput";
import Select from "../../../../components/Base/Select/Select";
import {
  postConsultaCreditosCEACRC,
  useFetchCreditoFacil,
} from "../../hooks/fetchCreditoFacil";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import FormAceptarTerminosCEACRC from "../../components/FormAceptarTerminosCEACRC";
import { postTerminosCondicionesCEACRC } from "../../hooks/fetchCreditoFacil";

const URL_CONSULTAR_ESTADO_SIMULACION = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil-cea-crc/check-estado-desembolso-credito-facil`;
const URL_REALIZAR_DESEMBOLSO_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/credito-facil-cea-crc/desembolso`;

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
  const [filteredComercio, setFilteredComercio] = useState(listadoCuotas);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [dataCredito, setDataCredito] = useState({});
  const [formasPago, setFormasPago] = useState("19");
  const [isModalOpenPDF, setModalOpenPDF] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [url, setUrl] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  const openModal = useCallback(() => {
    if (isChecked) {
      setChecked(false);
    } else {
      postTerminosCondicionesCEACRC().then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
          navigate(-1);
        } else {
          setUrl(res?.obj?.url);
          setModalOpenPDF(true);
          setShowModal(true);
        }
      });
    }
  }, [isChecked]);

  const handleAccept = useCallback(() => {
    setModalOpen(false);
    setChecked(true);
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
        cuota.id_comercio.toString().toLowerCase().includes(filtroBusqueda)
      );
    }

    if (filtroFecha) {
      filteredResults = filteredResults.filter((cuota) => {
        const fechaAprobacion = new Date(cuota.fecha_aprobacion_documento);
        const yearMonth = fechaAprobacion.toISOString().slice(0, 7); // Formato "YYYY-MM"
        return yearMonth === filtroFecha;
      });
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
        id_comercio,
        nombre_comercio,
        pk_tbl_creditos_pdp_validacion_documentos,
        valor_credito,
        plazo,
        fecha_ingreso,
        estado,
        usuario_documentos,
        fecha_aprobacion_documento,
      }) => ({
        IdComercio: id_comercio,
        NombreComercio: nombre_comercio,
        NroSolicitud: pk_tbl_creditos_pdp_validacion_documentos,
        ValorCredito: formatMoney.format(valor_credito),
        Cuotas: plazo,
        FechaPreaprobado: new Date(fecha_ingreso).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        EstadoCredito: estado,
        NombreAsesor: usuario_documentos,
        FechaAprobacion: new Date(
          fecha_aprobacion_documento
        ).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })
    );
  }, [filteredComercio, page, limit]);

  const desembolsoCredito = useCallback(
    (ev) => {
      ev.preventDefault();
      let valor_trx = dataCredito?.ValorCredito;
      const data = {
        oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
        valor_total_trx: parseInt(
          valor_trx.replace(/[$\s]/g, "").split(".").join("")
        ),
        nombre_comercio: dataCredito?.NombreComercio,
        nombre_usuario: pdpUser?.uname ?? "",
        address: roleInfo?.["direccion"],
        comercio: {
          id_comercio: parseInt(dataCredito?.IdComercio),
          id_usuario: roleInfo?.id_usuario ?? pdpUser?.uuid,
          id_terminal: roleInfo?.id_dispositivo ?? pdpUser?.uuid,
          id_uuid_trx: uniqueId,
        },
        Datos: {
          data: dataCredito,
          forma_pago: formasPago,
        },
      };
      console.log(data);
      const dataAditional = {
        id_uuid_trx: uniqueId,
      };
      notifyPending(
        peticionDesembolsoCredito(data, dataAditional),
        {
          render: () => {
            return "Procesando Desembolso del Crédito";
          },
        },
        {
          render: ({ data: res }) => {
            navigate("/creditos-pdp");
            return "Crédito desembolsado al cupo del comercio satisfactoriamente";
          },
        },
        {
          render: ({ data: error }) => {
            if (error?.message) {
              navigate(-1);
              return error?.message;
            } else {
              navigate(-1);
              return "Desembolso del Crédito fallido";
            }
          },
        }
      );
    },
    [navigate, roleInfo, pdpUser, dataCredito, uniqueId, formasPago]
  );
  const [loadingPeticionDesembolsoCredito, peticionDesembolsoCredito] =
    useFetchCreditoFacil(
      URL_REALIZAR_DESEMBOLSO_CREDITO,
      URL_CONSULTAR_ESTADO_SIMULACION,
      "Realizar simulación crédito"
    );

  return (
    <>
      {isModalOpen ? (
        <Modal show={isModalOpen} className="flex align-middle">
          <>
            <Form onSubmit={desembolsoCredito}>
              <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
                <h1 className="text-2xl text-center mb-5 font-semibold">
                  Desembolso de Crédito
                </h1>
                <h2 className="text-l ml-10">{`Nombre del comercio: ${
                  dataCredito?.NombreComercio ?? ""
                }`}</h2>
                <h2 className="text-l ml-10">{`Valor a desembolsar: ${
                  dataCredito?.ValorCredito ?? ""
                }`}</h2>
                <h2 className="text-l ml-10">{`Estado del crédito: ${
                  dataCredito?.EstadoCredito ?? ""
                }`}</h2>
                <h2 className="text-l ml-10">{`Usuario que aprueba: ${
                  dataCredito?.NombreAsesor ?? ""
                }`}</h2>
                <Select
                  id="formasPagoCredito"
                  style={{ fontSize: "medium" }}
                  label={
                    <span style={{ fontSize: "medium" }}>
                      Forma de desembolso
                    </span>
                  }
                  options={optionsFormasPago}
                  value={formasPago}
                  onChange={(e) => {
                    setFormasPago(e.target.value);
                  }}
                  required
                />
                <h2 className="text-x ml-10">{`Usuario que aprueba: ${
                  pdpUser?.uname ?? ""
                }`}</h2>
                <div className="text-center">
                  <label className="text-xl">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={openModal}
                      onChange={() => {}}
                      required
                    />
                    <span className="ml-2">Acepta Términos y Condiciones</span>
                  </label>
                </div>
                {isModalOpen && (
                  <Modal
                    show={dataCredito?.showModal}
                    className="flex align-middle"
                  >
                    <object
                      title="PDF Viewer"
                      data={url}
                      type="application/pdf"
                      width="100%"
                      height="500vh"
                    ></object>
                    <ButtonBar>
                      <Button type="submit" onClick={handleAccept}>
                        Aceptar
                      </Button>
                    </ButtonBar>
                  </Modal>
                )}
                {isModalOpenPDF && (
                  <FormAceptarTerminosCEACRC
                    setModalOpenPDF={setModalOpenPDF}
                    url={url}
                    showModal={showModal}
                    setChecked={setChecked}
                  />
                )}
                <>
                  <ButtonBar>
                    <Button
                      type="button"
                      onClick={(e) => {
                        navigate(-1);
                        notifyError("El desembolso fue cancelado por el usuario");
                      }}
                      disabled={loadingPeticionDesembolsoCredito}
                    >
                      Cancelar
                    </Button>
                    {isChecked && (
                      <Button
                        type="submit"
                        disabled={loadingPeticionDesembolsoCredito}
                      >
                        Desembolsar
                      </Button>
                    )}
                  </ButtonBar>
                </>
              </div>
            </Form>
          </>
        </Modal>
      ) : (
        <TableEnterprise
          title="Desembolso de Créditos"
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
            console.log(tablaSimulacionCreditos[i]);
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
            onInput={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              handleSearchComercioChange({ target: { value } });
            }}
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
