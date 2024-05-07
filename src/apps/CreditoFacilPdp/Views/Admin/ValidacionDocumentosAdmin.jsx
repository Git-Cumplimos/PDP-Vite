import { useState, useEffect, useCallback, useMemo } from "react";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";
import {
  postValidacionDocumentosCreditos,
  postConsultaDocumentosBd,
} from "../../hooks/fetchCreditoFacil";
import { formatMoney } from "../../../../components/Base/MoneyInput";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import FormAprobacionDocumentos from "../../components/FormAprobacionDocumentos";
import ModalCambioEstadoDocumentos from "../../components/ModalCambioEstadoDocumentos";

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
  const [estadoDocumento, setEstadoDocumento] = useState("");
  const [validationStatus, setValidationStatus] = useState(initialFileState);
  const [validateDate, setValidateDate] = useState(initialFileState);
  const [usuarioCargue, setUsuarioCargue] = useState("");

  useEffect(() => {
    consultaCreditos();
  }, [datosTrans, page, limit]);

  const consultaCreditos = useDelayedCallback(
    useCallback(() => {
      const body = {
        limit: limit,
        page: page,
        // id_comercio: 14903,/// Aqui cambiar por roleInfo?.id_comercio
      };
      if (datosTrans?.year !== "" && datosTrans?.month !== "") {
        body.year = parseInt(datosTrans?.year);
        body.month = parseInt(datosTrans?.month);
      }
      if (datosTrans?.idComercio !== "") {
        body.id_comercio = parseInt(datosTrans?.idComercio);
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

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setFormCarga(false);
    setEstado(0);
    setFileDocuments(initialFileState);
    setChecked(false);
    setOpenUpdate(false);
    setModifyFile(false);
    consultaCreditos();
  }, []);

  const consultaDocumentos = useCallback(() => {
    const body = { numero_solicitud: dataCredito?.NroSolicitud };
    postConsultaDocumentosBd(body)
      .then((autoArr) => {
        const consultaDocumentosBD = autoArr?.obj?.archivos;
        if (Object.keys(consultaDocumentosBD).length > 0) {
          setEstado(1);
        }
        console.log(autoArr?.obj);
        setFileDocuments({
          pagareFirmado: consultaDocumentosBD?.Pagare?.archivo
            ? consultaDocumentosBD?.Pagare?.archivo
            : "",
          cedulaRepresentante: consultaDocumentosBD?.CedulaRepresentante
            ? consultaDocumentosBD?.CedulaRepresentante?.archivo
            : "",
          estadoFinanciero: consultaDocumentosBD?.EstadoFinanciero
            ? consultaDocumentosBD?.EstadoFinanciero?.archivo
            : "",
          camaraComercio: consultaDocumentosBD?.CamaraComercio
            ? consultaDocumentosBD?.CamaraComercio?.archivo
            : "",
          contrato: consultaDocumentosBD?.Contrato
            ? consultaDocumentosBD?.Contrato?.archivo
            : "",
          certificacionBancaria: consultaDocumentosBD?.CertificacionBancaria
            ? consultaDocumentosBD?.CertificacionBancaria?.archivo
            : "",
        });
        setValidationStatus({
          pagareFirmado: consultaDocumentosBD?.Pagare?.estadoValidacion,
          cedulaRepresentante:
            consultaDocumentosBD?.CedulaRepresentante?.estadoValidacion,
          estadoFinanciero:
            consultaDocumentosBD?.EstadoFinanciero?.estadoValidacion,
          camaraComercio:
            consultaDocumentosBD?.CamaraComercio?.estadoValidacion,
          contrato: consultaDocumentosBD?.Contrato?.estadoValidacion,
          certificacionBancaria:
            consultaDocumentosBD?.CertificacionBancaria?.estadoValidacion,
        });
        setUsuarioCargue(autoArr?.obj?.usuario_documentos);
        setValidateDate({
          pagareFirmado: consultaDocumentosBD?.Pagare?.fechaCargue,
          cedulaRepresentante:
            consultaDocumentosBD?.CedulaRepresentante?.fechaCargue,
          estadoFinanciero: consultaDocumentosBD?.EstadoFinanciero?.fechaCargue,
          camaraComercio: consultaDocumentosBD?.CamaraComercio?.fechaCargue,
          contrato: consultaDocumentosBD?.Contrato?.fechaCargue,
          certificacionBancaria:
            consultaDocumentosBD?.CertificacionBancaria?.fechaCargue,
        });
      })
      .catch((err) => console.error(err));
  }, [dataCredito]);

  return (
    <>
      {formCarga ? (
        <FormAprobacionDocumentos
          setChecked={setChecked}
          setShowModal2={setShowModal2}
          setModifyFile={setModifyFile}
          setNameRoute={setNameRoute}
          setNameFile={setNameFile}
          estado={estado}
          fileDocuments={fileDocuments}
          dataCredito={dataCredito}
          handleClose={handleClose}
          setEstadoDocumento={setEstadoDocumento}
          consultaDocumentos={consultaDocumentos}
          validationStatus={validationStatus}
          validateDate={validateDate}
          usuarioCargue={usuarioCargue}
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
      {modifyFile && !isModalOpenPDF && (
        <ModalCambioEstadoDocumentos
          setModifyFile={setModifyFile}
          setShowModal2={setShowModal2}
          showModal2={showModal2}
          setFile={setFile}
          nameFile={nameFile}
          consultaDocumentos={consultaDocumentos}
          file={file}
          setModalOpenPDF={setModalOpenPDF}
          nameRoute={nameRoute}
          dataCredito={dataCredito}
          setEstado={setEstado}
          estadoDocumento={estadoDocumento}
        />
      )}
    </>
  );
};

export default CargueMasivoCredito;
