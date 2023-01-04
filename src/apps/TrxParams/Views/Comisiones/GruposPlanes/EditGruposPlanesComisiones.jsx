import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../../../components/Base/Fieldset";
import Form from "../../../../../components/Base/Form/Form";
import Input from "../../../../../components/Base/Input/Input";
import Modal from "../../../../../components/Base/Modal/Modal";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import TagsAlongSide from "../../../../../components/Base/TagsAlongSide";
import { useNavigate, useParams } from "react-router-dom";
import { notify, notifyError } from "../../../../../utils/notify";
import SearchGruposPlanesComisiones from "../../../components/PlanesComisiones/SearchGruposPlanesComisiones";
import SearchComerciosNotInGruposComercios from "../../../components/GruposComercios/SearchComerciosNotInGruposComercios";
import Select from "../../../../../components/Base/Select";
import SearchPlanesComisionesPagar from "../../../components/PlanesComisiones/SearchPlanesComisionesPagar";
import {
  fetchGruposPlanesComisiones,
  fetchPlanesGruposPlanesComisiones,
  putGruposPlanesComisiones,
} from "../../../utils/fetchGruposPlanesComisiones";

const EditGruposPlanesComisiones = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [planes, setPlanes] = useState([]);
  const [optSelected, setOptSelected] = useState("");
  const [selectedGruposPlanes, setSelectedGruposPlanes] = useState({
    pk_tbl_grupo_planes_comisiones: "",
    nombre_grupo_plan: "",
    planes_comisiones: [],
    planesComisionesOriginal: [],
    id_plan: "",
    nombre_plan_comision: "",
    planes_agregar: [],
    planes_eliminar: [],
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    fk_planes_comisiones: "",
    nombre_plan_comision: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose2 = useCallback(() => {
    setOptSelected("");
    setShowModal2(false);
  }, []);
  const handleShowModal2 = useCallback(
    (data) => (e) => {
      setOptSelected(data);
      setShowModal2(true);
    },
    []
  );

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      putGruposPlanesComisiones({
        pk_tbl_grupo_planes_comisiones:
          selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones,
        nombre_grupo_plan: selectedGruposPlanes?.nombre_grupo_plan,
        planes_agregar: selectedGruposPlanes?.planes_agregar,
        planes_eliminar: selectedGruposPlanes?.planes_eliminar,
      })
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            handleClose2();
            navigate(-1);
          } else {
            notifyError(res?.msg);
            handleClose2();
          }
          setIsUploading(false);
        })
        .catch((err) => {
          notifyError(err);
          handleClose2();
          setIsUploading(false);
          console.error(err);
        });
    },
    [selectedGruposPlanes, navigate]
  );

  useEffect(() => {
    fetchGruposPlanesComisionesFunc();
  }, [params.id]);
  useEffect(() => {
    fetchPlanesGrupoPlanesFunc();
  }, [page, limit, datosBusqueda, params.id]);
  const fetchGruposPlanesComisionesFunc = useCallback(() => {
    let obj = {};
    obj["pk_tbl_grupo_planes_comisiones"] = parseInt(params.id);
    fetchGruposPlanesComisiones({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_planes_comisiones",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setSelectedGruposPlanes((old) => ({
          ...old,
          pk_tbl_grupo_planes_comisiones:
            autoArr?.results[0]?.["pk_tbl_grupo_planes_comisiones"],
          nombre_grupo_plan: autoArr?.results[0]?.["nombre_grupo_plan"],
        }));
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id]);
  const fetchPlanesGrupoPlanesFunc = useCallback(() => {
    let obj = {};
    obj["fk_tbl_grupo_planes_comisiones"] = parseInt(params.id);
    if (datosBusqueda.fk_planes_comisiones !== "")
      obj["fk_planes_comisiones"] = parseInt(
        datosBusqueda.fk_planes_comisiones
      );
    if (datosBusqueda.nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = datosBusqueda.nombre_plan_comision;
    fetchPlanesGruposPlanesComisiones({
      ...obj,
      page,
      limit,
      sortBy: "fk_planes_comisiones",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setPlanes(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id, datosBusqueda]);
  const onSelectComercioDeleteAgregar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_planes_comisiones =
        selectedGruposPlanes.planes_agregar[i].fk_planes_comisiones;
      const obj = { ...selectedGruposPlanes };
      if (
        selectedGruposPlanes?.planes_agregar?.find(
          (a) => a?.fk_planes_comisiones === fk_planes_comisiones
        )
      ) {
        const b = obj["planes_agregar"].filter(
          (a) => a?.fk_planes_comisiones !== fk_planes_comisiones
        );
        obj["planes_agregar"] = b;
      }
      setSelectedGruposPlanes((old) => {
        return {
          ...old,
          planes_agregar: obj["planes_agregar"],
        };
      });
    },
    [selectedGruposPlanes]
  );
  const onSelectPlanDeleteEliminar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_planes_comisiones =
        selectedGruposPlanes.planes_eliminar[i].fk_planes_comisiones;
      const obj = { ...selectedGruposPlanes };
      const b = obj["planes_eliminar"].filter(
        (a) => a?.fk_planes_comisiones !== fk_planes_comisiones
      );
      obj["planes_eliminar"] = b;
      setSelectedGruposPlanes((old) => {
        return {
          ...old,
          planes_eliminar: obj["planes_eliminar"],
        };
      });
    },
    [selectedGruposPlanes]
  );
  const addEliminarPlan = useCallback(
    (ev, i) => {
      ev.preventDefault();
      const fk_planes_comisiones = planes[i].fk_planes_comisiones;
      if (
        !selectedGruposPlanes?.planes_eliminar?.find(
          (a) => a?.fk_planes_comisiones === parseInt(fk_planes_comisiones)
        )
      ) {
        const obj = { ...selectedGruposPlanes };

        obj["planes_eliminar"] = [
          ...obj["planes_eliminar"],
          {
            fk_planes_comisiones: parseInt(fk_planes_comisiones),
            fk_tbl_grupo_planes_comisiones:
              selectedGruposPlanes["pk_tbl_grupo_planes_comisiones"],
          },
        ];
        setSelectedGruposPlanes((old) => {
          return {
            ...old,
            planes_eliminar: obj["planes_eliminar"],
          };
        });
      } else {
        setIsUploading(false);
        return notifyError("Ya existe el comercio en los planes por eliminar");
      }
    },
    [selectedGruposPlanes, planes]
  );
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDatosBusqueda((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const dataTable = useMemo(() => {
    return planes.map(({ fk_planes_comisiones, nombre_plan_comision }) => {
      return {
        fk_planes_comisiones,
        nombre_plan_comision,
      };
    });
  }, [planes]);
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>
        Actualizar grupo de planes comisiones
      </h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id='nombre_grupo_plan'
          name='nombre_grupo_plan'
          label='Nombre grupo de planes'
          type='text'
          autoComplete='off'
          value={selectedGruposPlanes.nombre_grupo_plan}
          onInput={(e) =>
            setSelectedGruposPlanes((old) => {
              return { ...old, nombre_grupo_plan: e.target.value };
            })
          }
          required
        />
        <Fieldset legend='Datos planes a agregar' className='lg:col-span-2'>
          <ButtonBar>
            <Button type='button' onClick={handleShowModal2("planes")}>
              Agregar plan de comisión
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend='Planes a agregar' className='lg:col-span-2'>
          {selectedGruposPlanes?.planes_agregar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposPlanes?.planes_agregar.map(
                (it) => it.fk_planes_comisiones
              )}
              onSelect={onSelectComercioDeleteAgregar}
            />
          ) : (
            <h1 className='text-xl text-center'>No hay planes por agregar</h1>
          )}
        </Fieldset>
        <Fieldset legend='Planes a eliminar' className='lg:col-span-2'>
          {selectedGruposPlanes?.planes_eliminar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposPlanes?.planes_eliminar.map(
                (it) => it.fk_planes_comisiones
              )}
              onSelect={onSelectPlanDeleteEliminar}
            />
          ) : (
            <h1 className='text-xl text-center'>No hay planes por eliminar</h1>
          )}
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button
            type='button'
            onClick={() => {
              navigate(-1);
            }}>
            Cancelar
          </Button>
          <Button type='submit'>Actualizar grupo planes</Button>
        </ButtonBar>
      </Form>
      <TableEnterprise
        title='Planes asociados al grupo originalmente'
        maxPage={maxPages}
        headers={["Id", "Plan de comisión"]}
        data={dataTable}
        onSelectRow={addEliminarPlan}
        onSetPageData={setPageData}>
        <Input
          id='fk_planes_comisiones'
          name='fk_planes_comisiones'
          label={"Id plan de comisión"}
          type='number'
          autoComplete='off'
          value={datosBusqueda.fk_planes_comisiones}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_plan_comision'
          name='nombre_plan_comision'
          label={"Nombre plan de comisión"}
          type='text'
          autoComplete='off'
          value={datosBusqueda.nombre_plan_comision}
          onChange={onChangeFormat}
        />
      </TableEnterprise>

      <Modal show={showModal2} handleClose={handleClose2}>
        {optSelected === "planes" ? (
          <SearchPlanesComisionesPagar
            selectedGruposPlanes={selectedGruposPlanes}
            setSelectedGruposPlanes={setSelectedGruposPlanes}
            handleClose={handleClose2}
          />
        ) : (
          <></>
        )}
      </Modal>
    </Fragment>
  );
};

export default EditGruposPlanesComisiones;
