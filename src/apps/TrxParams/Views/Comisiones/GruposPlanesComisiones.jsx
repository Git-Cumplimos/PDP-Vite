import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button/Button";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../../components/Base/Fieldset";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import Modal from "../../../../components/Base/Modal/Modal";
import Select from "../../../../components/Base/Select/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TagsAlongSide from "../../../../components/Base/TagsAlongSide";
import useQuery from "../../../../hooks/useQuery";
import { notify, notifyError } from "../../../../utils/notify";
import {
  fetchGruposComercios,
  postGruposComercios,
  putGruposComercios,
} from "../../utils/fetchGruposComercios";
import { fetchGruposPlanesComisiones } from "../../utils/fetchGruposPlanesComisiones";

const GruposPlanesComisiones = () => {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposComercios, setGruposComercios] = useState([]);
  const [selectedGruposPlanes, setSelectedGruposPlanes] = useState({
    pk_tbl_grupo_planes_comisiones: "",
    nombre_grupo_plan: "",
    planes_comisiones: [],
    planesComisionesOriginal: [],
    id_comercio: "",
    comercios_agregar: [],
    comercios_eliminar: [],
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
      id_comercio: "",
      comercios_agregar: [],
      comercios_eliminar: [],
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
      id_comercio: "",
      comercios_agregar: [],
      comercios_eliminar: [],
    });
  }, []);

  const tableGruposComercios = useMemo(() => {
    return [
      ...gruposComercios.map(
        ({
          nombre_grupo_plan,
          pk_tbl_grupo_planes_comisiones,
          planes_comisiones,
        }) => {
          return {
            Id: pk_tbl_grupo_planes_comisiones,
            "Nombre grupo": nombre_grupo_plan,
            "Cantidad comercios": planes_comisiones.length ?? 0,
          };
        }
      ),
    ];
  }, [gruposComercios]);

  const onSelectTipoNivelComercios = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedGruposPlanes((old) => ({
        ...old,
        pk_tbl_grupo_planes_comisiones:
          gruposComercios[i]?.["pk_tbl_grupo_planes_comisiones"],
        nombre_grupo_plan: gruposComercios[i]?.["nombre_grupo_plan"],
        planesComisionesOriginal: gruposComercios[i]?.["planes_comisiones"],
        planes_comisiones: gruposComercios[i]?.["planes_comisiones"],
      }));
    },
    [gruposComercios]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      if (selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones !== "") {
        putGruposComercios({
          pk_tbl_grupo_planes_comisiones:
            selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones,
          nombre_grupo_plan: selectedGruposPlanes?.nombre_grupo_plan,
          comercios_agregar: selectedGruposPlanes?.comercios_agregar,
          comercios_eliminar: selectedGruposPlanes?.comercios_eliminar,
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
      } else {
        postGruposComercios({
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
      }
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
        setGruposComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);
  const onSelectComercioDelete = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_comercio = selectedGruposPlanes.planes_comisiones[i].fk_comercio;
      const obj = { ...selectedGruposPlanes };
      if (
        selectedGruposPlanes?.comercios_agregar?.find(
          (a) => a?.fk_comercio === fk_comercio
        )
      ) {
        const b = obj["comercios_agregar"].filter(
          (a) => a?.fk_comercio !== fk_comercio
        );
        obj["comercios_agregar"] = b;
      }
      if (
        selectedGruposPlanes?.planesComisionesOriginal?.find(
          (a) => a?.fk_comercio === fk_comercio
        ) &&
        !selectedGruposPlanes?.comercios_eliminar?.find(
          (a) => a?.fk_comercio === fk_comercio
        )
      ) {
        obj["comercios_eliminar"] = [
          ...obj["comercios_eliminar"],
          {
            fk_comercio: fk_comercio,
            fk_tbl_grupo_comercios:
              selectedGruposPlanes["pk_tbl_grupo_planes_comisiones"],
          },
        ];
      }

      const c = obj["planes_comisiones"].filter(
        (a) => a?.fk_comercio !== fk_comercio
      );
      obj["planes_comisiones"] = c;
      setSelectedGruposPlanes((old) => {
        return {
          ...old,
          comercios_eliminar: obj["comercios_eliminar"],
          comercios_agregar: obj["comercios_agregar"],
          planes_comisiones: obj["planes_comisiones"],
        };
      });
    },
    [selectedGruposPlanes]
  );
  const addComercio = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        !selectedGruposPlanes?.planes_comisiones?.find(
          (a) => a?.fk_comercio === selectedGruposPlanes["id_comercio"]
        ) &&
        !selectedGruposPlanes?.comercios_agregar?.find(
          (a) => a?.fk_comercio === selectedGruposPlanes["id_comercio"]
        ) &&
        selectedGruposPlanes["id_comercio"] !== ""
      ) {
        const obj = { ...selectedGruposPlanes };
        if (
          !selectedGruposPlanes?.planesComisionesOriginal?.find(
            (a) => a?.fk_comercio === selectedGruposPlanes["id_comercio"]
          )
        ) {
          obj["comercios_agregar"] = [
            ...obj["comercios_agregar"],
            {
              fk_comercio: selectedGruposPlanes["id_comercio"],
              fk_tbl_grupo_comercios:
                selectedGruposPlanes["pk_tbl_grupo_planes_comisiones"],
            },
          ];
        }
        if (
          selectedGruposPlanes?.comercios_eliminar?.find(
            (a) => a?.fk_comercio === selectedGruposPlanes["id_comercio"]
          )
        ) {
          const b = obj["comercios_eliminar"].filter(
            (a) => a?.fk_comercio !== selectedGruposPlanes["id_comercio"]
          );
          obj["comercios_eliminar"] = b;
        }
        obj["planes_comisiones"] = [
          ...obj["planes_comisiones"],
          { fk_comercio: selectedGruposPlanes["id_comercio"] },
        ];

        setSelectedGruposPlanes((old) => {
          return {
            ...old,
            comercios_eliminar: obj["comercios_eliminar"],
            comercios_agregar: obj["comercios_agregar"],
            planes_comisiones: obj["planes_comisiones"],
            id_comercio: "",
          };
        });
      }
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
        data={tableGruposComercios}
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
      {/* {Array.isArray(tableConfiguracionComercios) &&
      tableConfiguracionComercios.length > 0 ? (
        <Table
          headers={Object.keys(tableConfiguracionComercios[0])}
          data={tableConfiguracionComercios}
          onSelectRow={onSelectConfiguracionComercios}
        />
      ) : (
        ""
      )} */}

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
          {selectedGruposPlanes?.pk_tbl_grupo_planes_comisiones !== "" && (
            <Input
              id='id_comercio'
              name='id_comercio'
              label={"Id grupo planes"}
              type='number'
              autoComplete='off'
              value={selectedGruposPlanes?.id_comercio}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setSelectedGruposPlanes((old) => {
                    return { ...old, id_comercio: parseInt(num) };
                  });
                }
              }}
              info={
                <button
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
                  onClick={addComercio}>
                  Agregar
                </button>
              }
            />
          )}
          {selectedGruposPlanes?.planes_comisiones?.length > 0 && (
            <Fieldset legend='Comercios asociados'>
              <TagsAlongSide
                data={selectedGruposPlanes?.planes_comisiones.map(
                  (it) => it.fk_comercio
                )}
                onSelect={onSelectComercioDelete}
              />
            </Fieldset>
          )}
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
