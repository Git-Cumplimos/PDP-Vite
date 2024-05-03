import { useState, useEffect, useCallback, useMemo } from "react";
import FormCargaDocumentos from "../../components/FormCargaDocumentos";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import { postValidacionDocumentosCreditos } from "../../hooks/fetchCreditoFacil";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import ModalRechazarCreditos from "../../components/ModalRechazarCreditos";
import { useAuth } from "../../../../hooks/AuthHooks";

const CargueMasivoCredito = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { roleInfo, pdpUser } = useAuth();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formCarga, setFormCarga] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [dataCredito, setDataCredito] = useState({});
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
        id_comercio: 14903,
      };
      if (datosTrans?.year !== "" && datosTrans?.month !== "") {
        body.year = parseInt(datosTrans?.year);
        body.month = parseInt(datosTrans?.month);
      }
      postValidacionDocumentosCreditos(body)
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
        })
      ),
    ];
  }, [listadoCreditos]);

  return (
    <>
      {formCarga ? (
        <FormCargaDocumentos
          setModalOpen={setModalOpen}
          consultaCreditos={consultaCreditos}
          dataCredito={dataCredito}
          setFormCarga={setFormCarga}
        />
      ) : (
        <>
          {!isModalOpen && (
            <TableEnterprise
              title="Consulta y Validación de Documentos"
              headers={[
                "Id Comercio",
                "Nombre Comercio",
                "No. Solicitud",
                "Valor Crédito",
                "No. Cuotas",
                "Fecha Pre-aprobado",
                "Estado",
                "Usuario",
                "Fecha Creación",
              ]}
              data={tablaListadoCreditos}
              onSetPageData={setPageData}
              maxPage={maxPages}
              onSelectRow={(e, i) => {
                setDataCredito(tablaListadoCreditos[i]);
                setFormCarga(true);
                setModalOpen(false);
              }}
            >
              <Input
                id="searchComercio"
                name="searchComercio"
                label={"ID Comercio"}
                minLength="1"
                maxLength="20"
                type="text"
                value={roleInfo?.id_comercio}
                autoComplete="off"
                disabled
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
            </TableEnterprise>
          )}
        </>
      )}
    </>
  );
};

export default CargueMasivoCredito;
