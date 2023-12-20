import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { notify, notifyError } from "../../../../utils/notify";
import {
  postCambiarComercioGrupoComercio,
  postCrearComercio,
  putModificarComercio,
  postDispersionPagoComercio,
  postConsultaParametrizacionConvenios
} from "../../utils/fetchComercios";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import CommerceTable from "../../components/Commerce/CommerceTable";
import InputSuggestions from "../../../../components/Base/InputSuggestions/InputSuggestions";
import ToggleInput from "../../../../components/Base/ToggleInput/ToggleInput";
import { useAuth } from "../../../../hooks/AuthHooks";
import TiposContratosTable from "../../components/Commerce/TiposContratosTable";
import MoneyInput from "../../../../components/Base/MoneyInput";

const url_types = process.env.REACT_APP_URL_SERVICE_COMMERCE;
const init_grupo_comercio = process.env.REACT_APP_URL_INIT_GRUPO_COMERCIO;

const vectorCodigosInstitucionales = [
  ...process.env.REACT_APP_CODIGOS_INSTITUCIONALES_COMERCIOS.split("/").map(
    (e, i) => {
      return {
        value: e,
        label: e,
      };
    }
  ),
];

const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
// const urlComercios = `http://127.0.0.1:5000`;
const urlParametrizacion = process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
const urlActividades = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}/actividad`;

const emptyCommerce = {
  apellido_contacto1_comercio: "",
  apellido_contacto2_comercio: "",
  codigos_institucionales: {},
  comercio_padre: "",
  dane_ciudad: "",
  dane_dpto: "",
  dane_pais: "",
  descripcion_tipo_nivel: "",
  direccion_comercio: "",
  email_comercio: "",
  fecha_actualizacion: "",
  fecha_registro: "",
  fk_comercio_padre: "",
  fk_tipo_identificacion: "",
  // fk_tipo_nivel: "",
  latitud_comercio: "",
  longitud_comercio: "",
  nombre_comercio: "",
  nombre_contacto1_comercio: "",
  nombre_contacto2_comercio: "",
  numero_identificacion: "",
  pk_comercio: "",
  razon_social_comercio: "",
  tel_contacto1_comercio: "",
  tel_contacto2_comercio: "",
  telefono_fijo_comercio: "",
  pk_tbl_grupo_comercios: init_grupo_comercio,
  ciiu: null,
  fk_id_tipo_contrato: 0,
  alert_cupo: '',
};

const CrearComercios = () => {
  const { pdpUser } = useAuth();
  const { pk_comercio } = useParams();

  const [comercio, setComercio] = useState(emptyCommerce);
  // const [selectedCommerce, setSelectedCommerce] = useState(emptyCommerce);
  const [docTypes, setDocTypes] = useState({ "": "" });
  const [chooseContrato, setChooseContrato] = useState(false);

  const [commerceType, setCommerceType] = useState({});
  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);
  const [alertMonto, setAlertMonto] = useState('');
  const [alertPorcent, setAlertPorcent] = useState('');

  const [dispersionPagos, setDispersionPagos] = useState({
    id_comercio: "",
    autorizador_runt: "",
    autorizador_mt: "",
    autorizador_local: "",
    autorizador_runt_mt: "",
    convenio_runt: "",
    convenio_mt: "",
    convenio_local: "",
    convenio_runt_mt: "",
    trx_unica_runt_mt: false
  });

  const handleChangeDispersionPagos = (e) => {
    if (e.target.name === 'convenio_local') {
      setDispersionPagos((old) => {
        return {
        ...old,
        convenio_local: e.target.value.replace(/[^0-9]/g, '').slice(0, 13),
      }})
    }
    else if (e.target.name === 'convenio_runt') {
      setDispersionPagos((old) => {
        return {
        ...old,
        convenio_runt: e.target.value.replace(/[^0-9]/g, '').slice(0, 13),
        trx_unica_runt_mt: false
      }})
    }
    else if (e.target.name === 'convenio_mt') {
      setDispersionPagos((old) => {
        return {
        ...old,
        convenio_mt: e.target.value.replace(/[^0-9]/g, '').slice(0, 13),
        trx_unica_runt_mt: false
      }})
    }
    else if (e.target.name === 'convenio_runt_mt') {
      setDispersionPagos((old) => {
        return {
        ...old,
        convenio_runt_mt: e.target.value.replace(/[^0-9]/g, '').slice(0, 13),
        trx_unica_runt_mt: true
      }})
    }

  };

  const pk_comercio_handled = useMemo(() => {
    if (pk_comercio === undefined) {
      return -1;
    }
    if (pk_comercio === "crear") {
      return 0;
    }
    return parseInt(pk_comercio);
  }, [pk_comercio]);

  const [fetchComercios] = useFetchDispatchDebounce({
    onSuccess: useCallback((res) => {
      setComercio((old) => ({
        ...structuredClone(old),
        ...structuredClone(res?.obj),
      }));
      if (res?.obj.alert_cupo.includes('%')) {
        setAlertPorcent(res?.obj.alert_cupo.replace('%',''))
      }else{
        setAlertMonto(res?.obj.alert_cupo)
      }
      setCommerceType(
        Object.fromEntries(
          (res?.obj?.ciiu_list || []).map(({ id_ae, nombre_actividad }) => [
            id_ae,
            `${id_ae} - ${nombre_actividad}`,
          ])
        )
      );
    }, []),
    onError: useCallback((error) => console.error(error), []),
  });

  const [fetchActividades] = useFetchDispatchDebounce({
    onSuccess: useCallback(
      (res) =>
        setFoundActivities(
          res?.obj.map(({ id_actividad, nombre_actividad }) => [
            id_actividad,
            `${id_actividad} - ${nombre_actividad}`,
          ])
        ),
      []
    ),
    onError: useCallback((error) => console.error(error), []),
  });

  useFetchDebounce(
    {
      url: useMemo(() => `${url_types}/type-doc`, []),
    },
    {
      onSuccess: useCallback(
        (res) =>
          setDocTypes(
            [
              {
                value: "",
                label: "",
              },
            ].concat(
              res?.obj?.map(({ id_doc, Nombre, nombre_corto }) => ({
                value: id_doc,
                label: `${Nombre} (${nombre_corto})`,
              })) ?? []
            )
          ),
        []
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 50 }
  );

  useFetchDebounce(
    {
      url: useMemo(
        () =>
          `${urlParametrizacion}/servicio-grupo-comercios/consultar-grupo-comercios?limit=100&sortBy=pk_tbl_grupo_comercios&sortDir=DESC`,
        []
      ),
    },
    {
      onSuccess: useCallback(
        (res) =>
          setGrupoComercios(
            Object.fromEntries(
              [["", ""]].concat(
                (res?.obj?.results ?? []).map(
                  ({ pk_tbl_grupo_comercios, nombre_grupo_comercios }) => [
                    nombre_grupo_comercios,
                    pk_tbl_grupo_comercios,
                  ]
                )
              )
            )
          ),
        []
      ),
      onError: useCallback((error) => {
        if (error?.cause === "custom") {
          notifyError(error.message);
        } else {
          console.error(error);
        }
      }, []),
    },
    { delay: 50 }
  );

  useEffect(() => {
    if (![0, -1].includes(pk_comercio_handled)) {
      fetchComercios(
        `${urlComercios}/comercios/consultar-unique?pk_comercio=${pk_comercio_handled}`
      );
    }
  }, [fetchComercios, pk_comercio_handled]);

  useEffect(() => {
    if (pdpUser?.uuid) {
      setComercio((old) => ({
        ...old,
        usuario_ultima_actualizacion: pdpUser?.uuid,
      }));
    }
  }, [pdpUser?.uuid]);

  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState({
    selectedCod: "",
    codigosInst: [],
  });
  const [grupoComercios, setGrupoComercios] = useState([]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const onSelectComercios = useCallback(
    (_comercio) => {
      setComercio((old) => {
        return {
          ...old,
          fk_comercio_padre: _comercio.pk_comercio,
          comercio_padre: _comercio.nombre_comercio,
        };
      });
      handleClose();
    },
    [handleClose]
  );
  const onSelectTipoContrato = useCallback((tipoContrato) => {
    setComercio((old) => {
      return {
        ...old,
        fk_id_tipo_contrato: tipoContrato.id_tipo_contrato,
        nombre_contrato: tipoContrato.nombre_contrato,
      };
    });
    setChooseContrato(false);
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
  }, []);
  const onChangeFormat = useCallback(
    (ev) => {
      if (ev.target.name === "pk_tbl_grupo_comercios") {
        if (pk_comercio_handled) {
          const dataOrg = { ...comercio };
          if (ev.target.value === "")
            return notifyError("Seleccione el grupo de comercios");
          const obj = {
            pk_comercio: dataOrg.pk_comercio,
            fk_tbl_grupo_comercios: ev.target.value,
          };
          setIsUploading(true);
          postCambiarComercioGrupoComercio({
            ...obj,
          })
            .then((res) => {
              setIsUploading(false);
              if (res?.status) {
                notify(res?.msg);
              } else {
                notifyError(res?.msg);
              }
            })
            .catch((err) => {
              setIsUploading(false);
              notifyError("No se ha podido conectar al servidor");
              console.error(err);
            });
          setComercio((old) => {
            return { ...old, [ev.target.name]: ev.target.value };
          });
        } else {
          setComercio((old) => {
            return { ...old, [ev.target.name]: ev.target.value };
          });
        }
      } else {
        setComercio((old) => {
          return { ...old, [ev.target.name]: ev.target.value };
        });
      }
    },
    [comercio, pk_comercio_handled]
  );
  const seleccionarCodigoIns = useCallback(() => {
    if (selectedCodigo.selectedCod === "") {
      return notifyError("Seleccione el código institucional a agregar");
    }
    if (selectedCodigo.selectedCod in comercio?.codigos_institucionales) {
      return notifyError("El código ya existe en el comercio");
    }
    setComercio((old) => {
      return {
        ...old,
        codigos_institucionales: {
          ...old.codigos_institucionales,
          [selectedCodigo.selectedCod]: "",
        },
      };
    });
  }, [comercio.codigos_institucionales, selectedCodigo]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const dataOrg = structuredClone(comercio);
      if (!dataOrg.ciiu || !dataOrg.ciiu.length) {
        notifyError(
          "Debe elegir al menos una actividad economica para el comercio"
        );
        return;
      }
      setIsUploading(true);
      delete dataOrg["comercio_padre"];
      delete dataOrg["nombre_contrato"];
      delete dataOrg["descripcion_tipo_nivel"];
      delete dataOrg["fecha_actualizacion"];
      delete dataOrg["fecha_registro"];
      delete dataOrg["nombre_grupo_comercios"];
      delete dataOrg["ciiu_list"];
      if (!dataOrg.fk_comercio_padre) delete dataOrg["fk_comercio_padre"];
      if (!dataOrg.fk_id_tipo_contrato) delete dataOrg["fk_id_tipo_contrato"];
      if (!dataOrg.tipo_pago_comision) delete dataOrg["tipo_pago_comision"];
      if (!dataOrg.pk_comercio) delete dataOrg["pk_comercio"];
      if (dataOrg.alert_cupo === "%" || dataOrg.alert_cupo === 0) dataOrg.alert_cupo = ''
      if (pk_comercio_handled) {
        delete dataOrg["pk_tbl_grupo_comercios"];
        putModificarComercio(structuredClone(dataOrg))
          .then((res) => {
            setIsUploading(false);
            if (res?.status) {
              notify(res?.msg);
              navigate(-1);
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => {
            setIsUploading(false);
            notifyError("No se ha podido conectar al servidor");
            console.error(err);
          });
      } else {
        if (dataOrg.pk_tbl_grupo_comercios) {
          dataOrg.fk_tbl_grupo_comercios = dataOrg.pk_tbl_grupo_comercios;
          delete dataOrg["pk_tbl_grupo_comercios"];
        } else {
          setIsUploading(false);
          return notifyError("Escoja el grupo del comercio");
        }
        postCrearComercio({
          ...dataOrg,
        })
          .then((res) => {
            setIsUploading(false);
            if (res?.status) {
              notify(res?.msg);
              navigate(-1);
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => {
            setIsUploading(false);
            notifyError("No se ha podido conectar al servidor");
            console.error(err);
          });
      }

      const dispersionPagosEnvio = { ...dispersionPagos };
      dispersionPagosEnvio["id_comercio"] = parseInt(dataOrg.pk_comercio);
      if (dispersionPagosEnvio.trx_unica_runt_mt==true) {
        dispersionPagosEnvio["autorizador_runt"] = dispersionPagosEnvio.autorizador_runt_mt;
        dispersionPagosEnvio["autorizador_mt"] = dispersionPagosEnvio.autorizador_runt_mt;
        dispersionPagosEnvio["convenio_runt"] = dispersionPagosEnvio.convenio_runt_mt;
        dispersionPagosEnvio["convenio_mt"] = dispersionPagosEnvio.convenio_runt_mt;
      }
      else {
        dispersionPagosEnvio["autorizador_runt"] = dispersionPagosEnvio.autorizador_runt;
        dispersionPagosEnvio["autorizador_mt"] = dispersionPagosEnvio.autorizador_mt;
        dispersionPagosEnvio["convenio_runt"] = dispersionPagosEnvio.convenio_runt;
        dispersionPagosEnvio["convenio_mt"] = dispersionPagosEnvio.convenio_mt;
      }
      // if (dispersionPagosEnvio.autorizador_runt_mt) 
      delete dispersionPagosEnvio["autorizador_runt_mt"];
      // if (dispersionPagosEnvio.convenio_runt_mt) 
      delete dispersionPagosEnvio["convenio_runt_mt"];
      postDispersionPagoComercio(dispersionPagosEnvio)
      .then((res) => {
        setIsUploading(false);
        if (res?.status) {
          notify(res?.msg);
          navigate(-1);
        } else {
          notifyError(res?.msg);
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
    },
    [comercio, pk_comercio_handled, navigate, dispersionPagos]
  );

  useEffect(() => {
    const objConsulta = {
      "id_comercio": parseInt(comercio.pk_comercio)
    }
    if (comercio.pk_comercio!==""){
    postConsultaParametrizacionConvenios(objConsulta)
      .then((res) => {
        setIsUploading(false);
        if (res?.status) {
          if (res?.obj["trx_unica_runt_mt"]==true){
          setDispersionPagos((old) => {
            return {
            ...old,
            id_comercio: res?.obj["id_comercio"],
            autorizador_runt: "",
            autorizador_mt: "",
            autorizador_local: res?.obj["autorizador_local"],
            autorizador_runt_mt: res?.obj["autorizador_runt"],
            convenio_runt: "",
            convenio_mt: "",
            convenio_local: res?.obj["convenio_local"],
            convenio_runt_mt: res?.obj["convenio_runt"],
            trx_unica_runt_mt: res?.obj["trx_unica_runt_mt"],
          }})
        }
        else{
          setDispersionPagos((old) => {
            return {
            ...old,
            id_comercio: res?.obj["id_comercio"],
            autorizador_runt: res?.obj["autorizador_runt"],
            autorizador_mt: res?.obj["autorizador_mt"],
            autorizador_local: res?.obj["autorizador_local"],
            autorizador_runt_mt: "",
            convenio_runt: res?.obj["convenio_runt"],
            convenio_mt: res?.obj["convenio_mt"],
            convenio_local: res?.obj["convenio_local"],
            convenio_runt_mt: "",
            trx_unica_runt_mt: res?.obj["trx_unica_runt_mt"],
          }})
        }
        } 
      })
      .catch((err) => {
        setIsUploading(false);
        // notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
    }
  }, [comercio.pk_comercio, postConsultaParametrizacionConvenios]);

  if (pk_comercio_handled === -1) {
    <Navigate to={"/params-operations/comercios-params/comercios"} replace />;
  }

  const handleChangeCurrenci = (e,valor) => {
    if (e.target.name === 'configuración_porcentual') {
      setAlertPorcent(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
      setComercio((old)=>{return {...old,alert_cupo:(e.target.value.replace(/[^0-9]/g, '').slice(0, 2)+'%')}})
    }else{
      setAlertMonto(valor)
      setComercio((old)=>{return {...old,alert_cupo:valor}})
    }
  };

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl text-center">
        {pk_comercio_handled ? "Actualizar comercio" : "Crear comercio"}
      </h1>
      <Form grid onSubmit={onSubmit}>
        <Fieldset legend="Información general comercio"
          className="lg:col-span-2"
        >
          {!pk_comercio_handled && (
            <Input
              id="pk_comercio"
              label="Id comercio(Opcional)"
              type="text"
              name="pk_comercio"
              minLength="1"
              maxLength="32"
              value={comercio?.pk_comercio}
              onInput={onChangeFormat}
              autoComplete="off"
            />
          )}
          <Input
            id="nombre_comercio"
            label="Nombre comercio"
            type="text"
            name="nombre_comercio"
            minLength="1"
            maxLength="50"
            required
            value={comercio?.nombre_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="email_comercio"
            label="Email comercio"
            type="email"
            name="email_comercio"
            minLength="1"
            maxLength="50"
            required
            value={comercio?.email_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Select
            className="place-self-stretch"
            id="fk_tipo_identificacion"
            name="fk_tipo_identificacion"
            label="Tipo de documento"
            required={true}
            options={docTypes ?? []}
            onChange={onChangeFormat}
            value={comercio?.fk_tipo_identificacion}
          />
          <Input
            id="numero_identificacion"
            label="Número de identificación"
            type="text"
            name="numero_identificacion"
            minLength="1"
            maxLength="12"
            required
            value={comercio?.numero_identificacion}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, numero_identificacion: num };
                });
              }
            }}
            autoComplete="off"
          />
          <Select
            className="place-self-stretch"
            id="pk_tbl_grupo_comercios"
            name="pk_tbl_grupo_comercios"
            label="Grupo comercio"
            required={true}
            options={grupoComercios ?? []}
            onChange={onChangeFormat}
            value={comercio?.pk_tbl_grupo_comercios}
            autoComplete="off"
          />
          <Input
            id="telefono_fijo_comercio"
            label="Teléfono fijo"
            type="text"
            name="telefono_fijo_comercio"
            minLength="1"
            maxLength="12"
            required
            value={comercio?.telefono_fijo_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, telefono_fijo_comercio: num };
                });
              }
            }}
            autoComplete="off"
          />
          <Input
            id="razon_social_comercio"
            label="Razón social"
            type="text"
            name="razon_social_comercio"
            minLength="1"
            maxLength="100"
            required
            value={comercio?.razon_social_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            key="comercio_padre"
            id="comercio_padre"
            label="Comercio padre"
            type="text"
            name="comercio_padre"
            minLength="1"
            maxLength="20"
            value={
              comercio?.comercio_padre ? comercio?.comercio_padre : "Vacio"
            }
            info={
              <button
                type="button"
                style={{
                  position: "absolute",
                  top: "-33px",
                  right: "-235px",
                  fontSize: "15px",
                  padding: "5px",
                  backgroundColor: "#e26c22",
                  color: "white",
                  borderRadius: "5px",
                }}
                onClick={(e) => {
                  if (comercio?.comercio_padre) {
                    setComercio((old) => ({
                      ...old,
                      fk_comercio_padre: null,
                      comercio_padre: "",
                    }));
                  } else {
                    handleShowModal();
                  }
                }}
              >
                {comercio?.comercio_padre ? "Eliminar" : "Agregar comercio"}
              </button>
            }
            disabled
          />
          {Boolean(pk_comercio_handled) && (
            <ToggleInput
              id={`estado_edit`}
              name={`estado`}
              label={"Activo"}
              checked={comercio?.estado ?? false}
              onChange={() =>
                setComercio((old) => ({
                  ...old,
                  estado: !old?.estado,
                }))
              }
            />
          )}
          <ToggleInput
            id={`use_totp_edit`}
            name={`use_totp`}
            label={"Seguridad con OTP"}
            checked={comercio?.use_totp ?? false}
            onChange={() =>
              setComercio((old) => ({
                ...old,
                use_totp: !old?.use_totp,
              }))
            }
          />
        </Fieldset>
        <Fieldset legend="Ubicación comercio" className="lg:col-span-2">
          <Input
            id="direccion_comercio"
            label="Dirección comercio"
            type="text"
            name="direccion_comercio"
            minLength="1"
            maxLength="100"
            required
            value={comercio?.direccion_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="latitud_comercio"
            label="Latitud comercio"
            type="text"
            name="latitud_comercio"
            minLength="1"
            maxLength="12"
            required
            value={comercio?.latitud_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, latitud_comercio: num };
                });
              }
            }}
            autoComplete="off"
          />
          <Input
            id="longitud_comercio"
            label="Longitud comercio"
            type="text"
            name="longitud_comercio"
            minLength="1"
            maxLength="12"
            required
            value={comercio?.longitud_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, longitud_comercio: num };
                });
              }
            }}
            autoComplete="off"
          />
        </Fieldset>
        <Fieldset legend="Códigos Dane" className="lg:col-span-2">
          <Input
            id="dane_ciudad"
            label="Número Dane ciudad"
            type="text"
            name="dane_ciudad"
            minLength="1"
            maxLength="5"
            required
            value={comercio?.dane_ciudad}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_ciudad: num };
                });
              }
            }}
            autoComplete="off"
          />
          <Input
            id="dane_dpto"
            label="Número Dane departamento"
            type="text"
            name="dane_dpto"
            minLength="1"
            maxLength="5"
            required
            value={comercio?.dane_dpto}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_dpto: num };
                });
              }
            }}
            autoComplete="off"
          />
          <Input
            id="dane_pais"
            label="Número Dane país"
            type="text"
            name="dane_pais"
            minLength="1"
            maxLength="5"
            required
            value={comercio?.dane_pais}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_pais: num };
                });
              }
            }}
            autoComplete="off"
          />
        </Fieldset>
        <Fieldset legend="Contacto 1" className="lg:col-span-2">
          <Input
            id="nombre_contacto1_comercio"
            label="Nombre"
            type="text"
            name="nombre_contacto1_comercio"
            minLength="1"
            maxLength="100"
            required
            value={comercio?.nombre_contacto1_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="apellido_contacto1_comercio"
            label="Apellido"
            type="text"
            name="apellido_contacto1_comercio"
            minLength="1"
            maxLength="100"
            required
            value={comercio?.apellido_contacto1_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="tel_contacto1_comercio"
            label="Teléfono"
            type="text"
            name="tel_contacto1_comercio"
            minLength="1"
            maxLength="12"
            required
            value={comercio?.tel_contacto1_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, tel_contacto1_comercio: num };
                });
              }
            }}
            autoComplete="off"
          />
        </Fieldset>
        <Fieldset legend="Contacto 2" className="lg:col-span-2">
          <Input
            id="nombre_contacto2_comercio"
            label="Nombre"
            type="text"
            name="nombre_contacto2_comercio"
            minLength="1"
            maxLength="100"
            value={comercio?.nombre_contacto2_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="apellido_contacto2_comercio"
            label="Apellido"
            type="text"
            name="apellido_contacto2_comercio"
            minLength="1"
            maxLength="100"
            value={comercio?.apellido_contacto2_comercio}
            onInput={onChangeFormat}
            autoComplete="off"
          />
          <Input
            id="tel_contacto2_comercio"
            label="Teléfono"
            type="text"
            name="tel_contacto2_comercio"
            minLength="1"
            maxLength="12"
            value={comercio?.tel_contacto2_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, tel_contacto2_comercio: num };
                });
              }
            }}
            autoComplete="off"
          />
        </Fieldset>
        <Fieldset legend="Actividades económicas" className="lg:col-span-2">
          <InputSuggestions
            id="actividades_ec2"
            label={"Buscar"}
            type={"search"}
            suggestions={
              foundActivities.map(([_, val]) => {
                const foundIdx = val
                  .toLowerCase()
                  .indexOf(actividad.toLowerCase());
                if (foundIdx === -1) {
                  return <h1 className="text-xs">{val}</h1>;
                }
                return (
                  <div className="grid grid-cols-1 place-items-center px-4 py-2">
                    <h1 className="text-xs">
                      {val.substring(0, foundIdx)}
                      <strong>
                        {val.substring(foundIdx, foundIdx + actividad.length)}
                      </strong>
                      {val.substring(foundIdx + actividad.length)}
                    </h1>
                  </div>
                );
              }) || []
            }
            onSelectSuggestion={(index) => {
              const copy = structuredClone(commerceType);
              copy[foundActivities[index][0]] = foundActivities[index][1];
              setActividad("");
              setFoundActivities([]);
              setCommerceType(copy);
              setComercio((old) => ({
                ...old,
                ciiu: Object.keys(copy).sort(
                  (key1, key2) => parseInt(key1) - parseInt(key2)
                ),
              }));
            }}
            minLength="4"
            autoComplete="off"
            value={actividad}
            onInput={(e) => setActividad(e.target.value)}
            onLazyInput={{
              callback: (e) => {
                const _actividad = e.target.value;
                if (_actividad.length > 1) {
                  fetchActividades(
                    `${urlActividades}?q=${_actividad}&limit=${3}`
                  );
                } else {
                  setFoundActivities([]);
                }
              },
              timeOut: 500,
            }}
            disabled={commerceType.length > 2}
          />
          <ul className="flex flex-col gap-2">
            {Object.entries(commerceType)
              .sort(([key1], [key2]) => parseInt(key1) - parseInt(key2))
              .map(([key, el]) => (
                <li key={key} className="grid grid-cols-8">
                  <span className="bi bi-card-list" />
                  <h1 className="col-span-6">{el}</h1>
                  <span
                    onClick={() => {
                      const copy = structuredClone(commerceType);
                      delete copy[key];
                      setCommerceType(copy);
                      setComercio((old) => ({
                        ...old,
                        ciiu: Object.keys(copy).sort(
                          (key1, key2) => parseInt(key1) - parseInt(key2)
                        ),
                      }));
                    }}
                    className="bi bi-trash text-xl cursor-pointer"
                  />
                </li>
              ))}
          </ul>
        </Fieldset>
        <Fieldset legend="Códigos institucionales" className="lg:col-span-2">
          <Select
            className="place-self-stretch"
            id="selected_codigo"
            name="selected_codigo"
            label="Código institucional"
            options={vectorCodigosInstitucionales ?? []}
            onChange={(e) => {
              setSelectedCodigo((old) => ({
                ...old,
                selectedCod: e.target.value,
              }));
            }}
            value={selectedCodigo.selectedCod}
          />
          <Button type="button" onClick={seleccionarCodigoIns}>
            Agregar código institucional
          </Button>
          <Fieldset
            legend="Códigos institucionales existentes"
            className="lg:col-span-2"
          >
            {Object.keys(comercio?.codigos_institucionales)?.length > 0 ? (
              Object.keys(comercio?.codigos_institucionales).map(
                (key, index) => {
                  return (
                    <Input
                      key={index}
                      id={`${key}_${index}`}
                      label={`${key}`}
                      type="text"
                      name={`${key}_${index}`}
                      minLength="1"
                      maxLength="20"
                      required
                      autoComplete="off"
                      value={comercio?.codigos_institucionales[key]}
                      info={
                        <button
                          type="button"
                          style={{
                            position: "absolute",
                            top: "-33px",
                            right: "-235px",
                            fontSize: "15px",
                            padding: "5px",
                            backgroundColor: "#e26c22",
                            color: "white",
                            borderRadius: "5px",
                          }}
                          onClick={() => {
                            const rest = {
                              ...comercio?.codigos_institucionales,
                            };
                            delete rest[key];
                            setComercio((old) => {
                              return {
                                ...old,
                                codigos_institucionales: rest,
                              };
                            });
                          }}
                        >
                          Eliminar
                        </button>
                      }
                      onInput={(e) => {
                        setComercio((old) => {
                          return {
                            ...old,
                            codigos_institucionales: {
                              ...old.codigos_institucionales,
                              [key]: e.target.value,
                            },
                          };
                        });
                      }}
                    />
                  );
                }
              )
            ) : (
              <h1>No hay códigos institucionales asociados al comercio</h1>
            )}
          </Fieldset>
        </Fieldset>
        <Fieldset legend="Contratos comisiones" className="lg:col-span-2">
          <Input
            id="check_contrato"
            name="contrato"
            label={"Contrato"}
            className="pointer-events-none"
            type="text"
            autoComplete="off"
            value={comercio?.nombre_contrato ?? ""}
            title={comercio?.nombre_contrato ?? "Vacio"}
            onChange={() => {}}
            actionBtn={{
              callback: (_) => {
                if (comercio?.fk_id_tipo_contrato) {
                  setComercio((old) => ({
                    ...old,
                    fk_id_tipo_contrato: null,
                    nombre_contrato: "",
                  }));
                  return;
                }
                setChooseContrato(true);
              },
              label: comercio?.fk_id_tipo_contrato ? "Eliminar" : "Agregar",
            }}
            required
          />
          <Select
            id="Pago comision"
            name="Pago comision"
            label="Pago comisión cada:"
            options={{
              "": "",
              Transacción: "Transaccion",
              Mensual: "Mensual",
              Directo: "Directo",
            }}
            value={comercio?.tipo_pago_comision}
            onChange={(ev) =>
              setComercio((old) => ({
                ...old,
                tipo_pago_comision: ev.target.value,
              }))
            }
            required
          />
        </Fieldset>
        <Fieldset legend="Parametrización alerta cupo" className="lg:col-span-2">
          <MoneyInput
            key="configuración_monto"
            name="configuración_monto"
            label="Configuración por monto"
            onChange={handleChangeCurrenci}
            placeholder="$0"
            maxLength={13}
            value={alertMonto}
            autoComplete='off'
            equalErrorMin = {false}
            disabled={alertPorcent !== ''? true : false}
          />
          <Input
            key="configuración_porcentual"
            name="configuración_porcentual"
            label="Configuración porcentual"
            onChange={handleChangeCurrenci}
            type="text"
            value={alertPorcent + '%'}
            placeholder="Ingrese el porcentaje"
            autoComplete='off'
            disabled={alertMonto !== '' && alertMonto !== 0 ? true : false}
          />
        </Fieldset>
        <Fieldset legend="Dispersión de pagos" className="lg:col-span-2">
           <Select
            id="derechos_locales"
            name="derechos_locales"
            label="Derechos locales"
            options={{
              "": "",
              Davivienda: 13,
              "Grupo Aval": 17,
              Colpatria: 14,
              "Banco Agrario": 16
            }}
            value={dispersionPagos?.autorizador_local}
            onChange={(ev) =>
              setDispersionPagos((old) => {
                return {
                ...old,
                autorizador_local: ev.target.value !== "" ? parseInt(ev.target.value) : ev.target.value,
              }})
            }
          />
          <Input
            key="convenio_local"
            name="convenio_local"
            label="Convenio local"
            onChange={handleChangeDispersionPagos}
            type="text"
            minLength="1"
            maxLength="13"
            value={dispersionPagos?.convenio_local}
            placeholder="Ingrese el convenio"
            autoComplete='off'
          />
           <Select
            id="derechos_runt"
            name="derechos_runt"
            label="Derechos RUNT"
            options={{
              "": "",
              Davivienda: 13,
              "Grupo Aval": 17,
              Colpatria: 14,
              "Banco Agrario": 16
            }}
            value={dispersionPagos?.autorizador_runt}
            onChange={(ev) =>
              setDispersionPagos((old) => {
                return {
                ...old,
                autorizador_runt: ev.target.value !== "" ? parseInt(ev.target.value) : ev.target.value,
                trx_unica_runt_mt: false
              }})
            }
            disabled={dispersionPagos?.convenio_runt_mt !== '' || dispersionPagos?.autorizador_runt_mt !== '' ? true : false}
          />
          <Input
            key="convenio_runt"
            name="convenio_runt"
            label="Convenio RUNT"
            onChange={handleChangeDispersionPagos}
            type="text"
            minLength="1"
            maxLength="13"
            value={dispersionPagos?.convenio_runt}
            placeholder="Ingrese el convenio"
            autoComplete='off'
            disabled={dispersionPagos?.convenio_runt_mt !== '' || dispersionPagos?.autorizador_runt_mt !== '' ? true : false}
          />
           <Select
            id="derechos_mt"
            name="derechos_mt"
            label="Derechos MT"
            options={{
              "": "",
              Davivienda: 13,
              "Grupo Aval": 17,
              Colpatria: 14,
              "Banco Agrario": 16
            }}
            value={dispersionPagos?.autorizador_mt}
            onChange={(ev) =>
              setDispersionPagos((old) => {
                return {
                ...old,
                autorizador_mt: ev.target.value !== "" ? parseInt(ev.target.value) : ev.target.value,
                trx_unica_runt_mt: false
              }})
            }
            disabled={dispersionPagos?.convenio_runt_mt !== '' || dispersionPagos?.autorizador_runt_mt !== '' ? true : false}
          />
          <Input
            key="convenio_mt"
            name="convenio_mt"
            label="Convenio MT"
            onChange={handleChangeDispersionPagos}
            type="text"
            minLength="1"
            maxLength="13"
            value={dispersionPagos?.convenio_mt}
            placeholder="Ingrese el convenio"
            autoComplete='off'
            disabled={dispersionPagos?.convenio_runt_mt !== '' || dispersionPagos?.autorizador_runt_mt !== '' ? true : false}
          />
          <Select
            id="derechos_runt_mt"
            name="derechos_runt_mt"
            label="Derechos RUNT y MT"
            options={{
              "": "",
              Davivienda: 13,
              "Grupo Aval": 17,
              Colpatria: 14,
              "Banco Agrario": 16
            }}
            value={dispersionPagos?.autorizador_runt_mt}
            onChange={(ev) =>
              setDispersionPagos((old) => {
                return {
                ...old,
                autorizador_runt_mt: ev.target.value !== "" ? parseInt(ev.target.value) : ev.target.value,
                trx_unica_runt_mt: true
              }})
            }
            disabled={
              dispersionPagos?.convenio_runt !== '' || 
              dispersionPagos?.autorizador_runt !== '' ||
              dispersionPagos?.convenio_mt !== '' || 
              dispersionPagos?.autorizador_mt !== '' ? 
              true : false}
          />
          <Input
            key="convenio_runt_mt"
            name="convenio_runt_mt"
            label="Convenio RUNT y MT"
            onChange={handleChangeDispersionPagos}
            type="text"
            minLength="1"
            maxLength="13"
            value={dispersionPagos?.convenio_runt_mt}
            placeholder="Ingrese el convenio"
            autoComplete='off'
            disabled={
              dispersionPagos?.convenio_runt !== '' || 
              dispersionPagos?.autorizador_runt !== '' ||
              dispersionPagos?.convenio_mt !== '' || 
              dispersionPagos?.autorizador_mt !== '' ? 
              true : false}
          />
        </Fieldset>
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">
            {pk_comercio_handled ? "Actualizar comercio" : "Crear comercio"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <CommerceTable 
          onSelectComerce={onSelectComercios} />
      </Modal>
      <Modal show={chooseContrato} handleClose={() => setChooseContrato(false)}>
        <TiposContratosTable onSelectContract={onSelectTipoContrato} />
      </Modal>
    </Fragment>
  );
};

export default CrearComercios;
