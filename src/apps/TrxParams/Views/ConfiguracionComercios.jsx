import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Select from "../../../components/Base/Select/Select";
import Table from "../../../components/Base/Table/Table";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import TextArea from "../../../components/Base/TextArea/TextArea";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchConfiguracionComercios,
  postConfiguracionComercios,
  putConfiguracionComercios,
} from "../utils/fetchConfiguracionComercios";
import {
  fetchAutorizadores,
  postAutorizadores,
  putAutorizadores,
} from "../utils/fetchRevalAutorizadores";
import { fetchTiposContratosComisiones } from "../utils/fetchTiposContratosComisiones";

const calcularDigitoVerificacion = (myNit) => {
  let vpri, z;

  // Se limpia el Nit
  // Espacios - comas - puntos - guiones
  myNit = myNit.replace(/(\s)|(,)|(\.)|(-)/g, "");

  // Se valida el nit
  if (isNaN(myNit)) {
    notifyError("El nit '" + myNit + "' no es válido(a).");
    return "";
  }

  // Procedimiento
  vpri = [2, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  z = myNit.length;

  let x = 0;
  let y = 0;
  for (let i = 0; i < z; i++) {
    y = myNit.substr(i, 1);
    x += y * vpri[z - i];
  }
  y = x % 11;

  return y > 1 ? 11 - y : y;
};

const ConfiguracionComercios = () => {
  const navigate = useNavigate();
  const [{ searchAuto = "", openTipoContrato = false }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedAuto(null);
    fecthConfiguracionComerciosFunc();
  }, []);
  const [showModal2, setShowModal2] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const handleClose2 = useCallback(() => {
    setShowModal2(false);
    setQuery({ ["openTipoContrato"]: false }, { replace: true });
  }, []);

  const [configuracionComercios, setConfiguracionComercios] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [maxPages, setMaxPages] = useState(0);
  const [data, setdata] = useState([]);

  const tableConfiguracionComercios = useMemo(() => {
    return [
      ...configuracionComercios.map(
        ({
          id_configuracion_comercio,
          id_comercio,
          id_tipo_contrato,
          tipo_pago_comision,
          nombre_contrato,
        }) => {
          return {
            "Id configuracion": id_configuracion_comercio,
            "Id comercio": id_comercio,
            Contrato: nombre_contrato,
            "Pago comision": tipo_pago_comision,
          };
        }
      ),
    ];
  }, [configuracionComercios]);

  const onSelectConfiguracionComercios = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedAuto(tableConfiguracionComercios[i]);
    },
    [tableConfiguracionComercios]
  );

  const onChange = useCallback(
    (ev) => {
      const formData = new FormData(ev.target.form);
      const nameAuto = formData.get("searchAuto");
      setQuery({ searchAuto: nameAuto }, { replace: true });
    },
    [setQuery]
  );
  const onSelectTipoContrato = useCallback(
    (e, i) => {
      setShowModal2(true);
      setSelectedAuto((old) => ({
        ...old,
        "Id contrato": data[i]?.["Id contrato"],
        Contrato: data[i]?.["Contrato"],
      }));
      handleClose2();
    },
    [data, handleClose2]
  );
  const onChangeFormat = useCallback((ev) => {
    setSelectedAuto((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
    });
  }, []);
  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (!selectedAuto?.["Id comercio"]) {
        notifyError("Se debe agregar el id del comercio");
        return;
      }
      if (!selectedAuto?.["Contrato"]) {
        notifyError("Se debe agregar el contrato");
        return;
      }
      if (!selectedAuto?.["Pago comision"]) {
        notifyError("Se debe agregar el pago comisión");
        return;
      }
      if (selectedAuto?.["Id configuracion"]) {
        putConfiguracionComercios(
          { id_configuracion_comercio: selectedAuto?.["Id configuracion"] },
          {
            id_tipo_contrato: selectedAuto?.["Id contrato"],
            tipo_pago_comision: selectedAuto?.["Pago comision"],
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
        postConfiguracionComercios({
          id_comercio: selectedAuto?.["Id comercio"],
          id_tipo_contrato: selectedAuto?.["Id contrato"],
          tipo_pago_comision: selectedAuto?.["Pago comision"],
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
    [selectedAuto]
  );

  useEffect(() => {
    if (!openTipoContrato) {
      fecthConfiguracionComerciosFunc();
    } else {
      fetchTiposContratosComisionesFunc();
    }
  }, [searchAuto, page, limit, openTipoContrato]);
  const fecthConfiguracionComerciosFunc = () => {
    let obj = {};
    if (parseInt(searchAuto))
      obj["id_configuracion_comercios"] = parseInt(searchAuto);
    fetchConfiguracionComercios({ ...obj, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setConfiguracionComercios(autoArr?.results);
      })
      .catch((err) => console.error(err));
  };
  const fetchTiposContratosComisionesFunc = () => {
    fetchTiposContratosComisiones({ page })
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_tipo_contrato, nombre_contrato }) => {
            return {
              "Id contrato": id_tipo_contrato,
              Contrato: nombre_contrato,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <Fragment>
      <ButtonBar>
        <Button
          type='submit'
          onClick={() => {
            setShowModal(true);
            setSelectedAuto({
              "Id comercio": "",
              "Pago comision": "",
            });
          }}>
          Crear configuración comercio
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Comercios configurados'
        maxPage={maxPages}
        headers={[
          "Id configuración",
          "Id comercio",
          "Contrato",
          "Pago comisión",
        ]}
        data={tableConfiguracionComercios}
        onSelectRow={onSelectConfiguracionComercios}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='searchAuto'
          name='searchAuto'
          label={"Id comercio"}
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
            id='Id comercio'
            name='Id comercio'
            label={"Id comercio"}
            type='text'
            autoComplete='off'
            value={selectedAuto?.["Id comercio"]}
            // defaultValue={selectedAuto?.["Id comercio"] ?? ""}
            disabled={selectedAuto?.["Id configuracion"]}
            required
          />
          {selectedAuto?.["Contrato"] && (
            <Input
              id='Contrato'
              name='Contrato'
              label={"Contrato"}
              type='text'
              autoComplete='off'
              value={selectedAuto?.["Contrato"]}
              onChange={() => {}}
              // defaultValue={selectedAuto?.["Contrato"]}
              disabled
            />
          )}
          <Select
            id='Pago comision'
            name='Pago comision'
            label='Pago comision cada:'
            options={{ "": "", Transacción: "Transaccion", Mensual: "Mensual" }}
            value={selectedAuto?.["Pago comision"]}
            onChange={() => {}}
            required
          />
          {!selectedAuto?.["Id configuracion"] ? (
            <ButtonBar>
              <Button type='button' onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setShowModal2(true);
                  setQuery({ ["openTipoContrato"]: true }, { replace: true });
                }}>
                {selectedAuto?.["Contrato"]
                  ? "Editar contrato"
                  : "Agregar contrato"}
              </Button>
              <Button type='submit'>Crear configuración</Button>
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
                    setQuery({ ["openTipoContrato"]: true }, { replace: true });
                  }}>
                  {selectedAuto?.["Contrato"]
                    ? "Editar contrato"
                    : "Agregar contrato"}
                </Button>
                <Button type='submit'>Editar configuración</Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
        <Modal
          show={showModal2}
          handleClose={handleClose2}
          className='flex align-middle'>
          <Fragment>
            <h1 className='text-3xl'>Seleccionar el contrato</h1>
            <Pagination maxPage={maxPages} grid></Pagination>
            {Array.isArray(data) && data.length > 0 && (
              <Table
                headers={Object.keys(data[0])}
                data={data}
                onSelectRow={onSelectTipoContrato}
              />
            )}
          </Fragment>
        </Modal>
      </Modal>
    </Fragment>
  );
};

export default ConfiguracionComercios;
