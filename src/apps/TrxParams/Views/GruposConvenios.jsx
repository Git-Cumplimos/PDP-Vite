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
import { fetchGruposConvenios } from "../utils/fetchGruposConvenios";

const GruposConvenios = () => {
  const [showModal, setShowModal] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [gruposConvenios, setGruposConvenios] = useState([]);
  const [selectedGruposConvenios, setSelectedGruposConvenios] = useState({
    pk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
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
    });
    fetchGruposConveniosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedGruposConvenios({
      pk_tbl_grupo_convenios: "",
      nombre_grupo_convenios: "",
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
      setSelectedGruposConvenios({
        pk_tbl_grupo_convenios: tableGruposConvenios[i]?.["Id"],
        nombre_grupo_convenios: tableGruposConvenios[i]?.["Nombre grupo"],
      });
    },
    [tableGruposConvenios]
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
    fetchGruposConvenios({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setGruposConvenios(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);

  return (
    <Fragment>
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

export default GruposConvenios;
