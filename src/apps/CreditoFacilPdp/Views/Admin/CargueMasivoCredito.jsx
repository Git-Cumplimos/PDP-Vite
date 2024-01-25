import { useState, useEffect, useCallback, useMemo } from "react";
import FormCargaMasivaCreditos from "../../components/FormCargaMasivaCreditos";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import { postConsultaCreditosPendienteDesembolsar } from "../../hooks/fetchCreditoFacil";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import ModalRechazarCreditos from "../../components/ModalRechazarCreditos";

const CargueMasivoCredito = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [dataCredito, setDataCredito] = useState({});
  const optionsEstados = [
    { value: "1", label: "Seleccione el estado" },
    { value: "Rechazado", label: "Rechazado" },
    { value: "Pre-aprobado", label: "Pre-aprobado" },
    { value: "Aprobado", label: "Aprobado" },
    { value: "Desembolsado", label: "Desembolsado" },
  ];
  const [datosTrans, setDatosTrans] = useState({
    estado: "",
    idComercio: "",
    year: "",
    month: "",
  });

  useEffect(() => {
    consultaCreditos();
  }, [datosTrans, page, limit]);

  const consultaCreditos = useDelayedCallback(
    useCallback(() => {
      const body = {
        limit: limit,
        page: page,
      };
      if (datosTrans?.estado !== "" && datosTrans?.estado !== "1") {
        body.estado = datosTrans?.estado;
      }
      if (datosTrans?.year !== "" && datosTrans?.month !== "") {
        body.year = parseInt(datosTrans?.year);
        body.month = parseInt(datosTrans?.month);
      }
      if (datosTrans?.idComercio !== "") {
        body.id_comercio = parseInt(datosTrans?.idComercio);
      }
      postConsultaCreditosPendienteDesembolsar(body)
        .then((autoArr) => {
          setListadoCreditos(autoArr?.obj?.results);
          setMaxPages(autoArr?.obj?.maxPages);
        })
        .catch((err) => console.error(err));
    }, [datosTrans, limit, page]),
    500
  );

  const tablaListadoCreditos = useMemo(() => {
    return [
      ...listadoCreditos.map(
        ({
          id_comercio,
          nombre_comercio,
          pk_tbl_creditos_pdp_validacion_documentos,
          valor_credito,
          plazo,
          fecha_ingreso,
          estado,
          uname,
        }) => ({
          IdComercio: id_comercio,
          NombreComercio: nombre_comercio,
          NroSolicitud: pk_tbl_creditos_pdp_validacion_documentos,
          ValorCredito: formatMoney.format(valor_credito),
          Cuotas: plazo,
          FechaPreaprobado: new Date(fecha_ingreso).toLocaleDateString(
            "es-ES",
            {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }
          ),
          EstadoCredito: estado,
          NombreAsesor: uname,
          FechaCreacion: new Date(fecha_ingreso).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          Acciones: (estado !== "Rechazado" && estado !== "Desembolsado") && (
            <ButtonBar>
              <Button type="submit" onClick={() => setShowModal(true)}>
                Rechazar
              </Button>
            </ButtonBar>
          ),
        })
      ),
    ];
  }, [listadoCreditos]);

  return (
    <>
      {!isModalOpen ? (
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
            value={datosTrans?.idComercio}
            autoComplete="off"
            onInput={(e) => {
              let num = e.target.value.replace(/[\s\.\-+eE]/g, "");
              if (!isNaN(num)) {
                setDatosTrans((old) => {
                  return { ...old, idComercio: num };
                });
              }
            }}
          />
          <Select
            id="estadoCredito"
            label="Estado crédito"
            options={optionsEstados}
            onChange={(e) => {
              setDatosTrans((old) => {
                return { ...old, estado: e.target.value };
              });
            }}
          />
          <Input
            type="month"
            id="fecha"
            name="fecha"
            label="Fecha"
            autoComplete="off"
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setDatosTrans((prevState) => ({
                ...prevState,
                year: year,
                month: month,
              }));
            }}
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
      ) : (
        <FormCargaMasivaCreditos
          setModalOpen={setModalOpen}
          consultaCreditos={consultaCreditos}
        />
      )}
      <ModalRechazarCreditos
        dataCredito={dataCredito}
        consultaCreditos={consultaCreditos}
        setShowModal={setShowModal}
        showModal={showModal}
      />
    </>
  );
};

export default CargueMasivoCredito;
