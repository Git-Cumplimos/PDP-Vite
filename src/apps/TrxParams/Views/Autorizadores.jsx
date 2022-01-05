import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button/Button";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import Form from "../../../components/Base/Form/Form";
import Input from "../../../components/Base/Input/Input";
import Modal from "../../../components/Base/Modal/Modal";
import Table from "../../../components/Base/Table/Table";
import TextArea from "../../../components/Base/TextArea/TextArea";
import Pagination from "../../../components/Compound/Pagination/Pagination";
import useQuery from "../../../hooks/useQuery";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchAutorizadores,
  postAutorizadores,
  putAutorizadores,
} from "../utils/fetchRevalAutorizadores";

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
  const [{ searchAuto = "", page = 1 }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedAuto(null);
  }, []);

  const [autorizadores, setAutorizadores] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [maxPages, setMaxPages] = useState(0);

  const tableAutorizadores = useMemo(() => {
    return [
      ...autorizadores.map(
        ({ id_autorizador, nombre_autorizador, nit, descripcion }) => {
          return {
            "Id autorizador": id_autorizador,
            "Nombre de autorizador": nombre_autorizador,
            Nit: nit,
            Descripcion: descripcion,
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

      if (selectedAuto?.["Id autorizador"]) {
        putAutorizadores(
          { id_autorizador: selectedAuto?.["Id autorizador"] },
          {
            nombre_autorizador: selectedAuto?.["Nombre de autorizador"],
            nit: selectedAuto?.["Nit"],
            descripcion: selectedAuto?.["Descripcion"],
          }
        )
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              setShowModal(false);
            } else {
              notifyError(res?.msg);
            }
          })
          .catch((err) => console.error(err));
      } else {
        postAutorizadores({
          nombre_autorizador: selectedAuto?.["Nombre de autorizador"],
          nit: selectedAuto?.["Nit"],
          descripcion: selectedAuto?.["Descripcion"],
          comision_cobrada: {
            type: "monto",
            ranges: [{ Minimo: 0, Maximo: -1, Porcentaje: 0, Fija: 0 }],
          },
        })
          .then((res) => {
            if (res?.status) {
              notify(res?.msg);
              setShowModal(false);
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
    fetchAutorizadores(searchAuto, page)
      .then((autoArr) => {
        setMaxPages(autoArr?.maxPages);
        setAutorizadores(autoArr?.results);
      })
      .catch((err) => console.error(err));
  }, [searchAuto, page]);

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() => {
            setShowModal(true);
            setSelectedAuto({
              "Nombre de autorizador": "",
              Nit: "",
              Descripcion: "",
            });
          }}
        >
          Crear autorizador
        </Button>
      </ButtonBar>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        <Input
          id="searchAuto"
          name="searchAuto"
          label={"Buscar autorizador"}
          type="text"
          autoComplete="off"
          defaultValue={searchAuto}
        />
        <ButtonBar></ButtonBar>
      </Pagination>
      {Array.isArray(tableAutorizadores) && tableAutorizadores.length > 0 ? (
        <Table
          headers={Object.keys(tableAutorizadores[0])}
          data={tableAutorizadores}
          onSelectRow={onSelectAutorizador}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={formatNit} grid>
          <Input
            id="nameAuto"
            name="Nombre de autorizador"
            label={"Nombre de autorizador"}
            type="text"
            autoComplete="off"
            value={selectedAuto?.["Nombre de autorizador"]}
            onChange={() => {}}
            defaultValue=""
            required
          />
          <Input
            id="nitAuto"
            name="Nit"
            label={"Nit"}
            type="text"
            autoComplete="off"
            value={selectedAuto?.Nit}
            onChange={() => {}}
            defaultValue=""
            required
          />
          <TextArea
            id="textAuto"
            name="Descripcion"
            label={"Descripcion"}
            autoCapitalize="sentences"
            autoComplete="off"
            value={selectedAuto?.Descripcion ?? ""}
            onChange={() => {}}
            defaultValue=""
          />
          {!selectedAuto?.["Id autorizador"] ? (
            <ButtonBar>
              <Button type="submit">Crear autorizador</Button>
              <Button type="button" onClick={handleClose}>
                Cancelar
              </Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
                <Button
                  type="button"
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
                  }}
                >
                  Editar comisiones a cobrar
                </Button>
              </ButtonBar>
              <ButtonBar>
                <Button type="submit">Editar autorizador</Button>
                <Button type="button" onClick={handleClose}>
                  Cancelar
                </Button>
              </ButtonBar>
            </Fragment>
          )}
        </Form>
      </Modal>
    </Fragment>
  );
};

export default Autorizadores;
