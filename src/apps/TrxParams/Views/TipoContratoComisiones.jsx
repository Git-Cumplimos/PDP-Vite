import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import Table from "../../../components/Base/Table";
import Pagination from "../../../components/Compound/Pagination";
import useQuery from "../../../hooks/useQuery";
import MultipleSelect from "../../../components/Base/MultipleSelect";
import { notify, notifyError } from "../../../utils/notify";
import {
  fetchTiposContratosComisiones,
  putTiposContratosComisiones,
  postTiposContratosComisiones,
} from "../utils/fetchTiposContratosComisiones";

const TipoContratoComisiones = () => {
  const navigate = useNavigate();
  const [{ nombre_contrato = "", page = 1 }, setQuery] = useQuery();

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setSelectedTipoContrato(null);
    fetchTiposContratosComisionesFunc();
    setVarComisiones({ IVA: false, Rete_Fuente: false, Rete_ICA: false });
    setVarComisionesTemp({ IVA: false, Rete_Fuente: false, Rete_ICA: false });
  }, []);

  const [tiposContrato, setTiposContrato] = useState([]);
  const [selectedTipoContrato, setSelectedTipoContrato] = useState(null);
  const [maxPages, setMaxPages] = useState(0);
  const [varComisiones, setVarComisiones] = useState({
    IVA: false,
    Rete_Fuente: false,
    Rete_ICA: false,
  });
  const [varComisionesTemp, setVarComisionesTemp] = useState({
    IVA: false,
    Rete_Fuente: false,
    Rete_ICA: false,
  });

  const onSelectTipoContrato = useCallback(
    (e, i) => {
      setShowModal(true);
      fetchTiposContratosComisiones({
        id_tipo_contrato: tiposContrato[i]?.["Id contrato"],
      })
        .then((res) => {
          let tempVar = [...res?.results].map(
            ({
              id_tipo_contrato,
              nombre_contrato,
              iva,
              rete_fuente,
              rete_ica,
              created_at,
              estado,
            }) => {
              return {
                "Id contrato": id_tipo_contrato,
                "Nombre contrato": nombre_contrato,
                IVA: iva,
                "Rete Fuente": rete_fuente,
                "Rete ICA": rete_ica,
                Creado: created_at,
                Estado: estado,
              };
            }
          )[0];
          setSelectedTipoContrato(tempVar);
          setVarComisiones({
            IVA: tempVar?.["IVA"] > 0,
            Rete_Fuente: tempVar?.["Rete Fuente"] > 0,
            Rete_ICA: tempVar?.["Rete ICA"] > 0,
          });
          setVarComisionesTemp({
            IVA: tempVar?.["IVA"] > 0,
            Rete_Fuente: tempVar?.["Rete Fuente"] > 0,
            Rete_ICA: tempVar?.["Rete ICA"] > 0,
          });
        })
        .catch((err) => console.error(err));
    },
    [tiposContrato]
  );

  const onChange = useCallback(
    (ev) => {
      if (ev.target.name === "nombre_contrato") {
        setQuery({ nombre_contrato: ev.target.value }, { replace: true });
      }
    },
    [setQuery]
  );

  const onChangeTipoContrato = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Nombre contrato", "IVA", "Rete Fuente", "Rete ICA", "Estado"].forEach(
      (col) => {
        let data = null;
        data = formData.get(col);
        newData.push([col, data]);
      }
    );
    setSelectedTipoContrato((old) => ({
      "Id contrato": old?.["Id contrato"] || -1,
      ...Object.fromEntries(newData),
    }));
  }, []);
  const onChangeMultipleCheck = (obj) => {
    setSelectedTipoContrato((old) => ({
      ...old,
      ["IVA"]: obj?.["IVA"] === true ? "" : 0,
      ["Rete Fuente"]: obj?.["Rete_Fuente"] === true ? "" : 0,
      ["Rete ICA"]: obj?.["Rete_ICA"] === true ? "" : 0,
    }));
    setVarComisionesTemp(obj);
  };

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (
        selectedTipoContrato?.["Id contrato"] &&
        selectedTipoContrato?.["Id contrato"] !== -1
      ) {
        putTiposContratosComisiones(
          { id_tipo_contrato: selectedTipoContrato?.["Id contrato"] },
          {
            nombre_contrato: selectedTipoContrato?.["Nombre contrato"],
            iva: selectedTipoContrato?.["IVA"]
              ? selectedTipoContrato?.["IVA"]
              : 0,
            rete_fuente: selectedTipoContrato?.["Rete Fuente"]
              ? selectedTipoContrato?.["Rete Fuente"]
              : 0,
            rete_ica: selectedTipoContrato?.["Rete ICA"]
              ? selectedTipoContrato?.["Rete ICA"]
              : 0,
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
        postTiposContratosComisiones({
          nombre_contrato: selectedTipoContrato?.["Nombre contrato"],
          iva: selectedTipoContrato?.["IVA"]
            ? selectedTipoContrato?.["IVA"]
            : 0,
          rete_fuente: selectedTipoContrato?.["Rete Fuente"]
            ? selectedTipoContrato?.["Rete Fuente"]
            : 0,
          rete_ica: selectedTipoContrato?.["Rete ICA"]
            ? selectedTipoContrato?.["Rete ICA"]
            : 0,
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
    [selectedTipoContrato]
  );

  useEffect(() => {
    fetchTiposContratosComisionesFunc();
  }, [nombre_contrato, page]);

  const fetchTiposContratosComisionesFunc = () => {
    fetchTiposContratosComisiones({ nombre_contrato, page })
      .then((res) => {
        setTiposContrato(
          [...res?.results].map(
            ({
              id_tipo_contrato,
              nombre_contrato,
              iva,
              rete_fuente,
              rete_ica,
              created_at,
              estado,
            }) => {
              return {
                "Id contrato": id_tipo_contrato,
                "Nombre contrato": nombre_contrato,
                IVA: iva,
                "Rete Fuente": rete_fuente,
                "Rete ICA": rete_ica,
              };
            }
          )
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  return (
    <Fragment>
      <ButtonBar>
        <Button type='submit' onClick={() => setShowModal(true)}>
          Crear contrato de comision
        </Button>
        {/* <Button type="submit" onClick={() => setShowModal(true)}>
          Crear convenio masivo
        </Button> */}
      </ButtonBar>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        <Input
          id='nombre_contrato'
          name='nombre_contrato'
          label={"Buscar contrato comisión"}
          type='text'
          autoComplete='off'
          defaultValue={nombre_contrato}
        />
      </Pagination>
      {Array.isArray(tiposContrato) && tiposContrato.length > 0 ? (
        <Table
          headers={Object.keys(tiposContrato[0])}
          data={tiposContrato}
          onSelectRow={onSelectTipoContrato}
        />
      ) : (
        ""
      )}
      <Modal show={showModal} handleClose={handleClose}>
        <Form onSubmit={onSubmit} onChange={onChangeTipoContrato} grid>
          <Input
            id='Nombre contrato'
            name='Nombre contrato'
            label={"Nombre de contrato"}
            type='text'
            autoComplete='off'
            defaultValue={selectedTipoContrato?.["Nombre contrato"]}
            required
          />
          <MultipleSelect
            label='Opciones de comisiones'
            options={varComisiones}
            onChange={(e) => onChangeMultipleCheck(e)}
          />
          {varComisionesTemp?.["IVA"] && (
            <Input
              id='IVA'
              name='IVA'
              label={"IVA"}
              type='number'
              autoComplete='off'
              step='any'
              defaultValue={selectedTipoContrato?.["IVA"]}
              required
            />
          )}
          {varComisionesTemp?.["Rete_Fuente"] && (
            <Input
              id='Rete Fuente'
              name='Rete Fuente'
              label={"Rete Fuente"}
              type='number'
              step='any'
              autoComplete='off'
              defaultValue={selectedTipoContrato?.["Rete Fuente"]}
              required
            />
          )}
          {varComisionesTemp?.["Rete_ICA"] && (
            <Input
              id='Rete ICA'
              name='Rete ICA'
              label={"Rete ICA"}
              type='number'
              step='any'
              autoComplete='off'
              defaultValue={selectedTipoContrato?.["Rete ICA"]}
              required
            />
          )}
          {!selectedTipoContrato?.["Id contrato"] ||
          selectedTipoContrato?.["Id contrato"] === -1 ? (
            <ButtonBar>
              <Button type='submit'>Crear contrato</Button>
              <Button type='button' onClick={handleClose}>
                Cancelar
              </Button>
            </ButtonBar>
          ) : (
            <Fragment>
              <ButtonBar>
                <Button type='submit'>Editar contrato</Button>
                <Button type='button' onClick={handleClose}>
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

export default TipoContratoComisiones;
