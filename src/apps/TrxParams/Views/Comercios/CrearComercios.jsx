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
} from "../../utils/fetchComercios";
import useFetchDebounce from "../../../../hooks/useFetchDebounce";
import useFetchDispatchDebounce from "../../../../hooks/useFetchDispatchDebounce";
import CommerceTable from "../../components/Commerce/CommerceTable";
import InputSuggestions from "../../../../components/Base/InputSuggestions/InputSuggestions";
import ToggleInput from "../../../../components/Base/ToggleInput/ToggleInput";
import { useAuth } from "../../../../hooks/AuthHooks";

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

// const urlComercios = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
const urlComercios = `http://localhost:5000`;
const urlParametrizacion =
  process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS;
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
};

const CrearComercios = () => {
  const { pdpUser } = useAuth();
  const { pk_comercio } = useParams();

  const [comercio, setComercio] = useState(emptyCommerce);
  // const [selectedCommerce, setSelectedCommerce] = useState(emptyCommerce);
  const [docTypes, setDocTypes] = useState({ "": "" });

  const [commerceType, setCommerceType] = useState({});
  const [actividad, setActividad] = useState("");
  const [foundActivities, setFoundActivities] = useState([]);

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
            res?.obj?.map(({ id_doc, Nombre, nombre_corto }) => ({
              value: id_doc,
              label: `${Nombre} (${nombre_corto})`,
            })) ?? []
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
      delete dataOrg["descripcion_tipo_nivel"];
      delete dataOrg["fecha_actualizacion"];
      delete dataOrg["fecha_registro"];
      delete dataOrg["nombre_grupo_comercios"];
      delete dataOrg["ciiu_list"];
      if (!dataOrg.fk_comercio_padre) delete dataOrg["fk_comercio_padre"];
      if (!dataOrg.pk_comercio) delete dataOrg["pk_comercio"];
      if (pk_comercio_handled) {
        console.log("Enters", dataOrg);
        // const dataOrg = Object.keys(comercio).map((obj, i) => {
        //   if (obj !== "" || obj) {
        //     return { [obj]: comercio[obj] };
        //   }
        // });
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
    },
    [comercio, pk_comercio_handled, navigate]
  );

  if (pk_comercio_handled === -1) {
    <Navigate to={"/params-operations/comercios-params/comercios"} replace />;
  }

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className="text-3xl text-center">
        {pk_comercio_handled ? "Actualizar comercio" : "Crear comercio"}
      </h1>
      <Form grid onSubmit={onSubmit}>
        <Fieldset
          legend="Información general comercio"
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
          {/* <Select
            className='place-self-stretch'
            id='fk_tipo_nivel'
            name='fk_tipo_nivel'
            label='Tipo nivel'
            required={true}
            options={tipoNivelComercio ?? []}
            onChange={onChangeFormat}
            value={comercio?.fk_tipo_nivel}
          /> */}
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
            label="Telefono fijo"
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
          {pk_comercio_handled && (
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
            label="Número Dane pais"
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
            label="Telefono"
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
            label="Telefono"
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
        <Fieldset legend="Actividades economicas" className="lg:col-span-2">
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
        <ButtonBar className="lg:col-span-2">
          <Button type="submit">
            {pk_comercio_handled ? "Actualizar comercio" : "Crear comercio"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <CommerceTable onSelectComerce={onSelectComercios} />
      </Modal>
    </Fragment>
  );
};

export default CrearComercios;
