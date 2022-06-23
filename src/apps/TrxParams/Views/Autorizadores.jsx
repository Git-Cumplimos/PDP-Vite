import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Table from "../../../components/Base/Table";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import TextArea from "../../../components/Base/TextArea";
import Pagination from "../../../components/Compound/Pagination";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
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

const Autorizadores = () => {
  const navigate = useNavigate();
  const [{ searchAuto = "", openTipoContrato = false }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedAuto(null);
    fecthAutorizadoresFunc();
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

  const [autorizadores, setAutorizadores] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [maxPages, setMaxPages] = useState(0);
  const [data, setdata] = useState([]);

  const tableAutorizadores = useMemo(() => {
    return [
      ...autorizadores.map(
        ({
          id_autorizador,
          nombre_autorizador,
          nit,
          descripcion,
          id_tipo_contrato,
          nombre_contrato,
        }) => {
          return {
            "Id autorizador": id_autorizador,
            Autorizador: nombre_autorizador,
            Nit: nit,
            Descripcion: descripcion,
            Contrato: nombre_contrato,
          };
        }
      ),
    ];
  }, [autorizadores]);

  const onSelectAutorizador = useCallback(
    (e, i) => {
      setShowModal(true);
      setSelectedAuto(tableAutorizadores[i]);
    },
    [tableAutorizadores]
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
    [data, handleClose]
  );
  const formatNit = useCallback((ev) => {
    if (ev.target.name === "Nit") {
      let nitInput = ev.target.value;

      let caret_pos = ev.target.selectionStart;
      const len = ev.target.value.length;

      nitInput = nitInput.replace(/\s/g, ""); // Espacios
      nitInput = nitInput.replace(/,/g, ""); // Comas
      nitInput = nitInput.replace(/\./g, ""); // Puntos
      // nitInput = nitInput.replace(/-/g, ""); // Guiones

      const matches = nitInput.match(/(\d{3})/g);
      let newStr = "";
      if (matches) {
        if (matches[0]) {
          newStr = `${newStr}${matches[0]}.`;
          if (matches[1]) {
            newStr = `${newStr}${matches[1]}.`;
            if (matches[2] && nitInput.match(/(\d{3}-)/g)) {
              newStr = `${newStr}${matches[2]}-${calcularDigitoVerificacion(
                nitInput
              )}`;
            } else {
              newStr = `${newStr}${nitInput.substring(6, 9)}`;
            }
          } else {
            newStr = `${newStr}${nitInput.substring(3)}`;
          }
        }
        ev.target.value = newStr;

        ev.target.focus();
        caret_pos += ev.target.value.length - len;
        ev.target.setSelectionRange(caret_pos, caret_pos);
      }
    }
    setSelectedAuto((old) => {
      return { ...old, [ev.target.name]: ev.target.value };
    });
  }, []);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      console.log(selectedAuto?.["Id contrato"]);
      if (!selectedAuto?.["Id contrato"]) {
        notifyError("Se debe agregar el contrato");
        return;
      }
      if (selectedAuto?.["Id autorizador"]) {
        putAutorizadores(
          { id_autorizador: selectedAuto?.["Id autorizador"] },
          {
            id_tipo_contrato: selectedAuto?.["Id contrato"],
            nombre_autorizador: selectedAuto?.["Autorizador"],
            nit: selectedAuto?.["Nit"],
            descripcion: selectedAuto?.["Descripcion"],
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
        postAutorizadores({
          id_tipo_contrato: selectedAuto?.["Id contrato"],
          nombre_autorizador: selectedAuto?.["Autorizador"],
          nit: selectedAuto?.["Nit"],
          descripcion: selectedAuto?.["Descripcion"],
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
      fecthAutorizadoresFunc();
    } else {
      fetchTiposContratosComisionesFunc();
    }
  }, [searchAuto, page, limit, openTipoContrato]);

  const fecthAutorizadoresFunc = () => {
    fetchAutorizadores({ nombre_autorizador: searchAuto, page, limit })
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setAutorizadores(autoArr?.results);
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
              "Nombre de autorizador": "",
              Nit: "",
              Descripcion: "",
            });
          }}>
          Crear autorizador
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Autorizadores'
        maxPage={maxPages}
        headers={[
          "Id autorizador",
          "Autorizador",
          "Nit",
          "Descripción",
          "Contrato",
        ]}
        data={tableAutorizadores}
        onSelectRow={onSelectAutorizador}
        onSetPageData={setPageData}
        onChange={onChange}>
        <Input
          id='searchAuto'
          name='searchAuto'
          label={"Buscar autorizador"}
          type='text'
          autoComplete='off'
          defaultValue={searchAuto}
        />
      </TableEnterprise>
      {/* {Array.isArray(tableAutorizadores) && tableAutorizadores.length > 0 ? (
        <Table
          headers={Object.keys(tableAutorizadores[0])}
          data={tableAutorizadores}
          onSelectRow={onSelectAutorizador}
        />
      ) : (
        ""
      )} */}
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={formatNit} grid>
          <Input
            id='Autorizador'
            name='Autorizador'
            label={"Nombre de autorizador"}
            type='text'
            autoComplete='off'
            // value={selectedAuto?.["Nombre de autorizador"]}
            defaultValue={selectedAuto?.["Autorizador"]}
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
              // defaultValue={selectedAuto?.["Contrato"]}
              disabled
            />
          )}
          <Input
            id='nitAuto'
            name='Nit'
            label={"Nit"}
            type='text'
            autoComplete='off'
            // value={selectedAuto?.Nit}
            defaultValue={selectedAuto?.Nit}
            required
          />
          <TextArea
            id='textAuto'
            name='Descripcion'
            label={"Descripcion"}
            autoCapitalize='sentences'
            autoComplete='off'
            // value={selectedAuto?.Descripcion ?? ""}
            defaultValue={selectedAuto?.Descripcion ?? ""}
            onChange={() => {}}
          />
          {!selectedAuto?.["Id autorizador"] ? (
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
              <Button type='submit'>Crear autorizador</Button>
            </ButtonBar>
          ) : (
            <Fragment>
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
                <Button type='submit'>Editar autorizador</Button>
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

export default Autorizadores;
