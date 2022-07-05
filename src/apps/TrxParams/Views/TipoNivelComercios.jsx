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
import { postConsultaTipoNivelComercio } from "../utils/fetchComercios";
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
    pkTipoNivel: null,
    descripcion: "",
  });
  const [datosBusqueda, setDatosBusqueda] = useState({
    pkTipoNivel: null,
    descripcion: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const handleClose = useCallback(() => {
    setShowModal(false);
    selectedTipoNivelComercio({
      pkTipoNivel: null,
      descripcion: "",
    });
    fetchTipoNivelComerciosFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    selectedTipoNivelComercio({
      pkTipoNivel: null,
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
      // if (selectedParam?.nombre_autorizador === "") {
      //   notifyError("Se debe agregar el autorizador");
      //   return;
      // }
      // if (selectedParam?.nombre_parametro === "") {
      //   notifyError("Se debe agregar el nombre del parametro");
      //   return;
      // }
      // if (selectedParam?.valor_parametro === "") {
      //   notifyError("Se debe agregar el valor del parametro");
      //   return;
      // }
      // if (selectedParam?.id_param !== "") {
      //   putParametrosAutorizadores(
      //     {
      //       id_tabla_general_parametros_autorizadores: selectedParam?.id_param,
      //     },
      //     {
      //       nombre_parametro: selectedParam?.nombre_parametro,
      //       valor_parametro: selectedParam?.valor_parametro,
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
      //   postParametrosAutorizadores({
      //     id_autorizador: selectedParam?.id_autorizador,
      //     nombre_parametro: selectedParam?.nombre_parametro,
      //     valor_parametro: selectedParam?.valor_parametro,
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
    [handleClose]
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
        headers={["Id", "descripcion"]}
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
      {/*
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={onChangeFormat} grid>
          <Input
            id='Nombre parametro'
            name='nombre_parametro'
            label={"Nombre parametro"}
            type='text'
            autoComplete='off'
            value={selectedParam.nombre_parametro}
            onChange={() => {}}
            // defaultValue={selectedAuto?.["Id comercio"] ?? ""}
            // disabled={selectedAuto?.["Id configuracion"]}
            required
          />
          <Input
            id='Valor parametro'
            name='valor_parametro'
            label={"Valor parametro"}
            type='text'
            autoComplete='off'
            value={selectedParam.valor_parametro}
            onChange={() => {}}
            // defaultValue={selectedAuto?.["Id comercio"] ?? ""}
            // disabled={selectedAuto?.["Id configuracion"]}
            required
          />
          {selectedParam?.nombre_autorizador && (
            <Input
              id='Nombre autorizador'
              name='Nombre autorizador'
              label={"Nombre autorizador"}
              type='text'
              autoComplete='off'
              value={selectedParam?.nombre_autorizador}
              onChange={() => {}}
              // defaultValue={selectedAuto?.["Contrato"]}
              disabled
            />
          )}
          {!selectedParam?.id_param ? (
            <ButtonBar>
              <Button type='button' onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setShowModal2(true);
                  setQuery({ ["openAutorizador"]: true }, { replace: true });
                }}>
                {selectedParam?.nombre_autorizador
                  ? "Editar autorizador"
                  : "Agregar autorizador"}
              </Button>
              <Button type='submit'>Crear parametro</Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
              </ButtonBar>
              <ButtonBar>
                <Button type='button' onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type='button'
                  onClick={() => {
                    setShowModal2(true);
                    setQuery({ ["openAutorizador"]: true }, { replace: true });
                  }}>
                  {selectedParam?.nombre_autorizador
                    ? "Editar autorizador"
                    : "Agregar autorizador"}
                </Button>
                <Button type='submit'>Editar parametro</Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
        </Modal>
                  */}
    </Fragment>
  );
};

export default TipoNivelComercio;
