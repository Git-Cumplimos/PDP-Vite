import React, { useState, useCallback, useEffect } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Modal from "../../../components/Base/Modal";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Select from "../../../components/Base/Select";
import Fieldset from "../../../components/Base/Fieldset";
import TableEnterprise from "../../../components/Base/TableEnterprise";
import { crearCompañia, buscarCompañias } from "../utils/fetchCaja";
import { notify, notifyError } from "../../../utils/notify";

const ParametrizacionRecaudo = () => {
  const [pageData, setPageData] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [type, setType] = useState("");
  const [maxpages, setMaxPages] = useState(2);
  const [data, setData] = useState([]);
  const [compañia, setCompañia] = useState("");

  const closeModal = () => {
    setShowModal(false);
    setNombre("");
    setType("");
  };

  const compañias = useCallback(() => {
    const queries = { ...pageData };
    if (compañia !== "") {
      queries.nombre_compañia = compañia;
    }
    buscarCompañias(queries)
      .then((res) => {
        console.log(res);
        setMaxPages(res?.obj?.maxPages);
        setData(res?.obj?.results);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [pageData, compañia]);

  useEffect(() => {
    compañias();
  }, [compañias, maxpages]);

  const crearCuenta = (e) => {
    e.preventDefault();
    const data = { nombre_compañia: nombre, tipo: parseInt(type) };
    if (nombre === "") {
      notifyError("Ingrese nombre");
    } else {
      crearCompañia(data)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            setShowModal(false);
            setNombre("");
            setType("");
          } else {
            notifyError("Usuario ya existe en la base de datos");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  console.log(maxpages);
  return (
    <>
      <ButtonBar>
        <Button type="submit" onClick={() => setShowModal(true)}>
          Crear cuenta
        </Button>
      </ButtonBar>
      <TableEnterprise
        title="Bancos/Transportadoras"
        headers={["Id", "Compañia"]}
        maxPage={maxpages}
        onSetPageData={setPageData}
        data={data?.map(({ id_registro, nombre_compañia }) => {
          return { id_registro, nombre_compañia };
        })}
      >
        <Input
          id="convenio"
          name="convenio"
          label={"Compañia"}
          type="text"
          autoComplete="off"
          value={compañia.toUpperCase()}
          onChange={(e) => {
            setCompañia(e.target.value.toUpperCase());
          }}
        />
      </TableEnterprise>
      <Modal show={showModal} handleClose={closeModal}>
        <Form>
          <Select
            id="searchByType"
            name="tipoComp"
            label="Tipo"
            options={[
              { value: 0, label: "" },
              { value: 1, label: "Bancos" },
              { value: 2, label: "Transportadora" },
            ]}
            onChange={(e) => {
              setType(e.target.value);
            }}
          />
          {type === "1" ? (
            <Fieldset legend={"Registrar transportadora"}>
              <Input
                label={"Nombre transportadora"}
                onChange={(e) => {
                  setNombre(e.target.value.toUpperCase());
                }}
                required
              ></Input>
            </Fieldset>
          ) : type === "2" ? (
            <h1>Sin acceso</h1>
          ) : (
            <></>
          )}
          {type === "1" && (
            <>
              <ButtonBar>
                <Button type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                {type === "2" && (
                  <Button type="button" onClick={closeModal}>
                    Agregar cuenta
                  </Button>
                )}
                <Button
                  type="submit"
                  onClick={(e) => {
                    crearCuenta(e);
                  }}
                >
                  Crear
                </Button>
              </ButtonBar>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ParametrizacionRecaudo;
