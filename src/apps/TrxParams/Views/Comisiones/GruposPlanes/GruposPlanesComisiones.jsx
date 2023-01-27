import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../../components/Base/Button/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../../../components/Base/Fieldset";
import Form from "../../../../../components/Base/Form/Form";
import Input from "../../../../../components/Base/Input/Input";
import Modal from "../../../../../components/Base/Modal/Modal";
import SimpleLoading from "../../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import { useNavigate } from "react-router-dom";
import { notify, notifyError } from "../../../../../utils/notify";
import SearchPlanesComisionesPagar from "../../../components/PlanesComisiones/SearchPlanesComisionesPagar";
import {
  fetchGruposPlanesComisiones,
  postGruposPlanesComisiones,
  putGruposPlanesComisiones,
} from "../../../utils/fetchGruposPlanesComisiones";

const GruposPlanesComisiones = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposPlanes, setGruposPlanes] = useState([]);
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
    pk_tbl_grupo_planes_comisiones: "",
    nombre_grupo_plan: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedGruposPlanes({
      pk_tbl_grupo_planes_comisiones: "",
      nombre_grupo_plan: "",
      planes_comisiones: [],
      planesComisionesOriginal: [],
      id_plan: "",
      nombre_plan_comision: "",
      planes_agregar: [],
      planes_eliminar: [],
    });
    fetchGruposPlanesComisionesFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedGruposPlanes({
      pk_tbl_grupo_planes_comisiones: "",
      nombre_grupo_plan: "",
      planes_comisiones: [],
      planesComisionesOriginal: [],
      id_plan: "",
      nombre_plan_comision: "",
      planes_agregar: [],
      planes_eliminar: [],
    });
  }, []);

  const tableGruposPlanes = useMemo(() => {
    return [
      ...gruposPlanes.map(
        ({
          nombre_grupo_plan,
          pk_tbl_grupo_planes_comisiones,
          planes_comisiones,
        }) => {
          return {
            Id: pk_tbl_grupo_planes_comisiones,
            "Nombre grupo": nombre_grupo_plan,
            "Cantidad comercios":
              planes_comisiones.length > 0 ? planes_comisiones[0].count : 0,
          };
        }
      ),
    ];
  }, [gruposPlanes]);

  const onSelectTipoNivelComercios = useCallback(
    (e, i) => {
      navigate(
        `/params-operations/grupos-planes-comisiones/edit/${gruposPlanes[i]?.["pk_tbl_grupo_planes_comisiones"]}`
      );
    },
    [gruposPlanes]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      postGruposPlanesComisiones({
        nombre_grupo_plan: selectedGruposPlanes?.nombre_grupo_plan,
      })
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            handleClose();
          } else {
            notifyError(res?.msg);
            handleClose();
          }
          setIsUploading(false);
        })
        .catch((err) => {
          notifyError(err);
          handleClose();
          setIsUploading(false);
          console.error(err);
        });
    },
    [handleClose, selectedGruposPlanes]
  );

  useEffect(() => {
    fetchGruposPlanesComisionesFunc();
  }, [page, limit, datosBusqueda]);
  const fetchGruposPlanesComisionesFunc = useCallback(() => {
    let obj = {};
    if (parseInt(datosBusqueda.pk_tbl_grupo_planes_comisiones))
      obj["pk_tbl_grupo_planes_comisiones"] = parseInt(
        datosBusqueda.pk_tbl_grupo_planes_comisiones
      );
    if (datosBusqueda.nombre_grupo_plan)
      obj["nombre_grupo_plan"] = datosBusqueda.nombre_grupo_plan;
    fetchGruposPlanesComisiones({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_planes_comisiones",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setGruposPlanes(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);
  const onSelectPlanDelete = useCallback(
    (e, i) => {
      const fk_planes_comisiones =
        selectedGruposPlanes.planes_comisiones[i].fk_planes_comisiones;
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
      if (
        selectedGruposPlanes?.planesComisionesOriginal?.find(
          (a) => a?.fk_planes_comisiones === fk_planes_comisiones
        ) &&
        !selectedGruposPlanes?.planes_eliminar?.find(
          (a) => a?.fk_planes_comisiones === fk_planes_comisiones
        )
      ) {
        obj["planes_eliminar"] = [
          ...obj["planes_eliminar"],
          {
            fk_planes_comisiones: fk_planes_comisiones,
            fk_tbl_grupo_planes_comisiones:
              selectedGruposPlanes["pk_tbl_grupo_planes_comisiones"],
          },
        ];
      }

      const c = obj["planes_comisiones"].filter(
        (a) => a?.fk_planes_comisiones !== fk_planes_comisiones
      );
      obj["planes_comisiones"] = c;
      setSelectedGruposPlanes((old) => {
        return {
          ...old,
          planes_eliminar: obj["planes_eliminar"],
          planes_agregar: obj["planes_agregar"],
          planes_comisiones: obj["planes_comisiones"],
        };
      });
    },
    [selectedGruposPlanes]
  );
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <ButtonBar>
        <Button type='submit' onClick={handleShowModal}>
          Crear grupo de planes de comisiones
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Grupos de planes de comisiones'
        maxPage={maxPages}
        headers={["Id", "Nombre grupo", "Cantidad planes"]}
        data={tableGruposPlanes}
        onSelectRow={onSelectTipoNivelComercios}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='pk_tbl_grupo_planes_comisiones'
          label='Id grupo de planes'
          type='text'
          name='pk_tbl_grupo_planes_comisiones'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.pk_tbl_grupo_planes_comisiones}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosBusqueda((old) => {
                return { ...old, pk_tbl_grupo_planes_comisiones: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_grupo_plan'
          label='Nombre grupo de planes'
          type='text'
          name='nombre_grupo_plan'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.nombre_grupo_plan}
          onInput={(e) => {
            setDatosBusqueda((old) => {
              return { ...old, nombre_grupo_plan: e.target.value };
            });
          }}></Input>
      </TableEnterprise>

      <Modal show={showModal} handleClose={handleClose}>
        <h1 className='text-3xl text-center'>
          {selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones !== ""
            ? "Actualizar grupo de planes"
            : "Crear grupo de planes"}
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

          <ButtonBar>
            <Button type='button' onClick={handleClose}>
              Cancelar
            </Button>
            <Button type='submit'>
              {selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones !== ""
                ? "Actualizar grupo de planes"
                : "Crear grupo de planes"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default GruposPlanesComisiones;