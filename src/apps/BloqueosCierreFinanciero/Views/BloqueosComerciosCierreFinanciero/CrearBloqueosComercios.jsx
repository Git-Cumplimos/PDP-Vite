import { useNavigate,useParams } from "react-router-dom";
import { useState, useEffect, useCallback, Fragment } from "react";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Button from "../../../../components/Base/Button/Button";
import Fieldset from "../../../../components/Base/Fieldset";
import Input from "../../../../components/Base/Input";
import TextArea from "../../../../components/Base/TextArea";
import { notifyError,notify,notifyPending } from "../../../../utils/notify";
import { useFetch } from "../../../../hooks/useFetch";
import {
  bloquearComerciosCierreFinanciero,
} from "../../utils/fetchComerciosCierreFinanciero";
import { fetchCustom } from "../../utils/fetchComerciosCierreFinanciero";
import Modal from "../../../../components/Base/Modal/Modal";
import { useAuth } from "../../../../hooks/AuthHooks";

const URL_COMERCIOS = `${process.env.REACT_APP_URL_SERVICE_COMMERCE}`;
// const URL_COMERCIOS = `http://127.0.0.1:5000`;

const CrearBloqueosComercios = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { pdpUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [dataComercio, setDataComercio] = useState({
    id_comercio: "",
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const cancelBloqueo = () => {
    if (params?.id) {
      notifyError('La activacion fue cancelada por el usuario')
    }else{
      notifyError('El bloqueo fue cancelado por el usuario')
    }
    navigate("/GestionTransaccional/bloqueo-comercios-cierre-financiero")
  };

  const [loadingPeticionCrearBloqueo, peticionCrearBloqueo] = useFetch(
    bloquearComerciosCierreFinanciero
  );

  const [loadingPeticionConsultaComercios, peticionConsultaComercios] = useFetch(
    fetchCustom(`${URL_COMERCIOS}/bloqueo_cierre_financiero/consulta_bloqueos`, "POST", "Consultar comercio bloqueado")
  );

  const [loadingPeticionEliminarComercios, peticionEliminarComercio] = useFetch(
    fetchCustom(`${URL_COMERCIOS}/bloqueo_cierre_financiero/delete_bloqueos`, "POST", "Eliminar comercio bloqueado")
  );

  const delComercio = useCallback(() => {
    if (params?.id) {
      const data = {id_comercio: params?.id, usuario_ultima_actualizacion: pdpUser?.uuid}
      peticionEliminarComercio({},data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg)
            navigate("/GestionTransaccional/bloqueo-comercios-cierre-financiero")
          }else{
            notifyError(res?.msg);
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
  },[navigate,params?.id,peticionEliminarComercio]);

  const onSubmit = useCallback(() => {
    const data = {id_comercio: dataComercio?.id_comercio, usuario_ultima_actualizacion: pdpUser?.uuid}
      peticionCrearBloqueo(data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg)
            navigate("/GestionTransaccional/bloqueo-comercios-cierre-financiero")
          }else{
            if (res?.msg.includes("SchemaError:")) {
              const msg = res?.msg.replace("SchemaError:", "");
              notifyError(msg);
            } else {
              notifyError(res?.msg);
            }
          }
        })
        .catch((err) => {
          console.log(err)
          if (err?.cause === "custom") {
            notifyError(err?.message);
            return;
          }
          console.error(err?.message);
          notifyError("Peticion fallida");
        });
    },
    [navigate,dataComercio,peticionCrearBloqueo,pdpUser?.uuid]
  );

  useEffect(() => {
    fetcComerciosFunc();
  }, [params.id]);

  const fetcComerciosFunc = () => {
    if (params.id) {
      const data = {
        id_comercio: params.id,
      };
      notifyPending(
        peticionConsultaComercios({},data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setDataComercio(
              res?.obj[0] ?? {
                id_comercio: "",
                descripcion: "",
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

  const onChangeFormatNumber = useCallback((ev) => {
    const valor = ev.target.value;
    let num = valor.replace(/[\s\.\-+eE]/g, "");
    if (!isNaN(num)) {
      setDataComercio((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);

  const ShowAlert = useCallback(() => {
    setShowModal(true)
  },[]);

  return (
    <>
      <Fragment>
        <h1 className="text-3xl mt-10 mb-8">Bloqueo manual de comercios</h1>
        <Fieldset legend={"Bloquear Comercio"} className={"lg:col-span-2"}>
          <Input
            id='id_comercio'
            name='id_comercio'
            label={"Id Comercio"}
            disabled={loadingPeticionCrearBloqueo || params?.id !== undefined}
            minLength={1}
            maxLength={15}
            type='text'
            value={dataComercio?.["id_comercio"]}
            onChange={onChangeFormatNumber}
            autoComplete="off"
            required
          />
          {params?.id ?
             <TextArea
              id='descripcion'
              name='descripcion'
              className="w-full place-self-stretch"
              autoComplete="off"
              label={"Nombre Comercio"}
              type='text'
              value={dataComercio?.["descripcion"]}
              disabled={true}
            /> 
          :null}
        </Fieldset>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"button"} onClick={() => cancelBloqueo()} disabled={
            loadingPeticionCrearBloqueo || 
            loadingPeticionConsultaComercios ||
            loadingPeticionEliminarComercios}>
            Cancelar
          </Button>
          {params?.id ?
          <>
            <Button type={"submit"} onClick={() => ShowAlert()} disabled={
              loadingPeticionConsultaComercios ||
              loadingPeticionEliminarComercios}>
              Eliminar Comercio
            </Button>
          </>
          :
            <Button type={"submit"} onClick={() => onSubmit()} disabled={
              loadingPeticionCrearBloqueo || (dataComercio.id_comercio === "")}>
                Aceptar
            </Button>
          }
        </ButtonBar>
        <Modal
          show={showModal}
          handleClose={handleClose}
          className='flex align-middle'>
          <>
            <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
              <h1 className='text-2xl text-center mb-5 font-semibold'>
                {'¿Está seguro que desea activar el comercio?'}
              </h1>
              <>
                <ButtonBar>
                  <Button onClick={() => {handleClose()}}
                    disabled={              
                      loadingPeticionEliminarComercios}
                    >
                    Cancelar
                  </Button>
                  <Button type='submit' onClick={() => delComercio()}
                    disabled={              
                      loadingPeticionEliminarComercios}
                    >
                    Aceptar
                  </Button>
                </ButtonBar>
              </>
            </div>
          </>
        </Modal>
      </Fragment>
    </>
  );
};

export default CrearBloqueosComercios;