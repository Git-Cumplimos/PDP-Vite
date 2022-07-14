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
import {
  fetchParametrosAutorizadores,
  postParametrosAutorizadores,
  putParametrosAutorizadores,
} from "../utils/fetchParametrosAutorizadores";
import { fetchAutorizadores } from "../utils/fetchRevalAutorizadores";

const TipoNivelComercio = () => {
  const [showModal, setShowModal] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [tipoNivelComercio, setTipoNivelComercio] = useState([]);
  const [selectedTipoNivelComercio, setSelectedTipoNivelComercio] = useState({
    pkTipoNivel: "",
    descripcion: "",
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    pkTipoNivel: "",
    descripcion: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedTipoNivelComercio({
      pkTipoNivel: "",
      descripcion: "",
    });
    fetchTipoNivelComerciosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedTipoNivelComercio({
      pkTipoNivel: "",
      descripcion: "",
    });
  }, []);

  const tableTipoNivelComercio = useMemo(() => {
    return [
      ...tipoNivelComercio.map(({ descripcion, pk_tipo_nivel }) => {
        return {
          Id: pk_tipo_nivel,
          Descripcion: descripcion,
        };
      }),
    ];
  }, [tipoNivelComercio]);

  const onSelectTipoNivelComercios = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedTipoNivelComercio({
        pkTipoNivel: tableTipoNivelComercio[i]?.["Id"],
        descripcion: tableTipoNivelComercio[i]?.["Descripcion"],
      });
    },
    [tableTipoNivelComercio]
  );

  // const onChange = useCallback(
  //   (ev) => {
  //     const formData = new FormData(ev.target.form);
  //     const nameAuto = formData.get("searchAuto");
  //   },
  //   [setQuery]
  // );
  // const onChangeFormat = useCallback((ev) => {
  //   setSelectedParam((old) => {
  //     return { ...old, [ev.target.name]: ev.target.value };
  //   });
  // }, []);
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();

      if (selectedTipoNivelComercio?.descripcion === "") {
        notifyError("Se debe escribir la descripción");
        return;
      }
      if (selectedTipoNivelComercio?.pkTipoNivel !== "") {
        putModificarTipoNivelComercio(
          selectedTipoNivelComercio?.pkTipoNivel,

          {
            descripcion: selectedTipoNivelComercio?.descripcion,
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        postCrearTipoNivelComercio({
          descripcion: selectedTipoNivelComercio?.descripcion,
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              handleClose();
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      }
    },
    [handleClose, selectedTipoNivelComercio]
  );

  useEffect(() => {
    fetchTipoNivelComerciosFunc();
  }, [page, limit, datosBusqueda]);
  const fetchTipoNivelComerciosFunc = useCallback(() => {
    let obj = {};
    if (parseInt(datosBusqueda.pkTipoNivel))
      obj["pk_tipo_nivel"] = parseInt(datosBusqueda.pkTipoNivel);
    if (datosBusqueda.descripcion)
      obj["descripcion"] = datosBusqueda.descripcion;
    postConsultaTipoNivelComercio({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setTipoNivelComercio(autoArr?.results ?? []);
      })
      .catch((err) => console.error(err));
  }, [page, limit, datosBusqueda]);

  return (
    <Fragment>
      <ButtonBar>
        <Button type='submit' onClick={handleShowModal}>
          Crear tipo nivel comercio
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Tipo nivel comercios'
        maxPage={maxPages}
        headers={["Id", "Descripción"]}
        data={tableTipoNivelComercio}
        onSelectRow={onSelectTipoNivelComercios}
        onSetPageData={setPageData}
        // onChange={onChange}
      >
        <Input
          id='idTipoNivel'
          label='Id tipo nivel comercio'
          type='text'
          name='idTipoNivel'
          minLength='1'
          maxLength='10'
          // required
          value={datosBusqueda.pkTipoNivel}
          onInput={(e) => {
            if (!isNaN(e.target.value)) {
              const num = e.target.value;
              setDatosBusqueda((old) => {
                return { ...old, pkTipoNivel: num };
              });
            }
          }}></Input>
        <Input
          id='descripcionTipoNivel'
          label='Descripción tipo nivel comercio'
          type='text'
          name='descripcionTipoNivel'
          // minLength='1'
          // maxLength='10'
          // required
          value={datosBusqueda.descripcion}
          onInput={(e) => {
            setDatosBusqueda((old) => {
              return { ...old, descripcion: e.target.value };
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
      </Modal>
    </Fragment>
  );
};

export default TipoNivelComercio;
