import { useCallback, useMemo, useState, useEffect } from "react";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { formatMoney } from "../../../components/Base/MoneyInput";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import { notifyPending } from "../../../utils/notify";
import Modal from "../../../components/Base/Modal";
import { useFetch } from "../../../hooks/useFetch";
import { fetchCustom } from "../utils/fetchCreditoFacil";
import { notifyError } from "../../../utils/notify";

const URL_RECHAZAR_CREDITOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/rechazar-creditos`;

const TablaListadoCreditosCEACRC = ({
  listadoCreditos,
  setDataCredito,
  dataCredito,
  setModalOpen,
  consultaCreditos,
}) => {
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [filteredComercio, setFilteredComercio] = useState(listadoCreditos);
  const [maxPages, setMaxPages] = useState(0);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const optionsEstados = [
    { value: "1", label: "Seleccione el estado" },
    { value: "Rechazado", label: "Rechazado" },
    { value: "Pre-aprobado", label: "Pre-aprobado" },
    { value: "Aprobado", label: "Aprobado" },
    { value: "Desembolsado", label: "Desembolsado" },
  ];

  const handleSearchComercioChange = useCallback((e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    setFiltroBusqueda(searchTerm);
  }, []);

  const handleFechaChange = useCallback((e) => {
    const newFecha = e.target.value;
    setFiltroFecha(newFecha);
  }, []);

  const handleEstadoChange = useCallback((e) => {
    const serchStatus = e.target.value;
    setFiltroEstado(serchStatus);
  }, []);

  useEffect(() => {
    let filteredResults = listadoCreditos;

    if (filtroBusqueda) {
      filteredResults = filteredResults.filter((cuota) =>
        cuota.id_comercio.toString().toLowerCase().includes(filtroBusqueda)
      );
    }

    if (filtroFecha) {
      const [filtroAnio, filtroMes] = filtroFecha.split("-");

      filteredResults = filteredResults.filter((cuota) => {
        const fechaIngreso = new Date(cuota.fecha_ingreso);
        const anioIngreso = fechaIngreso.getFullYear();
        const mesIngreso = fechaIngreso.getMonth() + 1;

        return (
          anioIngreso.toString() === filtroAnio &&
          mesIngreso.toString().padStart(2, "0") === filtroMes
        );
      });
    }

    if (filtroEstado && filtroEstado !== "1") {
      filteredResults = filteredResults.filter(
        (cuota) => cuota.estado.toString() === filtroEstado
      );
    }

    setFilteredComercio(filteredResults);
    setMaxPages(Math.ceil(filteredResults.length / limit));
    setPageData({ page: 1, limit });
  }, [listadoCreditos, limit, filtroBusqueda, filtroFecha, filtroEstado]);

  useEffect(() => {
    setFilteredComercio(listadoCreditos);
    setMaxPages(Math.ceil(listadoCreditos.length / limit));
    setPageData({ page: 1, limit });
  }, [listadoCreditos, limit]);

  const [loadingPeticionRechazoCredito, peticionRechazoCredito] = useFetch(
    fetchCustom(URL_RECHAZAR_CREDITOS, "POST", "Rechazar Créditos")
  );

  const handleRechazar = () => {
    const data = {
      numero_solicitud: dataCredito?.NroSolicitud,
    };
    notifyPending(
      peticionRechazoCredito({}, data),
      {
        render: () => {
          return "Procesando Rechazar Crédito";
        },
      },
      {
        render: ({ data: res }) => {
          setShowModal(false);
          consultaCreditos();
          return "Crédito rechazado satisfactoriamente";
        },
      },
      {
        render: ({ data: error }) => {
          if (error?.message) {
            setShowModal(false);
            consultaCreditos();
            return error?.message;
          } else {
            setShowModal(false);
            consultaCreditos();
            return "Crédito rechazado fallido";
          }
        },
      }
    );
  };

  const tablaListadoCreditos = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const currentPageCreditos = filteredComercio.slice(startIndex, endIndex);

    return currentPageCreditos.map(
      ({
        id_comercio,
        NombreComercio,
        pk_tbl_creditos_pdp_validacion_documentos,
        valor_credito,
        plazo,
        fecha_ingreso,
        estado,
        NombreUsuario,
      }) => ({
        IdComercio: id_comercio,
        NombreComercio: NombreComercio,
        NroSolicitud: pk_tbl_creditos_pdp_validacion_documentos,
        ValorCredito: formatMoney.format(valor_credito),
        Cuotas: plazo,
        FechaPreaprobado: new Date(fecha_ingreso).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        EstadoCredito: estado,
        NombreAsesor: NombreUsuario,
        FechaCreacion: new Date(fecha_ingreso).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        Acciones: estado !== "Rechazado" && (
          <ButtonBar>
            <Button type="submit" onClick={() => setShowModal(true)}>
              Rechazar
            </Button>
          </ButtonBar>
        ),
      })
    );
  }, [filteredComercio, page, limit]);

  return (
    <>
      <TableEnterprise
        title="Consulta y Cargue Masivo de Créditos"
        headers={[
          "Id Comercio",
          "Nombre Comercio",
          "No. Solicitud",
          "Valor Crédito",
          "No. Cuotas",
          "Fecha Pre-aprobado",
          "Estado",
          "Usuario Aprueba",
          "Fecha Creación",
          "",
        ]}
        data={tablaListadoCreditos}
        onSetPageData={setPageData}
        maxPage={maxPages}
        onSelectRow={(e, i) => {
          setDataCredito(tablaListadoCreditos[i]);
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
            handleSearchComercioChange({
              target: { value: filtroBusqueda },
            })
          }
        />
        <Select
          id="estadoCredito"
          label="Estado crédito"
          options={optionsEstados}
          value={filtroEstado}
          onChange={handleEstadoChange}
          // style={{ width: '20vh' }}
        />
        <Input
          type="month"
          id="fecha"
          name="fecha"
          label="Fecha"
          autoComplete="off"
          value={filtroFecha}
          onChange={handleFechaChange}
        />
        <ButtonBar>
          <Button
            type="submit"
            onClick={(e) => {
              setModalOpen(true);
            }}
          >
            Cargar masivamente créditos
          </Button>
        </ButtonBar>
      </TableEnterprise>
      <Modal show={showModal} className="flex align-middle">
        <div className="grid grid-flow-row auto-rows-max gap-4 place-items-center text-center">
          <h1 className="text-2xl text-center mb-2 font-semibold">
            {`¿Está seguro de rechazar el crédito?`}
          </h1>
          <h2 className="text-xl text-center">
            {`Número crédito: ${dataCredito?.NroSolicitud}`}
          </h2>
          <h2 className="text-xl text-center">
            {`Id del comercio: ${dataCredito?.IdComercio}`}
          </h2>
          <ButtonBar>
            <Button
              type="button"
              disabled={loadingPeticionRechazoCredito}
              onClick={() => {
                setShowModal(false);
                notifyError("Transacción cancelada por el usuario");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleRechazar}
              disabled={loadingPeticionRechazoCredito}
            >
              Aceptar
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </>
  );
};

export default TablaListadoCreditosCEACRC;
