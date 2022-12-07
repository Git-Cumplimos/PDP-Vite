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
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchGruposConvenios,
  postGruposConvenios,
  putGruposConvenios,
} from "../utils/fetchGruposConvenios";

const GruposConvenios = () => {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposConvenios, setGruposConvenios] = useState([]);
  const [selectedGruposConvenios, setSelectedGruposConvenios] = useState({
    pk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
    convenios: [],
    conveniosOriginal: [],
    id_convenio: "",
    convenios_agregar: [],
    convenios_eliminar: [],
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    pk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedGruposConvenios({
      pk_tbl_grupo_convenios: "",
      nombre_grupo_convenios: "",
      convenios: [],
      conveniosOriginal: [],
      id_convenio: "",
      convenios_agregar: [],
      convenios_eliminar: [],
    });
    fetchGruposConveniosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedGruposConvenios({
      pk_tbl_grupo_convenios: "",
      nombre_grupo_convenios: "",
      convenios: [],
      conveniosOriginal: [],
      id_convenio: "",
      convenios_agregar: [],
      convenios_eliminar: [],
    });
  }, []);

  const tableGruposConvenios = useMemo(() => {
    return [
      ...gruposConvenios.map(
        ({ pk_tbl_grupo_convenios, nombre_grupo_convenios, convenios }) => {
          return {
            Id: pk_tbl_grupo_convenios,
            "Nombre grupo": nombre_grupo_convenios,
            "Cantidad convenios": convenios.length,
          };
        }
      ),
    ];
  }, [gruposConvenios]);

  const onSelectGruposConvenios = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedGruposConvenios((old) => ({
        ...old,
        pk_tbl_grupo_convenios: tableGruposConvenios[i]?.["Id"],
        nombre_grupo_convenios: tableGruposConvenios[i]?.["Nombre grupo"],
        conveniosOriginal: gruposConvenios[i]?.["convenios"],
        convenios: gruposConvenios[i]?.["convenios"],
      }));
    },
    [tableGruposConvenios]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      if (selectedGruposConvenios?.pk_tbl_grupo_convenios !== "") {
        putGruposConvenios({
          pk_tbl_grupo_convenios:
            selectedGruposConvenios?.pk_tbl_grupo_convenios,
          nombre_grupo_convenios:
            selectedGruposConvenios?.nombre_grupo_convenios,
          convenios_agregar: selectedGruposConvenios?.convenios_agregar,
          convenios_eliminar: selectedGruposConvenios?.convenios_eliminar,
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
        postGruposConvenios({
          nombre_grupo_convenios:
            selectedGruposConvenios?.nombre_grupo_convenios,
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
    [handleClose, selectedGruposConvenios]
  );

  useEffect(() => {
    fetchGruposConveniosFunc();
  }, [page, limit, datosBusqueda]);
  const fetchGruposConveniosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(datosBusqueda.pk_tbl_grupo_convenios))
      obj["pk_tbl_grupo_convenios"] = parseInt(
        datosBusqueda.pk_tbl_grupo_convenios
      );
    if (datosBusqueda.nombre_grupo_convenios)
      obj["nombre_grupo_convenios"] = datosBusqueda.nombre_grupo_convenios;
    fetchGruposConvenios({
      ...obj,
      page,
      limit,
      sortBy: "pk_tbl_grupo_convenios",
      sortDir: "DESC",
    })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setGruposConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);
  const onSelectConvenioDelete = useCallback(
    (e, i) => {
      e.preventDefault();
      const fk_convenio = selectedGruposConvenios.convenios[i].fk_convenio;
      const obj = { ...selectedGruposConvenios };
      if (
        selectedGruposConvenios?.convenio_agregar?.find(
          (a) => a?.fk_convenio === fk_convenio
        )
      ) {
        const b = obj["convenios_agregar"].filter(
          (a) => a?.fk_convenio !== fk_convenio
        );
        obj["convenios_agregar"] = b;
      }
      if (
        selectedGruposConvenios?.conveniosOriginal?.find(
          (a) => a?.fk_convenio === fk_convenio
        ) &&
        !selectedGruposConvenios?.convenios_eliminar?.find(
          (a) => a?.fk_convenio === fk_convenio
        )
      ) {
        obj["convenios_eliminar"] = [
          ...obj["convenios_eliminar"],
          {
            fk_convenio: fk_convenio,
            fk_tbl_grupo_convenios:
              selectedGruposConvenios["pk_tbl_grupo_convenios"],
          },
        ];
      }

      const c = obj["convenios"].filter((a) => a?.fk_convenio !== fk_convenio);
      obj["convenios"] = c;
      setSelectedGruposConvenios((old) => {
        return {
          ...old,
          convenios_eliminar: obj["convenios_eliminar"],
          convenios_agregar: obj["convenios_agregar"],
          convenios: obj["convenios"],
        };
      });
    },
    [selectedGruposConvenios]
  );
  const addConvenio = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        !selectedGruposConvenios?.convenios?.find(
          (a) => a?.fk_convenio === selectedGruposConvenios["id_convenio"]
        ) &&
        !selectedGruposConvenios?.convenios_agregar?.find(
          (a) => a?.fk_convenio === selectedGruposConvenios["id_convenio"]
        ) &&
        selectedGruposConvenios["id_convenio"] !== ""
      ) {
        const obj = { ...selectedGruposConvenios };
        if (
          !selectedGruposConvenios?.conveniosOriginal?.find(
            (a) => a?.fk_convenio === selectedGruposConvenios["id_convenio"]
          )
        ) {
          obj["convenios_agregar"] = [
            ...obj["convenios_agregar"],
            {
              fk_convenio: selectedGruposConvenios["id_convenio"],
              fk_tbl_grupo_convenios:
                selectedGruposConvenios["pk_tbl_grupo_convenios"],
            },
          ];
        }
        if (
          selectedGruposConvenios?.convenios_eliminar?.find(
            (a) => a?.fk_convenio === selectedGruposConvenios["id_convenio"]
          )
        ) {
          const b = obj["convenios_eliminar"].filter(
            (a) => a?.fk_convenio !== selectedGruposConvenios["id_convenio"]
          );
          obj["convenios_eliminar"] = b;
        }
        obj["convenios"] = [
          ...obj["convenios"],
          { fk_convenio: selectedGruposConvenios["id_convenio"] },
        ];

        setSelectedGruposConvenios((old) => {
          return {
            ...old,
            convenios_eliminar: obj["convenios_eliminar"],
            convenios_agregar: obj["convenios_agregar"],
            convenios: obj["convenios"],
            id_convenio: "",
          };
        });
      }
    },
    [selectedGruposConvenios]
  );
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <ButtonBar>
        <Button type='submit' onClick={handleShowModal}>
          Crear grupo de convenios
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Grupos de convenios'
        maxPage={maxPages}
        headers={["Id", "Nombre grupo", "Cantidad convenios"]}
        data={tableGruposConvenios}
        onSelectRow={onSelectGruposConvenios}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='pk_tbl_grupo_convenios'
          label='Id grupo convenios'
          type='text'
          name='pk_tbl_grupo_convenios'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.pk_tbl_grupo_convenios}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosBusqueda((old) => {
                return { ...old, pk_tbl_grupo_convenios: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_grupo_convenios'
          label='Nombre grupo convenio'
          type='text'
          name='nombre_grupo_convenios'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.nombre_grupo_convenios}
          onInput={(e) => {
            setDatosBusqueda((old) => {
              return { ...old, nombre_grupo_convenios: e.target.value };
            });
          }}></Input>
      </TableEnterprise>

      <Modal show={showModal} handleClose={handleClose}>
        <h1 className='text-3xl text-center'>
          {selectedGruposConvenios?.pk_tbl_grupo_convenios !== ""
            ? "Actualizar grupo convenios"
            : "Crear grupo convenios"}
        </h1>
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
          {selectedGruposConvenios?.pk_tbl_grupo_convenios !== "" && (
            <Input
              id='id_convenio'
              name='id_convenio'
              label={"Id convenio"}
              type='number'
              autoComplete='off'
              value={selectedGruposConvenios?.id_convenio}
              onInput={(e) => {
                if (!isNaN(e.target.value)) {
                  const num = e.target.value;
                  setSelectedGruposConvenios((old) => {
                    return { ...old, id_convenio: parseInt(num) };
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
          )}
          {selectedGruposConvenios?.convenios?.length > 0 && (
            <Fieldset legend='Covnenios asociados'>
              <TagsAlongSide
                data={selectedGruposConvenios?.convenios.map(
                  (it) => it.fk_convenio
                )}
                onSelect={onSelectConvenioDelete}
              />
            </Fieldset>
          )}
          <ButtonBar>
            <Button type='button' onClick={handleClose}>
              Cancelar
            </Button>
            <Button type='submit'>
              {selectedGruposConvenios?.pk_tbl_grupo_convenios !== ""
                ? "Actualizar grupo convenios"
                : "Crear grupo convenios"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default GruposConvenios;
