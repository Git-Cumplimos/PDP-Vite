import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  postConsultaTipoNivelComercio,
  postCrearTipoNivelComercio,
  putModificarTipoNivelComercio,
} from "../utils/fetchComercios";
import { fetchGruposComercios } from "../utils/fetchGruposComercios";
import {
  fetchParametrosAutorizadores,
  postParametrosAutorizadores,
  putParametrosAutorizadores,
} from "../utils/fetchParametrosAutorizadores";
import { fetchAutorizadores } from "../utils/fetchRevalAutorizadores";

const GruposComercios = () => {
  const [showModal, setShowModal] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposComercios, setGruposComercios] = useState([]);
  const [selectedGruposComercios, setSelectedGruposComercios] = useState({
    pk_tbl_grupo_comercios: "",
    nombre_grupo_comercios: "",
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
    });
    fetchTipoNivelComerciosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedGruposComercios({
      pk_tbl_grupo_comercios: "",
      nombre_grupo_comercios: "",
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
      setSelectedGruposComercios({
        pk_tbl_grupo_comercios: tableGruposComercios[i]?.["Id"],
        nombre_grupo_comercios: tableGruposComercios[i]?.["Nombre grupo"],
      });
    },
    [tableGruposComercios]
  );
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      // if (selectedTipoNivelComercio?.descripcion === "") {
      //   notifyError("Se debe escribir la descripción");
      //   return;
      // }
      // if (selectedTipoNivelComercio?.pkTipoNivel !== "") {
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
      // } else {
      //   postCrearTipoNivelComercio({
      //     descripcion: selectedTipoNivelComercio?.descripcion,
      //   })
      //     .then((res) => {
      //       if (res?.status) {
      //         notify(res?.msg);
      //         handleClose();
      //       } else {
      //         notifyError(res?.msg);
      //       }
      //     })
      //     .catch((err) => console.error(err));
      // }
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

  return (
    <Fragment>
      <ButtonBar>
        <Button type='submit' onClick={handleShowModal}>
          Crear grupo de comercios
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Grupos de comercios'
        maxPage={maxPages}
        headers={["Id", "Nombre grupo", "Cantidad comercios"]}
        data={tableGruposComercios}
        onSelectRow={onSelectTipoNivelComercios}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='pk_tbl_grupo_comercios'
          label='Id grupo comercios'
          type='text'
          name='pk_tbl_grupo_comercios'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.pk_tbl_grupo_comercios}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosBusqueda((old) => {
                return { ...old, pk_tbl_grupo_comercios: num };
              });
            }
          }}></Input>
        <Input
          id='nombre_grupo_comercios'
          label='Nombre grupo comercios'
          type='text'
          name='nombre_grupo_comercios'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.nombre_grupo_comercios}
          onInput={(e) => {
            setDatosBusqueda((old) => {
              return { ...old, nombre_grupo_comercios: e.target.value };
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

      {/* <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} grid>
          <Input
            id='descripcion'
            name='descripcion'
            label='Descripción'
            type='text'
            autoComplete='off'
            value={selectedTipoNivelComercio.descripcion}
            onInput={(e) =>
              setSelectedTipoNivelComercio((old) => {
                return { ...old, descripcion: e.target.value };
              })
            }
            // defaultValue={selectedAuto?.["Id comercio"] ?? ""}
            // disabled={selectedAuto?.["Id configuracion"]}
            required
          />
          <ButtonBar>
            <Button type='button' onClick={handleClose}>
              Cancelar
            </Button>
            <Button type='submit'>
              {selectedTipoNivelComercio?.pkTipoNivel !== ""
                ? "Actualizar tipo nivel comercio"
                : "Crear tipo nivel comercio"}
            </Button>
          </ButtonBar>
        </Form>
      </Modal> */}
    </Fragment>
  );
};

export default GruposComercios;
