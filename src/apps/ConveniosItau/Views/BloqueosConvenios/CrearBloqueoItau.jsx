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
  bloquearConveniosItau,
} from "../../utils/fetchConveniosItau";
import { fetchCustom } from "../../utils/fetchConveniosItau";
import Modal from "../../../../components/Base/Modal/Modal";

const URL_CORRESPONSALIA_ITAU = `${process.env.REACT_APP_URL_CORRESPONSALIA_ITAU}`;
// const URL_CORRESPONSALIA_ITAU = `http://127.0.0.1:5000`;

const CrearBloqueoItau = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const [updateDelete, setUpdateDelete] = useState(true);
  const [dataConvenio, setDataConvenio] = useState({
    id_convenio: "",
    descripcion: "",
  });

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const cancelAuditoria = () => {
    notifyError('El registro fue cancelado por el usuario')
    navigate("/GestionTransaccional/bloqueo-convenios-itau")
  };

  const [loadingPeticionCrearBloqueo, peticionCrearBloqueo] = useFetch(
    bloquearConveniosItau
  );

  const [loadingPeticionActualizarBloqueo, peticionActualizarConvenio] = useFetch(
    fetchCustom(`${URL_CORRESPONSALIA_ITAU}/convenios_itau/update_bloqueos`, "POST", "Actualizar convenio bloqueado")
  );

  const [loadingPeticionConsultaConvenios, peticionConsultaConvenio] = useFetch(
    fetchCustom(`${URL_CORRESPONSALIA_ITAU}/convenios_itau/consulta_bloqueos`, "POST", "Consultar convenio bloqueado")
  );

  const [loadingPeticionEliminarConvenios, peticionEliminarConvenio] = useFetch(
    fetchCustom(`${URL_CORRESPONSALIA_ITAU}/convenios_itau/delete_bloqueos`, "POST", "Eliminar convenio bloqueado")
  );

  const delConvenio = useCallback(() => {
    if (params?.id) {
      const data = {id_convenio: params?.id}
      peticionEliminarConvenio({},data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg)
            navigate("/GestionTransaccional/bloqueo-convenios-itau")
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
  },[navigate,params?.id,peticionEliminarConvenio]);

  const onSubmit = useCallback(() => {
    const data = {id_convenio: dataConvenio?.id_convenio,descripcion: dataConvenio?.descripcion}
    if (!params?.id) {
      peticionCrearBloqueo(data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg)
            navigate("/GestionTransaccional/bloqueo-convenios-itau")
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
    } else {
      peticionActualizarConvenio({},data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg)
            navigate("/GestionTransaccional/bloqueo-convenios-itau")
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
    },
    [navigate,dataConvenio,peticionCrearBloqueo,params,peticionActualizarConvenio]
  );

  useEffect(() => {
    fetcConveniosFunc();
  }, [params.id]);

  const fetcConveniosFunc = () => {
    if (params.id) {
      const data = {
        id_convenio: params.id,
      };
      notifyPending(
        peticionConsultaConvenio({},data),
        {
          render: () => {
            return "Procesando consulta";
          },
        },
        {
          render: ({ data: res }) => {
            setDataConvenio(
              res?.obj[0] ?? {
                id_convenio: "",
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
      setDataConvenio((old) => {
        return { ...old, [ev.target.name]: num };
      });
    }
  }, []);

  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    setDataConvenio((old) => {
      return { ...old, [ev.target.name]: value };
    });
  }, []);

  const ShowAlert = useCallback((val) => {
    setUpdateDelete(val)
    setShowModal(true)
  },[]);

  return (
    <>
      <Fragment>
        <h1 className="text-3xl text-center">Bloqueo Convenios Itaú</h1>
        <Fieldset legend={"Bloquear Convenio"} className={"lg:col-span-2"}>
          <Input
            id='id_convenio'
            name='id_convenio'
            label={"Número Convenio Itaú"}
            disabled={loadingPeticionCrearBloqueo || params?.id !== undefined}
            minLength={4}
            maxLength={4}
            type='text'
            value={dataConvenio?.["id_convenio"]}
            onChange={onChangeFormatNumber}
            autoComplete="off"
            required
          />
          <TextArea
            id='descripcion'
            name='descripcion'
            className="w-full place-self-stretch"
            autoComplete="off"
            minLength={3}
            maxLength={40}
            label={"Descripción Convenio"}
            type='text'
            value={dataConvenio?.["descripcion"]}
            onChange={onChangeFormat}
            disabled={
              loadingPeticionCrearBloqueo || 
              loadingPeticionActualizarBloqueo ||
              loadingPeticionConsultaConvenios ||
              loadingPeticionEliminarConvenios}
            required
          />
        </Fieldset>
        <ButtonBar className={"lg:col-span-2"}>
          <Button type={"button"} onClick={() => cancelAuditoria()} disabled={
            loadingPeticionCrearBloqueo || 
            loadingPeticionActualizarBloqueo ||
            loadingPeticionConsultaConvenios ||
            loadingPeticionEliminarConvenios}>
            Cancelar
          </Button>
          {params?.id ?
          <>
            <Button type={"submit"} onClick={() => ShowAlert(true)} 
            disabled={
              loadingPeticionActualizarBloqueo ||
              loadingPeticionConsultaConvenios ||
              loadingPeticionEliminarConvenios}
              >
              Actualizar Convenio 
            </Button>
            <Button type={"submit"} onClick={() => ShowAlert(false)} disabled={
              loadingPeticionActualizarBloqueo ||
              loadingPeticionConsultaConvenios ||
              loadingPeticionEliminarConvenios}>
              Eliminar Convenio
            </Button>
          </>
          :
            <Button type={"submit"} onClick={() => onSubmit()} disabled={
              loadingPeticionCrearBloqueo}>
              Registrar Convenio
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
                {updateDelete?
                  '¿Está seguro de actualizar la información del convenio?':
                  '¿Está seguro que desea eliminar el convenio?'
                }
              </h1>
              <>
                <ButtonBar>
                  <Button onClick={() => {handleClose()}}
                    disabled={              
                      loadingPeticionActualizarBloqueo ||
                      loadingPeticionEliminarConvenios}
                    >
                    Cancelar
                  </Button>
                  <Button type='submit' onClick={updateDelete?() => onSubmit():() => delConvenio()}
                    disabled={              
                      loadingPeticionActualizarBloqueo ||
                      loadingPeticionEliminarConvenios}
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

export default CrearBloqueoItau;