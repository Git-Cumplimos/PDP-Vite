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
import {
  postConsultaCreditosPendienteDesembolsar,
  useFetchCreditoFacil,
} from "../../hooks/fetchCreditoFacil";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import fetchData from "../../../../utils/fetchData";
import InputX from "../../../../components/Base/InputX/InputX";

const url_cargueS3 = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/carga-archivo`;
const url_guardar = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/carga-masivo-creditos/creacion-credito`;

const CargueMasivoCredito = () => {
  const navigate = useNavigate();
  const uniqueId = v4();
  const { roleInfo, pdpUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [listadoCreditos, setListadoCreditos] = useState([]);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [file, setFile] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [filteredComercio, setFilteredComercio] = useState(listadoCreditos);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [dataCredito, setDataCredito] = useState({});
  const optionsEstados = [
    { value: "1", label: "Seleccione el estado" },
    { value: "Rechazado", label: "Rechazado" },
    { value: "Pre-aprobado", label: "Pre-aprobado" },
    { value: "Aprobado", label: "Aprobado" },
    { value: "Desembolsado", label: "Desembolsado" },
  ];

  const onChangeFile = (files) => {
    if (Array.isArray(Array.from(files))) {
      files = Array.from(files);
      if (files.length === 1) {
        const m_file = files[0];
        setFile(m_file);
      } else {
        if (files.length > 1) {
          notifyError("Se debe ingresar un solo archivo para subir");
        }
      }
    }
  };
  //------------------Funcion Para Subir El Formulario---------------------//
  const saveFile = useCallback(
    (e) => {
      e.preventDefault();
      const query = {
        contentType: "application/text",
        filename: `archivo_recaudo_multiple/${file.name}`,
      };
      fetchData(url_cargueS3, "POST", {}, query)
        .then((respuesta) => {
          if (!respuesta?.status) {
            notifyError(respuesta?.msg);
          } else {
            let name_file = respuesta?.obj?.fileName;
            // setEstadoForm(true);
            const formData2 = new FormData();
            if (file) {
              const resFormData = respuesta?.obj?.url;
              for (const property in resFormData?.fields) {
                formData2.set(
                  `${property}`,
                  `${resFormData?.fields[property]}`
                );
              }
              formData2.set("file", file);
              fetch(`${resFormData?.url}`, {
                method: "POST",
                body: formData2,
              })
                .then(async (res) => {
                  if (res?.ok) {
                    const query2 = {
                      filename: name_file,
                      comercio: {
                        id_comercio: roleInfo?.id_comercio,
                        id_usuario: roleInfo?.id_usuario,
                        id_terminal: roleInfo?.id_dispositivo,
                        nombre_comercio: roleInfo?.["nombre comercio"],
                        nombre_usuario: pdpUser?.uname,
                      },
                    };
                    console.log("data", query2);
                    fetchData(url_guardar, "POST", {}, query2)
                      .then((respuesta2) => {
                        if (!respuesta2?.status) {
                          notifyError(respuesta2?.msg);
                        } else {
                          notify(respuesta2?.msg);
                          setShowModal(false);
                          setModalOpen(false);
                        }
                      })
                      .catch((err) => {
                        notifyError("Error al cargar Datos");
                      });
                  } else {
                    notifyError("No fue posible conectar con el Bucket");
                  }
                })
                .catch((err) => {
                  notifyError("Error al cargar el archivo");
                  console.error(err);
                });
            }
          }
        })
        .catch((err) => {
          notifyError("Error al cargar Datos");
        });
    },
    [file]
  );

  useEffect(() => {
    consultaCreditos();
  }, []);

  const consultaCreditos = async () => {
    postConsultaCreditosPendienteDesembolsar().then((res) => {
      if (!res?.status) {
        notifyError(res?.msg);
      } else {
        setListadoCreditos(res?.obj?.data);
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
      console.log(listadoCreditos);
      console.log(filtroEstado);
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
      })
    );
  }, [filteredComercio, page, limit]);

  return (
    <>
      {!isModalOpen ? (
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
            ]}
            data={tablaListadoCreditos}
            onSetPageData={setPageData}
            maxPage={maxPages}
            onSelectRow={(e, i) => {
              console.log(tablaListadoCreditos[i]);
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
                  setShowModal(true);
                  setModalOpen(true);
                }}
              >
                Cargar masivamente créditos
              </Button>
            </ButtonBar>
          </TableEnterprise>
        </>
      ) : (
        <>
          <Modal show={showModal} handleClose={()=>{}}>
            <Form formDir="col" onSubmit={saveFile}>
              <Fieldset
                legend="Cargue Masivo de Créditos"
                className="lg:col-span-2"
              >
                <h1 className="text-2xl text-center mb-10 mt-5">
                  Cargue archivo de créditos
                </h1>
                <InputX
                  id={`archivo`}
                  label={file.name ? "Cambiar archivo" : `Elegir archivo`}
                  type="file"
                  accept=".csv"
                  onGetFile={onChangeFile}
                />
                {file.name ? (
                  <>
                    <h2 className="text-l text-center mt-5">
                      {`Archivo seleccionado: ${file.name}`}
                    </h2>
                    <ButtonBar>
                      <Button type="submit">Subir</Button>
                    </ButtonBar>
                  </>
                ) : (
                  ""
                )}
              </Fieldset>
            </Form>
          </Modal>
        </>
      )}
    </>
  );
};

export default CargueMasivoCredito;
