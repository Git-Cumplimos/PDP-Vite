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
  fetchParametrosAutorizadores,
  postParametrosAutorizadores,
  putParametrosAutorizadores,
} from "../utils/fetchParametrosAutorizadores";
import { fetchAutorizadores } from "../utils/fetchRevalAutorizadores";

const ParametrosAutorizadores = () => {
  const [{ searchAuto = "", openAutorizador = false }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedParam({
      id_param: "",
      nombre_parametro: "",
      valor_parametro: "",
      id_autorizador: "",
      nombre_autorizador: "",
    });
    fetchParametrosAutorizadoresFunc();
  }, []);
  const handleShowModal = useCallback(() => {
    setShowModal(true);
    setSelectedParam({
      id_param: "",
      nombre_parametro: "",
      valor_parametro: "",
      id_autorizador: "",
      nombre_autorizador: "",
    });
  }, []);
  const [showModal2, setShowModal2] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const handleClose2 = useCallback(() => {
    setShowModal2(false);
    setQuery({ ["openAutorizador"]: false }, { replace: true });
  }, []);

  const [parametrosAutorizadores, setParametrosAutorizadores] = useState([]);
  const [selectedParam, setSelectedParam] = useState({
    id_param: "",
    nombre_parametro: "",
    valor_parametro: "",
    id_autorizador: "",
    nombre_autorizador: "",
  });
  const [maxPages, setMaxPages] = useState(0);
  const [data, setdata] = useState([]);

  const tableParametrosAutorizadores = useMemo(() => {
    return [
      ...parametrosAutorizadores.map(
        ({
          id_tabla_general_parametros_autorizadores,
          id_autorizador,
          nombre_parametro,
          valor_parametro,
          nombre_autorizador,
        }) => {
          return {
            "Id parametro": id_tabla_general_parametros_autorizadores,
            "Nombre parametro": nombre_parametro,
            "Valor parametro": valor_parametro,
            "Nombre autorizador": nombre_autorizador,
          };
        }
      ),
    ];
  }, [parametrosAutorizadores]);

  const onSelectParametrosAutorizadores = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedParam({
        id_param: tableParametrosAutorizadores[i]?.["Id parametro"],
        nombre_parametro: tableParametrosAutorizadores[i]?.["Nombre parametro"],
        valor_parametro: tableParametrosAutorizadores[i]?.["Valor parametro"],
        id_autorizador: "",
        nombre_autorizador:
          tableParametrosAutorizadores[i]?.["Nombre autorizador"],
      });
    },
    [tableParametrosAutorizadores]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameAuto = formData.get("searchAuto");
      setQuery({ searchAuto: nameAuto }, { replace: true });
    },
    [setQuery]
  );
  const onChangeFormat = useCallback((ev) => {
    setSelectedParam((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
    });
  }, []);
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (selectedParam?.nombre_autorizador === "") {
        notifyError("Se debe agregar el autorizador");
        return;
      }
      if (selectedParam?.nombre_parametro === "") {
        notifyError("Se debe agregar el nombre del parametro");
        return;
      }
      if (selectedParam?.valor_parametro === "") {
        notifyError("Se debe agregar el valor del parametro");
        return;
      }
      if (selectedParam?.id_param !== "") {
        putParametrosAutorizadores(
          {
            id_tabla_general_parametros_autorizadores: selectedParam?.id_param,
          },
          {
            nombre_parametro: selectedParam?.nombre_parametro,
            valor_parametro: selectedParam?.valor_parametro,
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
        postParametrosAutorizadores({
          id_autorizador: selectedParam?.id_autorizador,
          nombre_parametro: selectedParam?.nombre_parametro,
          valor_parametro: selectedParam?.valor_parametro,
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
    [selectedParam, handleClose]
  );

  useEffect(() => {
    if (openAutorizador) {
      fetchAutorizadoresFunc();
    } else {
      fetchParametrosAutorizadoresFunc();
    }
  }, [searchAuto, page, limit, openAutorizador]);
  const fetchParametrosAutorizadoresFunc = useCallback(() => {
    let obj = {};
    if (parseInt(searchAuto))
      obj["id_tabla_general_parametros_autorizadores"] = parseInt(searchAuto);
    fetchParametrosAutorizadores({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setParametrosAutorizadores(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, [page, limit, searchAuto]);
  const fetchAutorizadoresFunc = useCallback(() => {
    fetchAutorizadores({ page, limit })
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_autorizador, nombre_autorizador }) => {
            return {
              "Id autorizador": id_autorizador,
              "Nombre autorizador": nombre_autorizador,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  }, [page, limit]);
  const onSelectAutorizador = useCallback(
    (e, i) => {
      setSelectedParam((old) => ({
        ...old,
        id_autorizador: data[i]?.["Id autorizador"],
        nombre_autorizador: data[i]?.["Nombre autorizador"],
      }));
      handleClose2();
    },
    [data, handleClose2]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button type='submit' onClick={handleShowModal}>
          Crear parametro de autorizador
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Prametros de autorizadores'
        maxPage={maxPages}
        headers={[
          "Id parametro",
          "Nombre parametro",
          "Valor parametro",
          "Nombre autorizador",
        ]}
        data={tableParametrosAutorizadores}
        onSelectRow={onSelectParametrosAutorizadores}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='searchAuto'
          name='searchAuto'
          label={"Id parametro"}
          type='number'
          autoComplete='off'
          defaultValue={searchAuto}
        />
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
                {/* <Button
                  type='button'
                  onClick={() => {
                    const urlParams = new URLSearchParams();
                    urlParams.append(
                      "autorizador_id_autorizador",
                      selectedAuto?.["Id autorizador"]
                    );
                    urlParams.append(
                      "nombre_autorizador",
                      JSON.stringify(selectedAuto?.["Nombre de autorizador"])
                    );
                    navigate(
                      `/trx-params/comisiones/cobradas?${urlParams.toString()}`
                    );
                  }}>
                  Editar comisiones a cobrar
                </Button> */}
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
        <Modal
          show={showModal2}
          handleClose={handleClose2}
          className='flex align-middle'>
          <TableEnterprise
            title='Autorizadores'
            maxPage={maxPages}
            headers={["Id autorizador", "Autorizador"]}
            data={data}
            onSelectRow={onSelectAutorizador}
            onSetPageData={setPageData}
            onChange={onChange}></TableEnterprise>
        </Modal>
      </Modal>
    </Fragment>
  );
};

export default ParametrosAutorizadores;
