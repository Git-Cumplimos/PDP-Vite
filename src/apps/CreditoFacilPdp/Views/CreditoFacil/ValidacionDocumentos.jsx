import { useState, useEffect, useCallback, useMemo } from "react";
import FormCargaDocumentos from "../../components/FormCargaDocumentos";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import { postValidacionDocumentosCreditos } from "../../hooks/fetchCreditoFacil";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import FormAceptarTerminosCEACRC from "../../components/FormAceptarTerminosCEACRC";
import ModalModificarDocumento from "../../components/ModalModificarDocumento";
import FormActualizarDocumentos from "../../components/FormActualizarDocumentos";
import { useAuth } from "../../../../hooks/AuthHooks";
import { postTerminosCondicionesCEACRC } from "../../hooks/fetchCreditoFacil";
import { notifyError } from "../../../../utils/notify";

const initialFileState = {
  pagareFirmado: "",
  cedulaRepresentante: "",
  estadoFinanciero: "",
  camaraComercio: "",
  contrato: "",
  certificacionBancaria: "",
};

const CargueMasivoCredito = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { roleInfo, pdpUser } = useAuth();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [url, setUrl] = useState("");
  const [modifyFile, setModifyFile] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [file, setFile] = useState({});
  const [nameFile, setNameFile] = useState("");
  const [isModalOpenPDF, setModalOpenPDF] = useState(false);
  const [formCarga, setFormCarga] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [dataCredito, setDataCredito] = useState({});
  const [estado, setEstado] = useState(0);
  const [nameRoute, setNameRoute] = useState("");
  const [openUpdate, setOpenUpdate] = useState(false);
  const [datosTrans, setDatosTrans] = useState({
    estado: "",
    idComercio: "",
    year: "",
    month: "",
  });
  const [fileDocuments, setFileDocuments] = useState(initialFileState);

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

  const openModal = useCallback(() => {
    if (isChecked) {
      setChecked(false);
    } else {
      postTerminosCondicionesCEACRC().then((res) => {
        if (!res?.status) {
          notifyError(res?.msg);
        } else {
          setUrl(res?.obj?.url);
          setModalOpenPDF(true);
          setShowModal(true);
        }
      });
    }
  }, [isChecked]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setFormCarga(false);
    setEstado(0);
    consultaCreditos();
    setFileDocuments(initialFileState);
    setChecked(false);
    setOpenUpdate(false);
    setModifyFile(false);
  }, []);

  return (
    <>
      {formCarga ? (
        <FormCargaDocumentos
          consultaCreditos={consultaCreditos}
          dataCredito={dataCredito}
          isChecked={isChecked}
          estado={estado}
          setFileDocuments={setFileDocuments}
          fileDocuments={fileDocuments}
          openModal={openModal}
          handleClose={handleClose}
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
                setOpenUpdate(true);
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
      {isModalOpenPDF && (
        <FormAceptarTerminosCEACRC
          setModalOpenPDF={setModalOpenPDF}
          url={url}
          showModal={showModal}
          setChecked={setChecked}
        />
      )}
      {openUpdate && (
        <FormActualizarDocumentos
          dataCredito={dataCredito}
          setChecked={setChecked}
          setShowModal2={setShowModal2}
          setModifyFile={setModifyFile}
          setNameRoute={setNameRoute}
          setNameFile={setNameFile}
          setEstado={setEstado}
          estado={estado}
          setFileDocuments={setFileDocuments}
          fileDocuments={fileDocuments}
          handleClose={handleClose}
        />
      )}
      {modifyFile && !isModalOpenPDF &&(
        <ModalModificarDocumento
          setModifyFile={setModifyFile}
          setShowModal2={setShowModal2}
          showModal2={showModal2}
          setFile={setFile}
          nameFile={nameFile}
          consultaCreditos={consultaCreditos}
          file={file}
          setModalOpenPDF={setModalOpenPDF}
          nameRoute={nameRoute}
          dataCredito={dataCredito}
          setEstado={setEstado}
        />
      )}
    </>
  );
};

export default CargueMasivoCredito;
