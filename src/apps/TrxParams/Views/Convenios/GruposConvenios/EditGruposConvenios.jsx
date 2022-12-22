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
import {
  fetchConveniosGrupoConvenios,
  fetchGruposConvenios,
  putGruposConvenios,
} from "../../../utils/fetchGruposConvenios";
import SearchConveniosNotInGruposConvenios from "../../../components/GruposConvenios/SearchConveniosNotInGruposConvenios";

const EditGruposConvenios = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [convenios, setConvenios] = useState([]);
  const [optSelected, setOptSelected] = useState("");
  const [selectedGruposConvenios, setSelectedGruposConvenios] = useState({
    pk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
    id_convenio: "",
    convenios_agregar: [],
    convenios_eliminar: [],
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    fk_convenio: "",
    nombre_convenio: "",
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
      putGruposConvenios({
        pk_tbl_grupo_convenios: selectedGruposConvenios?.pk_tbl_grupo_convenios,
        nombre_grupo_convenios: selectedGruposConvenios?.nombre_grupo_convenios,
        convenios_agregar: selectedGruposConvenios?.convenios_agregar,
        convenios_eliminar: selectedGruposConvenios?.convenios_eliminar,
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
    [selectedGruposConvenios]
  );

  useEffect(() => {
    fetchGrupoConveniosFunc();
  }, [params.id]);
  useEffect(() => {
    fetchConveniosGrupoConveniosFunc();
  }, [page, limit, datosBusqueda, params.id]);
  const fetchGrupoConveniosFunc = useCallback(() => {
    let obj = {};
    obj["pk_tbl_grupo_convenios"] = parseInt(params.id);
    fetchGruposConvenios({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_convenios",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setSelectedGruposConvenios((old) => ({
          ...old,
          pk_tbl_grupo_convenios:
            autoArr?.results[0]?.["pk_tbl_grupo_convenios"],
          nombre_grupo_convenios:
            autoArr?.results[0]?.["nombre_grupo_convenios"],
          fk_tbl_grupo_planes_comisiones:
            autoArr?.results[0]?.["fk_tbl_grupo_planes_comisiones"],
          nombre_grupo_plan: autoArr?.results[0]?.["nombre_grupo_plan"],
        }));
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id]);
  const fetchConveniosGrupoConveniosFunc = useCallback(() => {
    let obj = {};
    obj["fk_tbl_grupo_convenios"] = parseInt(params.id);
    if (datosBusqueda.fk_convenio !== "")
      obj["fk_convenio"] = parseInt(datosBusqueda.fk_convenio);
    if (datosBusqueda.nombre_convenio !== "")
      obj["nombre_convenio"] = datosBusqueda.nombre_convenio;
    fetchConveniosGrupoConvenios({
      ...obj,
      page,
      limit,
      sortBy: "fk_convenio",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, params.id, datosBusqueda]);
  const onSelectComercioDeleteAgregar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_convenio =
        selectedGruposConvenios.convenios_agregar[i].fk_convenio;
      const obj = { ...selectedGruposConvenios };
      if (
        selectedGruposConvenios?.convenios_agregar?.find(
          (a) => a?.fk_convenio === fk_convenio
        )
      ) {
        const b = obj["convenios_agregar"].filter(
          (a) => a?.fk_convenio !== fk_convenio
        );
        obj["convenios_agregar"] = b;
      }
      setSelectedGruposConvenios((old) => {
        return {
          ...old,
          convenios_agregar: obj["convenios_agregar"],
        };
      });
    },
    [selectedGruposConvenios]
  );
  const onSelectConvenioDeleteEliminar = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_convenio =
        selectedGruposConvenios.convenios_eliminar[i].fk_convenio;
      const obj = { ...selectedGruposConvenios };
      const b = obj["convenios_eliminar"].filter(
        (a) => a?.fk_convenio !== fk_convenio
      );
      obj["convenios_eliminar"] = b;
      setSelectedGruposConvenios((old) => {
        return {
          ...old,
          convenios_eliminar: obj["convenios_eliminar"],
        };
      });
    },
    [selectedGruposConvenios]
  );
  const addConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      if (selectedGruposConvenios["id_convenio"] !== "") {
        setIsUploading(true);
        if (
          !selectedGruposConvenios?.convenios_agregar?.find(
            (a) =>
              a?.fk_convenio ===
              parseInt(selectedGruposConvenios["id_convenio"])
          )
        ) {
          const obj = { ...selectedGruposConvenios };
          const objBusqueda = {};
          objBusqueda["fk_tbl_grupo_convenios"] = parseInt(params.id);
          objBusqueda["fk_convenio"] = parseInt(
            selectedGruposConvenios["id_convenio"]
          );
          fetchConveniosGrupoConvenios({
            ...objBusqueda,
            sortBy: "fk_convenio",
            sortDir: "DESC",
          })
            .then((autoArr) => {
              if (autoArr?.results.length === 0) {
                obj["convenios_agregar"] = [
                  ...obj["convenios_agregar"],
                  {
                    fk_convenio: parseInt(
                      selectedGruposConvenios["id_convenio"]
                    ),
                    fk_tbl_grupo_convenios:
                      selectedGruposConvenios["pk_tbl_grupo_convenios"],
                  },
                ];
                setSelectedGruposConvenios((old) => {
                  return {
                    ...old,
                    convenios_agregar: obj["convenios_agregar"],
                    id_convenio: "",
                  };
                });
              } else {
                notifyError("Ya existe el convenio originalmente");
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
            "Ya existe el convenio en los convenios por agregar"
          );
        }
      }
    },
    [selectedGruposConvenios, params.id]
  );
  const addEliminarComercio = useCallback(
    (ev, i) => {
      ev.preventDefault();
      const fk_convenio = convenios[i].fk_convenio;
      if (
        !selectedGruposConvenios?.convenios_eliminar?.find(
          (a) => a?.fk_convenio === parseInt(fk_convenio)
        )
      ) {
        const obj = { ...selectedGruposConvenios };

        obj["convenios_eliminar"] = [
          ...obj["convenios_eliminar"],
          {
            fk_convenio: parseInt(fk_convenio),
            fk_tbl_grupo_convenios:
              selectedGruposConvenios["pk_tbl_grupo_convenios"],
          },
        ];
        setSelectedGruposConvenios((old) => {
          return {
            ...old,
            convenios_eliminar: obj["convenios_eliminar"],
          };
        });
      } else {
        setIsUploading(false);
        return notifyError(
          "Ya existe el comercio en los convenios por eliminar"
        );
      }
    },
    [selectedGruposConvenios, convenios]
  );
  const onChangeFormat = useCallback((ev) => {
    let valor = ev.target.value;
    valor = valor.replace(/[\s\.]/g, "");
    setDatosBusqueda((old) => {
      return { ...old, [ev.target.name]: valor };
    });
  }, []);
  const dataTable = useMemo(() => {
    return convenios.map(({ fk_convenio, nombre_convenio }) => {
      return {
        fk_convenio,
        nombre_convenio: nombre_convenio
          ? nombre_convenio
          : "No esta enlazado a convenios PDP",
      };
    });
  }, [convenios]);
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl text-center'>Actualizar grupo convenios</h1>
      <Form onSubmit={onSubmit} grid>
        <Input
          id='nombre_grupo_convenios'
          name='nombre_grupo_convenios'
          label='Nombre grupo de convenios'
          type='text'
          autoComplete='off'
          value={selectedGruposConvenios.nombre_grupo_convenios}
          onInput={(e) =>
            setSelectedGruposConvenios((old) => {
              return { ...old, nombre_grupo_convenios: e.target.value };
            })
          }
          required
        />
        <Fieldset legend='Datos convenios a agregar' className='lg:col-span-2'>
          <Input
            id='id_convenio'
            name='id_convenio'
            label={"ID convenio sin enlazar con tabla de convenios PDP"}
            type='number'
            autoComplete='off'
            value={selectedGruposConvenios?.id_convenio}
            onInput={(e) => {
              if (!isNaN(e.target.value)) {
                const num = e.target.value;
                setSelectedGruposConvenios((old) => {
                  return { ...old, id_convenio: num ?? "" };
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
                onClick={addConvenio}>
                Agregar
              </button>
            }
          />
          <ButtonBar>
            <Button type='button' onClick={handleShowModal2("convenios")}>
              Agregar convenio tabla PDP
            </Button>
          </ButtonBar>
        </Fieldset>
        <Fieldset legend='Convenios a agregar' className='lg:col-span-2'>
          {selectedGruposConvenios?.convenios_agregar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposConvenios?.convenios_agregar.map(
                (it) => it.fk_convenio
              )}
              onSelect={onSelectComercioDeleteAgregar}
            />
          ) : (
            <h1 className='text-xl text-center'>
              No hay convenios por agregar
            </h1>
          )}
        </Fieldset>
        <Fieldset legend='Convenios a eliminar' className='lg:col-span-2'>
          {selectedGruposConvenios?.convenios_eliminar?.length > 0 ? (
            <TagsAlongSide
              data={selectedGruposConvenios?.convenios_eliminar.map(
                (it) => it.fk_convenio
              )}
              onSelect={onSelectConvenioDeleteEliminar}
            />
          ) : (
            <h1 className='text-xl text-center'>
              No hay convenios por eliminar
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
          <Button type='submit'>Actualizar grupo convenios</Button>
        </ButtonBar>
      </Form>
      <TableEnterprise
        title='Convenios asociados al grupo originalmente'
        maxPage={maxPages}
        headers={["Id", "Convenio"]}
        data={dataTable}
        onSelectRow={addEliminarComercio}
        onSetPageData={setPageData}>
        <Input
          id='fk_convenio'
          name='fk_convenio'
          label={"Id convenio"}
          type='number'
          autoComplete='off'
          value={datosBusqueda.fk_convenio}
          onChange={onChangeFormat}
        />
        <Input
          id='nombre_convenio'
          name='nombre_convenio'
          label={"Nombre convenio"}
          type='text'
          autoComplete='off'
          value={datosBusqueda.nombre_plan_comision}
          onChange={onChangeFormat}
        />
      </TableEnterprise>

      <Modal show={showModal2} handleClose={handleClose2}>
        {optSelected === "convenios" ? (
          <SearchConveniosNotInGruposConvenios
            setSelectedGruposConvenios={setSelectedGruposConvenios}
            handleClose={handleClose2}
            selectedGruposConvenios={selectedGruposConvenios}
            pk_tbl_grupo_convenios={params.id}
          />
        ) : (
          <></>
        )}
      </Modal>
    </Fragment>
  );
};

export default EditGruposConvenios;
