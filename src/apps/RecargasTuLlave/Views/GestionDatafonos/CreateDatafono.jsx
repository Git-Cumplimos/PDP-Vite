import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notifyPending } from "../../../../utils/notify";
import Fieldset from "../../../../components/Base/Fieldset/Fieldset";
import Input from "../../../../components/Base/Input/Input";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Modal from "../../../../components/Base/Modal/Modal";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchTuLlave";
import TextArea from "../../../../components/Base/TextArea/TextArea";
import Select from "../../../../components/Base/Select/Select";
import Form from "../../../../components/Base/Form/Form";
import ConsultaComerciosDatafonos from "../../components/ConsultaComerciosDatafonos/ConsultaComerciosDatafonos";

const URL_CONSULTAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/consultar`;
const URL_EDITAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/actualizar`;
const URL_CREAR_DATAFONO = `${process.env.REACT_APP_URL_SERVICIOS_PARAMETRIZACION_SERVICIOS}/tullave-gestion-datafonos/crear`;

const CreateDatafono = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [dataDatafono, setDataDatafono] = useState({
    comentarios: "",
    estado: true,
    fecha_creacion: null,
    fecha_modificacion: null,
    fk_comercio_asociado: "",
    hardware_id: "",
    numero_serie: "",
    pk_tullave_datafonos: "",
    pos_id: "",
    tarjeta_lsam: "",
    tarjeta_sim: "",
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
        const data = {
          pk_tullave_datafonos: params?.id,
          numero_serie: dataDatafono?.numero_serie,
          tarjeta_lsam: dataDatafono?.tarjeta_lsam,
          hardware_id: dataDatafono?.hardware_id,
          comentarios: dataDatafono?.comentarios,
          estado: dataDatafono?.estado,
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
      } else {
        const data = {
          pos_id: dataDatafono?.pos_id,
          numero_serie: dataDatafono?.numero_serie,
          tarjeta_lsam: dataDatafono?.tarjeta_lsam,
          tarjeta_sim: dataDatafono?.tarjeta_sim,
          hardware_id: dataDatafono?.hardware_id,
          comentarios: dataDatafono?.comentarios,
          estado: dataDatafono?.estado,
        };
        if (dataDatafono?.fk_comercio_asociado) {
          data["fk_comercio_asociado"] = dataDatafono?.fk_comercio_asociado;
        }
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
                estado: true,
                fecha_creacion: null,
                fecha_modificacion: null,
                fk_comercio_asociado: "",
                hardware_id: "",
                numero_serie: "",
                pk_tullave_datafonos: "",
                pos_id: "",
                tarjeta_lsam: "",
                tarjeta_sim: "",
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
    let num = valor.replace(/[\s\.]/g, "");
    if (!isNaN(num)) {
      setDataDatafono((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "estado") {
      if (value && typeof value === "string") {
        value = value.toLowerCase() === "false" ? false : true;
      }
    }
    setDataDatafono((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);
  return (
    <>
      <h1 className='text-3xl'>
        {params?.id
          ? "Actualizar datáfono Tu Llave"
          : "Crear datáfono Tu Llave"}
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
            maxLength={15}
            onChange={onChangeFormatNumber}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              params?.id ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
            }
          />
          <Input
            id='numero_serie'
            name='numero_serie'
            label={"Número de serie"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["numero_serie"]}
            maxLength={15}
            onChange={onChangeFormatNumber}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
            }
          />
          <Input
            id='tarjeta_lsam'
            name='tarjeta_lsam'
            label={"Tarjeta Lsam"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["tarjeta_lsam"]}
            maxLength={15}
            onChange={onChangeFormatNumber}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
            }
          />
          <Input
            id='tarjeta_sim'
            name='tarjeta_sim'
            label={"Tarjeta Sim"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["tarjeta_sim"]}
            maxLength={15}
            onChange={onChangeFormatNumber}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              params?.id ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
            }
          />
          <Input
            id='hardware_id'
            name='hardware_id'
            label={"Hardware Id"}
            type='text'
            autoComplete='off'
            value={dataDatafono?.["hardware_id"]}
            maxLength={30}
            onChange={onChangeFormat}
            required
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
            }
          />
          <Select
            className='place-self-stretch'
            id='estado'
            name='estado'
            label='Estado del datáfono'
            required={true}
            options={{
              Inactivo: false,
              Activo: true,
            }}
            onChange={onChangeFormat}
            value={dataDatafono?.estado}
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
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
                loadingPeticionCreacionDatafono
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
              loadingPeticionCreacionDatafono
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
              loadingPeticionCreacionDatafono
            }>
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={
              loadingPeticionConsultaDatafono ||
              loadingPeticionActualizacionDatafono ||
              loadingPeticionCreacionDatafono
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
