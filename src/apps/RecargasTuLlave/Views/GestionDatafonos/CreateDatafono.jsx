import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notifyPending,notifyError } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchTuLlave";
import TextArea from "../../../../components/Base/TextArea/TextArea";
// import Select from "../../../../components/Base/Select/Select";
import Form from "../../../../components/Base/Form/Form";
import ConsultaComerciosDatafonos from "../../components/ConsultaComerciosDatafonos/ConsultaComerciosDatafonos";
import { useAuth } from "../../../../hooks/AuthHooks";

const URL_CONSULTAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/consultar`;
const URL_EDITAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/actualizar`;
const URL_CREAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/crear`;
const URL_CONSULTA_INVENTARIO = `${process.env.REACT_APP_URL_INVENTARIO}/consultar_datafono_unique`;
const URL_EDITAR_INVENTARIO = `${process.env.REACT_APP_URL_INVENTARIO}/editar_datafono`;
// const URL_EDITAR_INVENTARIO = `http://127.0.0.1:8000/tullave-gestion-datafonos/editar_datafono`;

const CreateDatafono = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { userInfo } = useAuth();
  const [dataDatafono, setDataDatafono] = useState({
    comentarios: "",
    fecha_creacion: null,
    fecha_modificacion: null,
    fk_comercio_asociado: "",
    name_comercio:"",
    pk_tullave_datafonos: "",
    pos_id: "",
  });
  const [selectedOpt, setSelectedOpt] = useState("");

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const createDatafono = useCallback(
    (ev) => {
      ev.preventDefault();
      if (params?.id) {
        peticionConsultaInventario({pos_id: dataDatafono?.pos_id})
          .then((res) => {
            var dataDatafonoInventario = res?.obj?.results[0]
            const dataInventario = {
              pos_id: dataDatafonoInventario.pos_id,
              tipo_dispositivo: dataDatafonoInventario.tipo_dispositivo,
              numero_serie: dataDatafonoInventario.numero_serie,
              tarjeta_lsam: dataDatafonoInventario.tarjeta_lsam,
              tarjeta_sim: dataDatafonoInventario.tarjeta_sim,
              hardware_id: dataDatafonoInventario.hardware_id,
              comentarios: dataDatafonoInventario.comentarios,
              estado: dataDatafonoInventario.estado,
              user_name: userInfo?.attributes?.name,
              id_comercio: dataDatafono?.fk_comercio_asociado,
              name_comercio: dataDatafono?.name_comercio,
            }
            peticionActualizacionInventario({ pk_datafonos_tullave: dataDatafonoInventario.pk_datafonos_tullave },dataInventario)
              .then((res) => {
                if (res?.msg === "Datafono Creado") {
                  const data = {
                    pk_tullave_datafonos: params?.id,
                    comentarios: dataDatafono?.comentarios,
                  };
                  if (dataDatafono?.fk_comercio_asociado) {
                    data["fk_comercio_asociado"] = dataDatafono?.fk_comercio_asociado;
                  }
                  notifyPending(
                    peticionActualizacionDatafono({ pk_tullave_datafonos: "" }, data),
                    {
                      render: () => {
                        return "Procesando actualización";
                      },
                    },
                    {
                      render: ({ data: res }) => {
                        navigate(-1);
                        return "Actualización satisfactoria";
                      },
                    },
                    {
                      render: ({ data: error }) => {
                        return error?.message ?? "Actualización fallida";
                      },
                    }
                  );
                }
              })
              .catch((err) => {
                if (err?.cause === "custom") {
                  notifyError(err?.message);
                  return;
                }
                console.error(err?.message);
                notifyError("Peticion fallida");
              });
          })
          .catch((err) => {
            if (err?.cause === "custom") {
              notifyError(err?.message);
              return;
            }
            console.error(err?.message);
            notifyError("Peticion fallida");
          });
      } else {
        peticionConsultaInventario({pos_id: dataDatafono?.pos_id})
          .then((res) => {
            var dataDatafonoInventario = res?.obj?.results[0]
            if (res?.obj?.results.length !== 0) {
              if (dataDatafono?.fk_comercio_asociado !== "") {
                const data = {
                  pos_id: dataDatafono?.pos_id,
                  comentarios: dataDatafono?.comentarios,
                  estado: true,
                };
                if (dataDatafono?.fk_comercio_asociado) {
                  data["fk_comercio_asociado"] = dataDatafono?.fk_comercio_asociado;
                }
                const dataInventario = {
                  pos_id: dataDatafonoInventario.pos_id,
                  tipo_dispositivo: dataDatafonoInventario.tipo_dispositivo,
                  numero_serie: dataDatafonoInventario.numero_serie,
                  tarjeta_lsam: dataDatafonoInventario.tarjeta_lsam,
                  tarjeta_sim: dataDatafonoInventario.tarjeta_sim,
                  hardware_id: dataDatafonoInventario.hardware_id,
                  comentarios: dataDatafonoInventario.comentarios,
                  estado: dataDatafonoInventario.estado,
                  user_name: userInfo?.attributes?.name,
                  id_comercio: dataDatafono?.fk_comercio_asociado,
                  name_comercio: dataDatafono?.name_comercio,
                }
                peticionActualizacionInventario({ pk_datafonos_tullave: dataDatafonoInventario.pk_datafonos_tullave },dataInventario)
                  .then((res) => {
                    if (res?.msg === "Datafono Creado") {
                      notifyPending(
                        peticionCreacionDatafono({}, data),
                        {
                          render: () => {
                            return "Procesando creación";
                          },
                        },
                        {
                          render: ({ data: res }) => {
                            navigate(-1);
                            return "Datáfono creado";
                          },
                        },
                        {
                          render: ({ data: error }) => {
                            return error?.message ?? "Creación fallida";
                          },
                        }
                      );
                    }
                  })
                  .catch((err) => {
                    if (err?.cause === "custom") {
                      notifyError(err?.message);
                      return;
                    }
                    console.error(err?.message);
                    notifyError("Peticion fallida");
                  });
              }else {
                notifyError("Seleccione Comercio asociado");
              }
            }else{
              notifyError("POS ID no se encuentra en el inventario de datáfonos");
            }
          })
          .catch((err) => {
            if (err?.cause === "custom") {
              notifyError(err?.message);
              return;
            }
            console.error(err?.message);
            notifyError("Peticion fallida");
          });
      }
    },
    [params?.id, dataDatafono, navigate]
  );
  const [loadingPeticionConsultaDatafono, peticionConsultaDatafono] = useFetch(
    fetchCustom(URL_CONSULTAR_DATAFONO, "GET", "Consultar datáfono")
  );
  const [loadingPeticionActualizacionDatafono, peticionActualizacionDatafono] =
    useFetch(fetchCustom(URL_EDITAR_DATAFONO, "PUT", "Editar datáfono"));
  const [loadingPeticionCreacionDatafono, peticionCreacionDatafono] = useFetch(
    fetchCustom(URL_CREAR_DATAFONO, "POST", "Crear datáfono")
  );
  const [loadingPeticionConsultaInventario, peticionConsultaInventario] = useFetch(
    fetchCustom(URL_CONSULTA_INVENTARIO, "GET", "Consultar datáfono inventario")
  );
  const [loadingPeticionActualizacionInventario, peticionActualizacionInventario] = useFetch(
    fetchCustom(URL_EDITAR_INVENTARIO, "PUT", "Actualizacion datáfono inventario")
  );
  useEffect(() => {
    fetchDatafonosFunc();
  }, [params.id]);
  const fetchDatafonosFunc = () => {
    if (params.id) {
      const data = {
        pk_tullave_datafonos: params.id,
      };
      notifyPending(
        peticionConsultaDatafono(data, {}),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setDataDatafono(
              res?.obj?.results[0] ?? {
                comentarios: "",
                fecha_creacion: null,
                fecha_modificacion: null,
                fk_comercio_asociado: "",
                name_comercio:"",
                pk_tullave_datafonos: "",
                pos_id: "",
              }
            );
            return "Consulta satisfactoria";
          },
        },
        {
          render: ({ data: error }) => {
            return error?.message ?? "Consulta fallida";
          },
        }
      );
    }
  };
  const handleShow = useCallback(
    (data) => (ev) => {
      ev.preventDefault();
      setSelectedOpt(data);
      setShowModal(true);
    },
    []
  );
  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    let num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataDatafono((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataDatafono((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  return (
    <>
      <h1 className='text-3xl'>
        {params?.id
          ? "Actualizar Datáfono tuLlave"
          : "Asociar Datáfono tullave"}
      </h1>
      <Form onSubmit={createDatafono} grid>
        <Fieldset legend='Datos obligatorios' className='lg:col-span-2'>
          <Input
            id='pos_id'
            name='pos_id'
            label={"Pos Id"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["pos_id"]}
            maxLength={10}
            minLength={10}
            onChange={onChangeFormatNumber}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              params?.id ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono ||
              loadingPeticionConsultaInventario ||
              loadingPeticionActualizacionInventario
            }
          />
        </Fieldset>
        <Fieldset legend='Comercio asociado' className='lg:col-span-2'>
          <Input
            id='fk_comercio_asociado'
            name='fk_comercio_asociado'
            label={"Comercio asociado"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.fk_comercio_asociado ?? "No asociado"}
            onChange={() => {}}
            disabled
          />
          <ButtonBar>
            <Button
              type='button'
              onClick={handleShow("comercio")}
              disabled={
                loadingPeticionConsultaDatafono ||
                loadingPeticionActualizacionDatafono ||
                loadingPeticionCreacionDatafono||
                loadingPeticionConsultaInventario||
                loadingPeticionActualizacionInventario
              }>
              {dataDatafono?.fk_comercio_asociado
                ? "Actualizar comercio asociado"
                : "Agregar comercio asociado"}
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend='Datos opcionales' className='lg:col-span-2'>
          <TextArea
            id='comentarios'
            name='comentarios'
            label={"Comentarios"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["comentarios"]}
            maxLength={200}
            onChange={onChangeFormat}
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono||
              loadingPeticionConsultaInventario||
              loadingPeticionActualizacionInventario
            }
          />
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono||
              loadingPeticionConsultaInventario||
              loadingPeticionActualizacionInventario
            }>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono||
              loadingPeticionConsultaInventario||
              loadingPeticionActualizacionInventario
            }>
            {params?.id ? "Actualizar datáfono" : "Crear datáfono"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        {selectedOpt === "comercio" ? (
          <ConsultaComerciosDatafonos
            handleClose={handleClose}
            pk_tullave_datafonos={params?.id}
            setDataDatafono={setDataDatafono}
          />
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default CreateDatafono;
