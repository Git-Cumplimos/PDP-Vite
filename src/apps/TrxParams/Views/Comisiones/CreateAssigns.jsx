import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../../components/Base/Button";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate, useParams } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar";
import SearchPlanesComisiones from "../../components/PlanesComisiones/SearchPlanesComisiones";
import Fieldset from "../../../../components/Base/Fieldset";
import SearchTipoOperacion from "../../components/AssignsComission/SearchTipoOperacion";
import SearchGruposConvenios from "../../components/AssignsComission/SearchGruposConvenios";
import {
  deleteAsignacionesComisiones,
  fetchAsignacionesComisiones,
  postAsignacionesComisiones,
  putAsignacionesComisiones,
} from "../../utils/fetchAssignComission";
import SimpleLoading from "../../../../components/Base/SimpleLoading";

const CreateAssigns = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [isUploading, setIsUploading] = useState(false);
  const [newComision, setNewComision] = useState({
    pk_asignacion_comisiones: "",
    fk_tipo_op: "",
    nombre_tipo_operacion: "Vacio",
    fk_planes_comisiones: "",
    nombre_plan: "Vacio",
    nombre_asignacion_comision: "",
    fk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "Vacio",
  });
  const [selectedOpt, setSelectedOpt] = useState("");

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const createAssignComission = useCallback(
    (ev) => {
      ev.preventDefault();
      if (newComision.fk_planes_comisiones === "") {
        return notifyError("Se debe agregar el plan de comisión");
      }
      if (newComision.fk_tipo_op === "") {
        return notifyError("Se debe agregar el tipo de operación");
      }
      let obj = {
        fk_tipo_op: newComision.fk_tipo_op,
        fk_planes_comisiones: newComision.fk_planes_comisiones,
        nombre_asignacion_comision: newComision.nombre_asignacion_comision,
      };
      if (newComision.fk_tbl_grupo_convenios !== "") {
        obj["fk_tbl_grupo_convenios"] = newComision.fk_tbl_grupo_convenios;
      }

      setIsUploading(true);
      if (newComision?.pk_asignacion_comisiones !== "") {
        obj["pk_asignacion_comisiones"] = newComision.pk_asignacion_comisiones;
        putAsignacionesComisiones(obj)
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1);
            } else {
              notifyError(res?.msg);
            }
            setIsUploading(false);
          })
          .catch((err) => {
            notifyError(err);
            setIsUploading(false);
            console.error(err);
          });
      } else {
        postAsignacionesComisiones(obj)
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1);
            } else {
              notifyError(res?.msg);
            }
            setIsUploading(false);
          })
          .catch((err) => {
            notifyError(err);
            setIsUploading(false);
            console.error(err);
          });
      }
    },
    [newComision, navigate]
  );
  const deleteAssignComission = useCallback(
    (ev) => {
      ev.preventDefault();
      const obj = {};
      setIsUploading(true);
      if (newComision?.pk_asignacion_comisiones !== "") {
        obj["pk_asignacion_comisiones"] = newComision.pk_asignacion_comisiones;
        deleteAsignacionesComisiones(obj)
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              navigate(-1);
            } else {
              notifyError(res?.msg);
            }
            setIsUploading(false);
          })
          .catch((err) => {
            notifyError(err);
            setIsUploading(false);
            console.error(err);
          });
      }
    },
    [navigate, newComision]
  );

  useEffect(() => {
    fetchAssignsFunc();
  }, [params.id]);
  const fetchAssignsFunc = () => {
    if (params.id) {
      setIsUploading(true);
      fetchAsignacionesComisiones({
        pk_asignacion_comisiones: params.id,
      })
        .then((res) => {
          setIsUploading(false);
          const dataRes = res?.results;
          if (dataRes.length > 0) {
            setNewComision((old) => ({
              ...old,
              pk_asignacion_comisiones: dataRes[0]?.pk_asignacion_comisiones,
              fk_tipo_op: dataRes[0]?.fk_tipo_op ?? "",
              nombre_tipo_operacion: dataRes[0]?.nombre_operacion ?? "Vacio",
              fk_planes_comisiones: dataRes[0]?.fk_planes_comisiones ?? "",
              nombre_plan: dataRes[0]?.nombre_plan_comision ?? "Vacio",
              nombre_asignacion_comision:
                dataRes[0]?.nombre_asignacion_comision ?? "Vacio",
              fk_tbl_grupo_convenios: dataRes[0]?.fk_tbl_grupo_convenios ?? "",
              nombre_grupo_convenios:
                dataRes[0]?.nombre_grupo_convenios ?? "Vacio",
            }));
          } else {
            notifyError("Error al consultar la asignación");
            navigate(-1);
          }
        })
        .catch((err) => {
          notifyError(err);
          setIsUploading(false);
          console.error(err);
          navigate(-1);
        });
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

  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl'>
        {newComision?.pk_asignacion_comisiones !== ""
          ? "Actualizar asignación comisión"
          : "Crear asignación comisión"}
      </h1>
      <Form onSubmit={createAssignComission} grid>
        <Fieldset legend='Datos obligatorios' className='lg:col-span-2'>
          <Input
            id='nombre_asignacion_comision'
            name='nombre_asignacion_comision'
            label={"Nombre asignación de comisión"}
            type='text'
            autoComplete='off'
            value={newComision?.["nombre_asignacion_comision"]}
            onChange={(ev) => {
              setNewComision((old) => ({
                ...old,
                nombre_asignacion_comision: ev.target.value,
              }));
            }}
            required
          />
          <Fieldset legend='Plan de comisión' className='lg:col-span-2'>
            <Input
              id='nombre_plan'
              name='nombre_plan'
              label={"Plan de comisión"}
              type='text'
              autoComplete='off'
              value={newComision?.nombre_plan}
              onChange={() => {}}
              disabled
            />
            <ButtonBar>
              <Button type='button' onClick={handleShow("planComision")}>
                {newComision?.fk_planes_comisiones !== ""
                  ? "Actualizar plan de comisión"
                  : "Agregar plan de comisión"}
              </Button>
            </ButtonBar>
          </Fieldset>
          <Fieldset legend='Tipo de operación' className='lg:col-span-2'>
            <Input
              id='nombre_tipo_operacion'
              name='nombre_tipo_operacion'
              label={"Tipo de operación"}
              type='text'
              autoComplete='off'
              value={newComision?.["nombre_tipo_operacion"]}
              onChange={() => {}}
              disabled
            />
            <ButtonBar>
              <Button type='button' onClick={handleShow("tipoOperacion")}>
                {newComision?.fk_tipo_op !== ""
                  ? "Actualizar tipo de operación"
                  : "Agregar tipo de operación"}
              </Button>
            </ButtonBar>
          </Fieldset>
        </Fieldset>
        <Fieldset legend='Datos opcionales' className='lg:col-span-2'>
          <Fieldset legend='Grupo convenios' className='lg:col-span-2'>
            <Input
              id='nombre_grupo_convenios'
              name='nombre_grupo_convenios'
              label={"Grupo convenios"}
              type='text'
              autoComplete='off'
              value={newComision?.["nombre_grupo_convenios"]}
              onChange={() => {}}
              disabled
            />
            <ButtonBar>
              <Button type='button' onClick={handleShow("grupoConvenios")}>
                {newComision?.fk_tbl_grupo_convenios !== ""
                  ? "Actualizar grupo convenios"
                  : "Agregar grupo convenios"}
              </Button>
              {newComision?.fk_tbl_grupo_convenios !== "" &&
                newComision?.pk_asignacion_comisiones === "" && (
                  <Button
                    type='button'
                    onClick={() => {
                      setNewComision((old) => ({
                        ...old,
                        fk_tbl_grupo_convenios: "",
                        nombre_grupo_convenios: "Vacio",
                      }));
                    }}>
                    Eliminar grupo convenios
                  </Button>
                )}
            </ButtonBar>
          </Fieldset>
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}>
            Cancelar
          </Button>
          {newComision?.pk_asignacion_comisiones !== "" && (
            <Button type='button' onClick={handleShow("eliminarAsignacion")}>
              Eliminar asignación de comisión
            </Button>
          )}
          <Button type='submit'>
            {newComision?.pk_asignacion_comisiones !== ""
              ? "Actualizar asignación comisión"
              : "Crear asignación comisión"}
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        {selectedOpt === "planComision" ? (
          <SearchPlanesComisiones
            handleClose={handleClose}
            setNewComision={setNewComision}
            newComision={newComision}
          />
        ) : selectedOpt === "tipoOperacion" ? (
          <SearchTipoOperacion
            handleClose={handleClose}
            setNewComision={setNewComision}
            newComision={newComision}
          />
        ) : selectedOpt === "grupoConvenios" ? (
          <SearchGruposConvenios
            handleClose={handleClose}
            setNewComision={setNewComision}
            newComision={newComision}
          />
        ) : selectedOpt === "eliminarAsignacion" ? (
          <>
            <h1 className='text-2xl text-center mb-5 font-semibold'>
              ¿Está seguro de eliminar la asignación?
            </h1>
            <ButtonBar className='lg:col-span-2'>
              <Button type='button' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='submit' onClick={deleteAssignComission}>
                Eliminar asignación de comisión
              </Button>
            </ButtonBar>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </Fragment>
  );
};

export default CreateAssigns;
