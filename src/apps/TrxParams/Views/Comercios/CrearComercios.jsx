import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import useQuery from "../../../../hooks/useQuery";
import fetchData from "../../../../utils/fetchData";
import { notify, notifyError } from "../../../../utils/notify";
import {
  postConsultaComercio,
  postConsultaTipoNivelComercio,
  postCrearComercio,
  putModificarComercio,
} from "../../utils/fetchComercios";
import {
  fetchParametrosAutorizadores,
  postParametrosAutorizadores,
  putParametrosAutorizadores,
} from "../../utils/fetchParametrosAutorizadores";
const url_types = process.env.REACT_APP_URL_SERVICE_COMMERCE;
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

const CrearComercios = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [
    { searchComercio, searchPkComercio, openComercios },
    setComerciosConsulta,
  ] = useState({
    searchComercio: "",
    searchPkComercio: "",
    openComercios: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [comercios, setComercios] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState({
    selectedCod: "",
    codigosInst: [],
  });
  const [tipoNivelComercio, setTipoNivelComercio] = useState([]);

  const [docTypes, setDocTypes] = useState({ "": "" });
  const [docTypesContact, setDocTypesContact] = useState({ "": "" });
  const [comercio, setComercio] = useState({
    apellido_contacto1_comercio: "",
    apellido_contacto2_comercio: "",
    codigos_institucionales: {},
    comercio_padre: "",
    credito_comercio: "",
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
    fk_tipo_nivel: "",
    latitud_comercio: "",
    longitud_comercio: "",
    nombre_comercio: "",
    nombre_contacto1_comercio: "",
    documento_contacto1_comercio: "",
    tipo_documento_contacto1_comercio: "",
    nombre_contacto2_comercio: "",
    documento_contacto2_comercio: "",
    tipo_documento_contacto2_comercio: "",
    numero_identificacion: "",
    obtener_mejor_tarifa: "",
    pk_comercio: "",
    razon_social_comercio: "",
    tel_contacto1_comercio: "",
    tel_contacto2_comercio: "",
    telefono_fijo_comercio: "",
  });
  const tableComercios = useMemo(() => {
    return [
      ...comercios.map(
        ({
          comercio_padre,
          nombre_comercio,
          numero_identificacion,
          pk_comercio,
        }) => {
          return {
            Id: pk_comercio,
            Comercio: nombre_comercio,
            Documento: numero_identificacion,
            "Comercio padre": comercio_padre ?? "Vacio",
          };
        }
      ),
    ];
  }, [comercios]);
  const onChange = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const comercio = formData.get("searchComercio");
    const pkComercio = formData.get("searchPkComercio");
    setComerciosConsulta((old) => ({
      ...old,
      searchPkComercio: pkComercio,
      searchComercio: comercio,
    }));
  }, []);
  useEffect(() => {
    if (openComercios) {
      fetchComerciosFuncPage();
    }
  }, [page, limit, searchComercio, searchPkComercio, openComercios]);
  const fetchComerciosFuncPage = useCallback(() => {
    let obj = {};
    if (parseInt(searchPkComercio))
      obj["co1.pk_comercio"] = parseInt(searchPkComercio);
    if (searchComercio) obj["co1.nombre_comercio"] = searchComercio;
    postConsultaComercio({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, searchComercio, searchPkComercio]);
  const onSelectComercios = useCallback(
    (e, i) => {
      setComercio((old) => {
        return {
          ...old,
          fk_comercio_padre: tableComercios[i]["Id"],
          comercio_padre: tableComercios[i]["Comercio"],
        };
      });
      handleClose();
      // id?tableComercios[i]["Id"]
    },
    [tableComercios, comercio]
  );
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setComerciosConsulta((old) => ({ ...old, openComercios: true }));
  }, []);
  useEffect(() => {
    if (state?.id) {
      fetchComerciosFunc();
    }
    fetchTipoNivelComerciosFunc();
    fetchData(`${url_types}/type-doc`, "GET", {}, {})
      .then((res) => {
        const temp = { "": "" };
        const tempContact = { "": "" };
        if (res?.status) {
          for (const { id_doc, Nombre, nombre_corto } of res?.obj) {
            temp[`${Nombre} (${nombre_corto})`] = id_doc;
            tempContact[`${Nombre} (${nombre_corto})`] = nombre_corto;
          }
          setDocTypes(temp);
          setDocTypesContact(tempContact);
        } else {
          notifyError(res?.msg);
        }
      })
      .catch(() => {});
  }, [state?.id]);
  const fetchTipoNivelComerciosFunc = useCallback(() => {
    let obj = {};
    postConsultaTipoNivelComercio({ ...obj })
      .then((autoArr) => {
        const temp = { "": "" };
        for (const { pk_tipo_nivel, descripcion } of autoArr?.results ?? []) {
          temp[`${descripcion}`] = pk_tipo_nivel;
        }
        setTipoNivelComercio(temp);
      })
      .catch((err) => console.error(err));
  }, []);
  const fetchComerciosFunc = useCallback(() => {
    let obj = { "co1.pk_comercio": state?.id };
    postConsultaComercio({ ...obj })
      .then((autoArr) => {
        console.log(autoArr?.results[0]);
        setComercio(
          { ...autoArr?.results[0] } ?? {
            apellido_contacto1_comercio: "",
            apellido_contacto2_comercio: "",
            codigos_institucionales: "",
            comercio_padre: "",
            credito_comercio: "",
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
            fk_tipo_nivel: "",
            latitud_comercio: "",
            longitud_comercio: "",
            nombre_comercio: "",
            nombre_contacto1_comercio: "",
            documento_contacto1_comercio: "",
            tipo_documento_contacto1_comercio: "",
            nombre_contacto2_comercio: "",
            documento_contacto2_comercio: "",
            tipo_documento_contacto2_comercio: "",
            numero_identificacion: "",
            obtener_mejor_tarifa: "",
            pk_comercio: "",
            razon_social_comercio: "",
            tel_contacto1_comercio: "",
            tel_contacto2_comercio: "",
            telefono_fijo_comercio: "",
          }
        );
      })
      .catch((err) => console.error(err));
  }, [state]);
  const onChangeFormat = useCallback((ev) => {
    setComercio((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
    });
  }, []);
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
      setIsUploading(true);
      // if (selectedParam?.nombre_autorizador === "") {
      //   notifyError("Se debe agregar el autorizador");
      //   return;
      // }
      // if (selectedParam?.nombre_parametro === "") {
      //   notifyError("Se debe agregar el nombre del parametro");
      //   return;
      // }
      // if (selectedParam?.valor_parametro === "") {
      //   notifyError("Se debe agregar el valor del parametro");
      //   return;
      // }
      const dataOrg = { ...comercio };
      delete dataOrg["comercio_padre"];
      delete dataOrg["descripcion_tipo_nivel"];
      delete dataOrg["fecha_actualizacion"];
      delete dataOrg["fecha_registro"];
      if (!dataOrg.fk_comercio_padre) delete dataOrg["fk_comercio_padre"];
      if (!dataOrg.pk_comercio) delete dataOrg["pk_comercio"];
      if (!dataOrg.credito_comercio) delete dataOrg["credito_comercio"];
      if (state?.id) {
        // const dataOrg = Object.keys(comercio).map((obj, i) => {
        //   if (obj !== "" || obj) {
        //     return { [obj]: comercio[obj] };
        //   }
        // });
        delete dataOrg["pk_comercio"];
        putModificarComercio(state?.id, {
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
      } else {
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
    [comercio, handleClose, state, navigate]
  );

  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        {state?.id ? "Actualizar comercio" : "Crear comercio"}
      </h1>
      <Form grid onSubmit={onSubmit}>
        <Fieldset
          legend='Información general comercio'
          className='lg:col-span-2'>
          {!state?.id && (
            <Input
              id='pk_comercio'
              label='Id comercio(Opcional)'
              type='text'
              name='pk_comercio'
              minLength='1'
              maxLength='32'
              value={comercio?.pk_comercio}
              onInput={onChangeFormat}></Input>
          )}
          <Input
            id='nombre_comercio'
            label='Nombre comercio'
            type='text'
            name='nombre_comercio'
            minLength='1'
            maxLength='50'
            required
            value={comercio?.nombre_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='email_comercio'
            label='Email comercio'
            type='email'
            name='email_comercio'
            minLength='1'
            maxLength='50'
            required
            value={comercio?.email_comercio}
            onInput={onChangeFormat}></Input>
          <Select
            className='place-self-stretch'
            id='fk_tipo_identificacion'
            name='fk_tipo_identificacion'
            label='Tipo de documento'
            required={true}
            options={docTypes ?? []}
            onChange={onChangeFormat}
            value={comercio?.fk_tipo_identificacion}
          />
          <Input
            id='numero_identificacion'
            label='Número de identificación'
            type='text'
            name='numero_identificacion'
            minLength='1'
            maxLength='12'
            required
            value={comercio?.numero_identificacion}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, numero_identificacion: num };
                });
              }
            }}></Input>
          <Select
            className='place-self-stretch'
            id='fk_tipo_nivel'
            name='fk_tipo_nivel'
            label='Tipo nivel'
            required={true}
            options={tipoNivelComercio ?? []}
            onChange={onChangeFormat}
            value={comercio?.fk_tipo_nivel}
          />
          <Input
            id='telefono_fijo_comercio'
            label='Telefono fijo'
            type='text'
            name='telefono_fijo_comercio'
            minLength='1'
            maxLength='12'
            required
            value={comercio?.telefono_fijo_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, telefono_fijo_comercio: num };
                });
              }
            }}></Input>
          <Input
            id='razon_social_comercio'
            label='Razón social'
            type='text'
            name='razon_social_comercio'
            minLength='1'
            maxLength='100'
            required
            value={comercio?.razon_social_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            key='comercio_padre'
            id='comercio_padre'
            label='Comercio padre'
            type='text'
            name='comercio_padre'
            minLength='1'
            maxLength='20'
            value={
              comercio?.comercio_padre ? comercio?.comercio_padre : "Vacio"
            }
            info={
              <button
                type='button'
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
                }}>
                {comercio?.comercio_padre ? "Eliminar" : "Agregar comercio"}
              </button>
            }
            disabled></Input>
        </Fieldset>

        <Fieldset legend='Ubicación comercio' className='lg:col-span-2'>
          <Input
            id='direccion_comercio'
            label='Dirección comercio'
            type='text'
            name='direccion_comercio'
            minLength='1'
            maxLength='100'
            required
            value={comercio?.direccion_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='latitud_comercio'
            label='Latitud comercio'
            type='text'
            name='latitud_comercio'
            minLength='1'
            maxLength='12'
            required
            value={comercio?.latitud_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, latitud_comercio: num };
                });
              }
            }}></Input>
          <Input
            id='longitud_comercio'
            label='Longitud comercio'
            type='text'
            name='longitud_comercio'
            minLength='1'
            maxLength='12'
            required
            value={comercio?.longitud_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, longitud_comercio: num };
                });
              }
            }}></Input>
        </Fieldset>
        <Fieldset legend='Códigos Dane' className='lg:col-span-2'>
          <Input
            id='dane_ciudad'
            label='Número Dane ciudad'
            type='text'
            name='dane_ciudad'
            minLength='1'
            maxLength='5'
            required
            value={comercio?.dane_ciudad}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_ciudad: num };
                });
              }
            }}></Input>
          <Input
            id='dane_dpto'
            label='Número Dane departamento'
            type='text'
            name='dane_dpto'
            minLength='1'
            maxLength='5'
            required
            value={comercio?.dane_dpto}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_dpto: num };
                });
              }
            }}></Input>
          <Input
            id='dane_pais'
            label='Número Dane pais'
            type='text'
            name='dane_pais'
            minLength='1'
            maxLength='5'
            required
            value={comercio?.dane_pais}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, dane_pais: num };
                });
              }
            }}></Input>
        </Fieldset>

        <MoneyInput
          id='credito_comercio'
          name='credito_comercio'
          label='Credito comercio'
          type='text'
          autoComplete='off'
          maxLength={"15"}
          value={comercio.credito_comercio ?? ""}
          onInput={(e, valor) => {
            if (!isNaN(valor)) {
              const num = valor;
              setComercio((old) => {
                return { ...old, credito_comercio: num };
              });
            }
          }}
          required></MoneyInput>

        <Fieldset legend='Contacto 1' className='lg:col-span-2'>
          <Input
            id='nombre_contacto1_comercio'
            label='Nombre'
            type='text'
            name='nombre_contacto1_comercio'
            minLength='1'
            maxLength='100'
            required
            value={comercio?.nombre_contacto1_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='apellido_contacto1_comercio'
            label='Apellido'
            type='text'
            name='apellido_contacto1_comercio'
            minLength='1'
            maxLength='100'
            required
            value={comercio?.apellido_contacto1_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='tel_contacto1_comercio'
            label='Telefono'
            type='text'
            name='tel_contacto1_comercio'
            minLength='1'
            maxLength='12'
            required
            value={comercio?.tel_contacto1_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, tel_contacto1_comercio: num };
                });
              }
            }}></Input>
          <Select
            className='place-self-stretch'
            id='tipo_documento_contacto1_comercio'
            name='tipo_documento_contacto1_comercio'
            label='Tipo de documento'
            required={true}
            options={docTypesContact ?? []}
            onChange={onChangeFormat}
            value={comercio?.tipo_documento_contacto1_comercio}
          />
          <Input
            id='documento_contacto1_comercio'
            label='Documento'
            type='text'
            name='documento_contacto1_comercio'
            minLength='1'
            maxLength='18'
            required
            value={comercio?.documento_contacto1_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, documento_contacto1_comercio: num };
                });
              }
            }}></Input>
        </Fieldset>
        <Fieldset legend='Contacto 2' className='lg:col-span-2'>
          <Input
            id='nombre_contacto2_comercio'
            label='Nombre'
            type='text'
            name='nombre_contacto2_comercio'
            minLength='1'
            maxLength='100'
            value={comercio?.nombre_contacto2_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='apellido_contacto2_comercio'
            label='Apellido'
            type='text'
            name='apellido_contacto2_comercio'
            minLength='1'
            maxLength='100'
            value={comercio?.apellido_contacto2_comercio}
            onInput={onChangeFormat}></Input>
          <Input
            id='tel_contacto2_comercio'
            label='Telefono'
            type='text'
            name='tel_contacto2_comercio'
            minLength='1'
            maxLength='12'
            value={comercio?.tel_contacto2_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, tel_contacto2_comercio: num };
                });
              }
            }}></Input>
          <Select
            className='place-self-stretch'
            id='tipo_documento_contacto2_comercio'
            name='tipo_documento_contacto2_comercio'
            label='Tipo de documento'
            options={docTypesContact ?? []}
            onChange={onChangeFormat}
            value={comercio?.tipo_documento_contacto2_comercio}
          />
          <Input
            id='documento_contacto1_comercio'
            label='Documento'
            type='text'
            name='documento_contacto2_comercio'
            minLength='1'
            maxLength='18'
            value={comercio?.documento_contacto2_comercio}
            onInput={(e) => {
              const num = e.target.value;
              if (!isNaN(num)) {
                setComercio((old) => {
                  return { ...old, documento_contacto2_comercio: num };
                });
              }
            }}></Input>
        </Fieldset>
        <Fieldset legend='Códigos institucionales' className='lg:col-span-2'>
          <Select
            className='place-self-stretch'
            id='selected_codigo'
            name='selected_codigo'
            label='Código institucional'
            options={vectorCodigosInstitucionales ?? []}
            onChange={(e) => {
              setSelectedCodigo((old) => ({
                ...old,
                selectedCod: e.target.value,
              }));
            }}
            value={selectedCodigo.selectedCod}
          />
          <Button type='button' onClick={seleccionarCodigoIns}>
            Agregar código institucional
          </Button>
          <Fieldset
            legend='Códigos institucionales existentes'
            className='lg:col-span-2'>
            {Object.keys(comercio?.codigos_institucionales)?.length > 0 ? (
              Object.keys(comercio?.codigos_institucionales).map(
                (key, index) => {
                  return (
                    <Input
                      key={index}
                      id={`${key}_${index}`}
                      label={`${key}`}
                      type='text'
                      name={`${key}_${index}`}
                      minLength='1'
                      maxLength='20'
                      required
                      value={comercio?.codigos_institucionales[key]}
                      info={
                        <button
                          type='button'
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
                          }}>
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
                      }}></Input>
                  );
                }
              )
            ) : (
              <h1>No hay códigos institucionales asociados al comercio</h1>
            )}
          </Fieldset>
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>
            {state?.id ? "Actualizar comercio" : "Crear comercio"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={handleClose}>
        <TableEnterprise
          title='Comercios'
          maxPage={maxPages}
          headers={["Id", "Comercio", "Documento", "Comercio padre"]}
          data={tableComercios}
          onSelectRow={onSelectComercios}
          onSetPageData={setPageData}
          onChange={onChange}>
          <Input
            id='searchPkComercio'
            name='searchPkComercio'
            label={"Id comercio"}
            type='number'
            autoComplete='off'
            defaultValue={searchPkComercio}
          />
          <Input
            id='searchComercio'
            name='searchComercio'
            label={"Nombre comercio"}
            type='text'
            autoComplete='off'
            defaultValue={searchComercio}
          />
        </TableEnterprise>
      </Modal>
    </>
  );
};

export default CrearComercios;
