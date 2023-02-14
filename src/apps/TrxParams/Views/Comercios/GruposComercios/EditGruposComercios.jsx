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
import {
  fetchComerciosGruposComercios,
  fetchGruposComercios,
  postGruposComercios,
  putGruposComercios,
} from "../../../utils/fetchGruposComercios";
import SearchComerciosNotInGruposComercios from "../../../components/GruposComercios/SearchComerciosNotInGruposComercios";
import Select from "../../../../../components/Base/Select";

const EditGruposComercios = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [comercios, setComercios] = useState([]);
  const [optSelected, setOptSelected] = useState("");
  const [selectedGruposComercios, setSelectedGruposComercios] = useState({
    pk_tbl_grupo_comercios: "",
    nombre_grupo_comercios: "",
    paga_comision: "",
    id_comercio: "",
    comercios_agregar: [],
    comercios_eliminar: [],
    fk_tbl_grupo_planes_comisiones: "",
    nombre_grupo_plan: "",
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    fk_comercio: "",
    nombre_comercio: "",
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
      if (selectedGruposComercios?.fk_tbl_grupo_planes_comisiones === "") {
        return notifyError("Seleccione el grupo de planes de comisiones");
      }
      setIsUploading(true);
      putGruposComercios({
        pk_tbl_grupo_comercios: selectedGruposComercios?.pk_tbl_grupo_comercios,
        nombre_grupo_comercios: selectedGruposComercios?.nombre_grupo_comercios,
        comercios_agregar: selectedGruposComercios?.comercios_agregar,
        comercios_eliminar: selectedGruposComercios?.comercios_eliminar,
        fk_tbl_grupo_planes_comisiones:
          selectedGruposComercios?.fk_tbl_grupo_planes_comisiones,
        paga_comision: selectedGruposComercios?.paga_comision,
      })
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
    },
    [selectedGruposComercios, navigate]
  );

  useEffect(() => {
    fetchGrupoComerciosFunc();
  }, [params.id]);
  useEffect(() => {
    fetchComerciosGrupoComerciosFunc();
  }, [page, limit, datosBusqueda, params.id]);
  const fetchGrupoComerciosFunc = useCallback(() => {
    let obj = {};
    obj["pk_tbl_grupo_comercios"] = parseInt(params.id);
    fetchGruposComercios({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_comercios",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        // setMaxPages(autoArr?.maxPages);
        setSelectedGruposComercios((old) => ({
          ...old,
          pk_tbl_grupo_comercios:
            autoArr?.results[0]?.["pk_tbl_grupo_comercios"],
          nombre_grupo_comercios:
            autoArr?.results[0]?.["nombre_grupo_comercios"],
          fk_tbl_grupo_planes_comisiones:
            autoArr?.results[0]?.["fk_tbl_grupo_planes_comisiones"],
          nombre_grupo_plan: autoArr?.results[0]?.["nombre_grupo_plan"],
          paga_comision: autoArr?.results[0]?.["paga_comision"],
        }));
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id]);
  const fetchComerciosGrupoComerciosFunc = useCallback(() => {
    let obj = {};
    obj["fk_tbl_grupo_comercios"] = parseInt(params.id);
    if (datosBusqueda.fk_comercio !== "")
      obj["fk_comercio"] = parseInt(datosBusqueda.fk_comercio);
    if (datosBusqueda.nombre_comercio !== "")
      obj["nombre_comercio"] = datosBusqueda.nombre_comercio;
    fetchComerciosGruposComercios({
      ...obj,
      page,
      limit,
      sortBy: "fk_comercio",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        // console.log(autoArr);
        setMaxPages(autoArr?.maxPages);
        setComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id, datosBusqueda]);
  const onSelectComercioDeleteAgregar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_comercio =
        selectedGruposComercios.comercios_agregar[i].fk_comercio;
      const obj = { ...selectedGruposComercios };
      if (
        selectedGruposComercios?.comercios_agregar?.find(
          (a) => a?.fk_comercio === fk_comercio
        )
      ) {
        const b = obj["comercios_agregar"].filter(
          (a) => a?.fk_comercio !== fk_comercio
        );
        obj["comercios_agregar"] = b;
      }
      setSelectedGruposComercios((old) => {
        return {
          ...old,
          comercios_agregar: obj["comercios_agregar"],
        };
      });
    },
    [selectedGruposComercios]
  );
  const onSelectComercioDeleteEliminar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_comercio =
        selectedGruposComercios.comercios_eliminar[i].fk_comercio;
      const obj = { ...selectedGruposComercios };
      const b = obj["comercios_eliminar"].filter(
        (a) => a?.fk_comercio !== fk_comercio
      );
      obj["comercios_eliminar"] = b;
      setSelectedGruposComercios((old) => {
        return {
          ...old,
          comercios_eliminar: obj["comercios_eliminar"],
        };
      });
    },
    [selectedGruposComercios]
  );
  const addComercio = useCallback(
    (ev) => {
      ev.preventDefault();
      if (selectedGruposComercios["id_comercio"] !== "") {
        setIsUploading(true);
        if (
          !selectedGruposComercios?.comercios_agregar?.find(
            (a) =>
              a?.fk_comercio ===
              parseInt(selectedGruposComercios["id_comercio"])
          )
        ) {
          const obj = { ...selectedGruposComercios };
          const objBusqueda = {};
          // objBusqueda["fk_tbl_grupo_comercios"] = parseInt(params.id);
          objBusqueda["fk_comercio"] = parseInt(
            selectedGruposComercios["id_comercio"]
          );
          fetchComerciosGruposComercios({
            ...objBusqueda,
            sortBy: "fk_comercio",
            sortDir: "DESC",
          })
            .then((autoArr) => {
              if (autoArr?.results.length === 0) {
                obj["comercios_agregar"] = [
                  ...obj["comercios_agregar"],
                  {
                    fk_comercio: parseInt(
                      selectedGruposComercios["id_comercio"]
                    ),
                    fk_tbl_grupo_comercios:
                      selectedGruposComercios["pk_tbl_grupo_comercios"],
                  },
                ];
                setSelectedGruposComercios((old) => {
                  return {
                    ...old,
                    comercios_agregar: obj["comercios_agregar"],
                    id_comercio: "",
                  };
                });
              } else {
                notifyError("Ya existe el comercio originalmente");
              }
              setIsUploading(false);
            })
            .catch((err) => {
              notifyError(err);
              setIsUploading(false);
              console.error(err);
            });
        } else {
          setIsUploading(false);
          return notifyError(
            "Ya existe el comercio en los comercios por agregar"
          );
        }
      }
    },
    [selectedGruposComercios, params.id]
  );
  const addEliminarComercio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      const fk_comercio = comercios[i].fk_comercio;
      if (
        !selectedGruposComercios?.comercios_eliminar?.find(
          (a) => a?.fk_comercio === parseInt(fk_comercio)
        )
      ) {
        const obj = { ...selectedGruposComercios };

        obj["comercios_eliminar"] = [
          ...obj["comercios_eliminar"],
          {
            fk_comercio: parseInt(fk_comercio),
            fk_tbl_grupo_comercios:
              selectedGruposComercios["pk_tbl_grupo_comercios"],
          },
        ];
        setSelectedGruposComercios((old) => {
          return {
            ...old,
            comercios_eliminar: obj["comercios_eliminar"],
          };
        });
      } else {
        setIsUploading(false);
        return notifyError(
          "Ya existe el comercio en los comercios por eliminar"
        );
      }
    },
    [selectedGruposComercios, comercios]
  );
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDatosBusqueda((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const dataTable = useMemo(() => {
    return comercios.map(({ fk_comercio, nombre_comercio }) => {
      return {
        fk_comercio,
        nombre_comercio: nombre_comercio
          ? nombre_comercio
          : "No esta enlazado a comercios PDP",
      };
    });
  }, [comercios]);
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>Actualizar grupo comercios</h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id='nombre_grupo_comercios'
          name='nombre_grupo_comercios'
          label='Nombre grupo de comercios'
          type='text'
          autoComplete='off'
          value={selectedGruposComercios.nombre_grupo_comercios}
          onInput={(e) =>
            setSelectedGruposComercios((old) => {
              return { ...old, nombre_grupo_comercios: e.target.value };
            })
          }
          required
        />
        <Select
          id='paga_comision'
          name='paga_comision'
          label='Paga comisión'
          options={{
            Si: true,
            No: false,
          }}
          value={selectedGruposComercios.paga_comision}
          onChange={(e) =>
            setSelectedGruposComercios((old) => {
              return {
                ...old,
                paga_comision: e.target.value === "true" ? true : false,
              };
            })
          }
        />
        <Fieldset legend='Grupo de planes comisiones' className='lg:col-span-2'>
          <Input
            id='nombre_grupo_plan'
            name='nombre_grupo_plan'
            label='Nombre grupo plan de comisiones'
            type='text'
            autoComplete='off'
            value={selectedGruposComercios.nombre_grupo_plan}
            onInput={() => {}}
            disabled
            required
          />
          <ButtonBar>
            <Button type='button' onClick={handleShowModal2("planes")}>
              {selectedGruposComercios?.fk_tbl_grupo_planes_comisiones !== ""
                ? "Actualizar grupo de planes de comisiones"
                : "Agregar grupo de planes de comisiones"}
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend='Datos comercios a agregar' className='lg:col-span-2'>
          <Input
            id='id_comercio'
            name='id_comercio'
            label={"ID comercio sin enlazar con tabla de comercios PDP"}
            type='number'
            autoComplete='off'
            value={selectedGruposComercios?.id_comercio}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setSelectedGruposComercios((old) => {
                  return { ...old, id_comercio: num ?? "" };
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
          <ButtonBar>
            <Button type='button' onClick={handleShowModal2("comercios")}>
              Agregar comercio tabla PDP
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend='Comercios a agregar' className='lg:col-span-2'>
          {selectedGruposComercios?.comercios_agregar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposComercios?.comercios_agregar.map(
                (it) => it.fk_comercio
              )}
              onSelect={onSelectComercioDeleteAgregar}
            />
          ) : (
            <h1 className='text-xl text-center'>
              No hay comercios por agregar
            </h1>
          )}
        </Fieldset>
        <Fieldset legend='Comercios a eliminar' className='lg:col-span-2'>
          {selectedGruposComercios?.comercios_eliminar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposComercios?.comercios_eliminar.map(
                (it) => it.fk_comercio
              )}
              onSelect={onSelectComercioDeleteEliminar}
            />
          ) : (
            <h1 className='text-xl text-center'>
              No hay comercios por eliminar
            </h1>
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
          <Button type='submit'>Actualizar grupo comercios</Button>
        </ButtonBar>
      </Form>
      <TableEnterprise
        title='Comercios asociados al grupo originalmente'
        maxPage={maxPages}
        headers={["Id", "Comercio"]}
        data={dataTable}
        onSelectRow={addEliminarComercio}
        onSetPageData={setPageData}>
        <Input
          id='fk_comercio'
          name='fk_comercio'
          label={"Id comercio"}
          type='number'
          autoComplete='off'
          value={datosBusqueda.fk_comercio}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_comercio'
          name='nombre_comercio'
          label={"Nombre comercio"}
          type='text'
          autoComplete='off'
          value={datosBusqueda.nombre_comercio}
          onChange={onChangeFormat}
        />
      </TableEnterprise>

      <Modal show={showModal2} handleClose={handleClose2}>
        {optSelected === "planes" ? (
          <SearchGruposPlanesComisiones
            setSelectedGruposComercios={setSelectedGruposComercios}
            handleClose={handleClose2}
          />
        ) : optSelected === "comercios" ? (
          <SearchComerciosNotInGruposComercios
            setSelectedGruposComercios={setSelectedGruposComercios}
            handleClose={handleClose2}
            selectedGruposComercios={selectedGruposComercios}
            pk_tbl_grupo_comercios={params.id}
          />
        ) : (
          <></>
        )}
      </Modal>
    </Fragment>
  );
};

export default EditGruposComercios;
