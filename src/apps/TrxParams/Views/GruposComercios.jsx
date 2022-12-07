import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import TagsAlongSide from "../../../components/Base/TagsAlongSide";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchGruposComercios,
  postGruposComercios,
} from "../utils/fetchGruposComercios";

const GruposComercios = () => {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposComercios, setGruposComercios] = useState([]);
  const [selectedGruposComercios, setSelectedGruposComercios] = useState({
    pk_tbl_grupo_comercios: "",
    nombre_grupo_comercios: "",
    comercios: [],
    id_comercio: "",
    comercios_agregar: [],
    comercios_eliminar: [],
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    pk_tbl_grupo_comercios: "",
    nombre_grupo_comercios: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedGruposComercios({
      pk_tbl_grupo_comercios: "",
      nombre_grupo_comercios: "",
      comercios: [],
      id_comercio: "",
      comercios_agregar: [],
      comercios_eliminar: [],
    });
    fetchTipoNivelComerciosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedGruposComercios({
      pk_tbl_grupo_comercios: "",
      nombre_grupo_comercios: "",
      comercios: [],
      id_comercio: "",
      comercios_agregar: [],
      comercios_eliminar: [],
    });
  }, []);

  const tableGruposComercios = useMemo(() => {
    return [
      ...gruposComercios.map(
        ({ nombre_grupo_comercios, pk_tbl_grupo_comercios, comercios }) => {
          return {
            Id: pk_tbl_grupo_comercios,
            "Nombre grupo": nombre_grupo_comercios,
            "Cantidad comercios": comercios.length ?? 0,
          };
        }
      ),
    ];
  }, [gruposComercios]);

  const onSelectTipoNivelComercios = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedGruposComercios((old) => ({
        ...old,
        pk_tbl_grupo_comercios: gruposComercios[i]?.["pk_tbl_grupo_comercios"],
        nombre_grupo_comercios: gruposComercios[i]?.["nombre_grupo_comercios"],
        comercios: gruposComercios[i]?.["comercios"],
      }));
    },
    [gruposComercios]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      if (selectedGruposComercios?.pk_tbl_grupo_comercios !== "") {
        //   putModificarTipoNivelComercio(
        //     selectedTipoNivelComercio?.pkTipoNivel,
        //     {
        //       descripcion: selectedTipoNivelComercio?.descripcion,
        //     }
        //   )
        //     .then((res) => {
        //       if (res?.status) {
        //         notify(res?.msg);
        //         handleClose();
        //       } else {
        //         notifyError(res?.msg);
        //       }
        //     })
        //     .catch((err) => console.error(err));
      } else {
        postGruposComercios({
          nombre_grupo_comercios:
            selectedGruposComercios?.nombre_grupo_comercios,
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
    [handleClose, selectedGruposComercios]
  );

  useEffect(() => {
    fetchTipoNivelComerciosFunc();
  }, [page, limit, datosBusqueda]);
  const fetchTipoNivelComerciosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(datosBusqueda.pk_tbl_grupo_comercios))
      obj["pk_tbl_grupo_comercios"] = parseInt(
        datosBusqueda.pk_tbl_grupo_comercios
      );
    if (datosBusqueda.nombre_grupo_comercios)
      obj["nombre_grupo_comercios"] = datosBusqueda.nombre_grupo_comercios;
    fetchGruposComercios({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setGruposComercios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);
  const onSelectComercioDelete = useCallback(
    (e, i) => {
      e.preventDefault();
      console.log(selectedGruposComercios.comercios[i]);
      const fk_comercio = selectedGruposComercios.comercios[i].fk_comercio
      if (
        !selectedGruposComercios?.comercios?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        !selectedGruposComercios?.comercios_agregar?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        !selectedGruposComercios?.comercios_eliminar?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        selectedGruposComercios["id_comercio"] !== ""
      ){}
      // let temp = [...idComercios];
      // temp?.splice(i, 1);
      // setIdComercios(temp);
    },
    [selectedGruposComercios]
  );
  const addComercio = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        !selectedGruposComercios?.comercios?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        !selectedGruposComercios?.comercios_agregar?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        !selectedGruposComercios?.comercios_eliminar?.find(
          (a) => a?.fk_comercio === selectedGruposComercios["id_comercio"]
        ) &&
        selectedGruposComercios["id_comercio"] !== ""
      ) {
        const obj = { ...selectedGruposComercios };
        obj["comercios_agregar"] = [
          ...obj["comercios_agregar"],
          {
            fk_comercio: selectedGruposComercios["id_comercio"],
            fk_tbl_grupo_comercios:
              selectedGruposComercios["pk_tbl_grupo_comercios"],
          },
        ];
        obj["comercios"] = [
          ...obj["comercios"],
          { fk_comercio: selectedGruposComercios["id_comercio"] },
        ];

        setSelectedGruposComercios((old) => {
          return {
            ...old,
            comercios_agregar: obj["comercios_agregar"],
            comercios: obj["comercios"],
          };
        });
      }
    },
    [selectedGruposComercios]
  );
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <ButtonBar>
        <Button type="submit" onClick={handleShowModal}>
          Crear grupo de comercios
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Grupos de comercios"
        maxPage={maxPages}
        headers={["Id", "Nombre grupo", "Cantidad comercios"]}
        data={tableGruposComercios}
        onSelectRow={onSelectTipoNivelComercios}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id="pk_tbl_grupo_comercios"
          label="Id grupo comercios"
          type="text"
          name="pk_tbl_grupo_comercios"
          minLength="1"
          maxLength="10"
          // required
          value={datosBusqueda.pk_tbl_grupo_comercios}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosBusqueda((old) => {
                return { ...old, pk_tbl_grupo_comercios: num };
              });
            }
          }}
        ></Input>
        <Input
          id="nombre_grupo_comercios"
          label="Nombre grupo comercios"
          type="text"
          name="nombre_grupo_comercios"
          minLength="1"
          maxLength="10"
          // required
          value={datosBusqueda.nombre_grupo_comercios}
          onInput={(e) => {
            setDatosBusqueda((old) => {
              return { ...old, nombre_grupo_comercios: e.target.value };
            });
          }}
        ></Input>
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
        <h1 className="text-3xl text-center">
          {selectedGruposComercios?.pk_tbl_grupo_comercios !== ""
            ? "Actualizar grupo comercios"
            : "Crear grupo comercios"}
        </h1>
        <Form onSubmit={onSubmit} grid>
          <Input
            id="nombre_grupo_comercios"
            name="nombre_grupo_comercios"
            label="Nombre grupo de comercios"
            type="text"
            autoComplete="off"
            value={selectedGruposComercios.nombre_grupo_comercios}
            onInput={(e) =>
              setSelectedGruposComercios((old) => {
                return { ...old, nombre_grupo_comercios: e.target.value };
              })
            }
            required
          />
          {selectedGruposComercios?.pk_tbl_grupo_comercios !== "" && (
            <Input
              id="id_comercio"
              name="id_comercio"
              label={"Id comercio"}
              type="number"
              autoComplete="off"
              value={selectedGruposComercios?.id_comercio}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setSelectedGruposComercios((old) => {
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
                  onClick={addComercio}
                >
                  Agregar
                </button>
              }
            />
          )}
          {selectedGruposComercios?.comercios?.length > 0 && (
            <Fieldset legend="Comercios asociados" className="lg:col-span-2">
              <TagsAlongSide
                data={selectedGruposComercios?.comercios.map(
                  (it) => it.fk_comercio
                )}
                onSelect={onSelectComercioDelete}
              />
            </Fieldset>
          )}
          <ButtonBar>
            <Button type="button" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {selectedGruposComercios?.pk_tbl_grupo_comercios !== ""
                ? "Actualizar grupo comercios"
                : "Crear grupo comercios"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default GruposComercios;
