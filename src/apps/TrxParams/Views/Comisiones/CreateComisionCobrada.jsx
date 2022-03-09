import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button";
import MultipleSelect from "../../../../components/Base/MultipleSelect";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Select from "../../../../components/Base/Select";
import { fetchConveniosMany } from "../../utils/fetchRevalConvenios";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import {
  fetchComisionesCobrar,
  postComisionesCobrar,
} from "../../utils/fetchComisionesCobrar";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Pagination from "../../../../components/Compound/Pagination/Pagination";
import Table from "../../../../components/Base/Table/Table";
import Modal from "../../../../components/Base/Modal/Modal";
import Input from "../../../../components/Base/Input/Input";

const initComissionData = {
  type: "",
  ranges: [
    {
      "Rango minimo": 0,
      "Rango maximo": "",
      "Comision porcentual": 0,
      "Comision fija": 0,
    },
  ],
};

const CreateComisionCobrada = () => {
  const navigate = useNavigate();

  const [
    { page = 1, selectedOpt, tipoTrx = "", convenio = "", autorizador = "" },
    setQuery,
  ] = useQuery();

  const [selectecConv, setSelectecConv] = useState(null);
  const [comissionData, setComissionData] = useState(initComissionData);
  const [newComision, setNewComision] = useState({
    "Nombre comision": "",
  });
  const [data, setdata] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setQuery(
      {
        ["selectedOpt"]: "",
        ["tipoTrx"]: "",
        ["autorizador"]: "",
        ["page"]: 1,
      },
      { replace: true }
    );
  }, []);
  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

      // if (!newComision["Convenio"] && !newComision["Tipo de transaccion"]) {
      //   notifyError(
      //     "Se debe agregar al menos un convenio o un tipo de transaccion"
      //   );
      //   return;
      // }
      if (!newComision["Nombre comision"]) {
        notifyError("Se debe agregar el nombre de la comision");
        return;
      }
      if (!newComision["Autorizador"]) {
        notifyError("Se debe agregar el autorizador");
        return;
      }

      if (errRang) {
        notifyError("Se debe agregar al menos una comision");
        return;
      }

      comissionData?.ranges.reduce((prev, curr, indexR) => {
        if (prev?.["Rango maximo"] !== curr?.["Rango minimo"]) {
          notifyError(`El rango maximo debe ser igual al rango minimo siguiente 
            rango de comision (Rango ${indexR} - Rango ${indexR + 1})`);
          errRang = true;
        }
        return curr;
      });

      if (errRang) {
        return;
      }
      let obj = {};
      if (newComision["Nombre comision"]) {
        obj["nombre_comision"] = newComision["Nombre comision"];
      }
      if (newComision["Convenio"]) {
        obj["id_convenio"] = parseInt(newComision["Id convenio"]);
      }
      if (newComision["Tipo de transaccion"]) {
        obj["id_tipo_op"] = parseInt(newComision["Id tipo operacion"]);
      }
      if (newComision["Autorizador"]) {
        obj["id_autorizador"] = parseInt(newComision["Id autorizador"]);
      }
      postComisionesCobrar({
        ...obj,
        comisiones: {
          ...comissionData,
          ranges: comissionData?.ranges.map(
            ({
              "Rango minimo": Minimo,
              "Rango maximo": Maximo,
              "Comision porcentual": Porcentaje,
              "Comision fija": Fija,
            }) => {
              return {
                Minimo,
                Maximo: !Maximo ? -1 : Maximo,
                Porcentaje: Porcentaje / 100,
                Fija,
              };
            }
          ),
        },
      })
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            navigate(-1, { replace: true });
          } else {
            notifyError(res?.msg);
          }
        })
        .catch((err) => console.error(err));
    },
    [comissionData, newComision, navigate]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Enlazado", "Nombre comision"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    let obj = Object.fromEntries(newData);
    if (obj["Enlazado"] === 1) {
      obj["Tipo de transaccion"] = "";
    } else if (obj["Enlazado"] === 2) {
      obj["Convenio"] = "";
    }
    setNewComision((old) => ({
      ...old,
      ...obj,
    }));
  }, []);
  useEffect(() => {
    if (selectedOpt === "convenio") {
      fetchConveniosFunc();
    } else if (selectedOpt === "autorizador") {
      fetchAutorizadoresFunc();
    } else if (selectedOpt === "Tipo de transaccion") {
      fetchTiposTransaccionFunc();
    } else if (selectedOpt === "comision") {
      fecthComisionesCobrarFunc();
    } else {
      setdata([]);
    }
  }, [selectedOpt, page, tipoTrx, convenio, autorizador]);
  const fetchConveniosFunc = () => {
    fetchConveniosMany("")
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_convenio, nombre_convenio }) => {
            return {
              "Id convenio": id_convenio,
              "Nombre convenio": nombre_convenio,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fetchAutorizadoresFunc = () => {
    fetchAutorizadores({ page })
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
  };
  const fetchTiposTransaccionFunc = () => {
    fetchTrxTypesPages("", page)
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_tipo_operacion, Nombre }) => {
            return {
              "Id tipo operacion": id_tipo_operacion,
              "Nombre transaccion": Nombre,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fecthComisionesCobrarFunc = () => {
    let obj = { page };
    if (convenio !== "") obj["nombre_convenio"] = convenio;
    if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    fetchComisionesCobrar(obj)
      .then((res) => {
        setdata(
          [...res?.results].map(
            ({
              id_comision_cobrada,
              nombre_operacion,
              nombre_convenio,
              nombre_autorizador,
            }) => {
              return {
                "Id comision": id_comision_cobrada,
                Transaccion: nombre_operacion,
                Convenio: nombre_convenio,
                Autorizador: nombre_autorizador,
              };
            }
          )
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const onSelectConvenio = useCallback(
    (e, i) => {
      setShowModal(true);
      if (selectedOpt === "convenio") {
        setNewComision((old) => ({
          ...old,
          "Id convenio": data[i]?.["Id convenio"],
          Convenio: data[i]?.["Nombre convenio"],
        }));
      } else if (selectedOpt === "autorizador") {
        setNewComision((old) => ({
          ...old,
          "Id autorizador": data[i]?.["Id autorizador"],
          Autorizador: data[i]?.["Nombre autorizador"],
        }));
      } else if (selectedOpt === "tipoContrato") {
        setNewComision((old) => ({
          ...old,
          "Id contrato": data[i]?.["Id contrato"],
          "Tipo contrato": data[i]?.["Nombre contrato"],
        }));
      } else if (selectedOpt === "Tipo de transaccion") {
        setNewComision((old) => ({
          ...old,
          "Id tipo operacion": data[i]?.["Id tipo operacion"],
          "Tipo de transaccion": data[i]?.["Nombre transaccion"],
        }));
      } else if (selectedOpt === "comision") {
        fetchComisionesCobrar({ id_comision_cobrada: data[i]?.["Id comision"] })
          .then((res) => {
            setComissionData({
              type: res?.results[0]?.comisiones?.type,
              ranges: res?.results?.[0]?.comisiones?.ranges?.map(
                ({ Fija, Maximo, Minimo, Porcentaje }) => {
                  return {
                    "Rango minimo": Minimo,
                    "Rango maximo": Maximo === -1 ? "" : Maximo,
                    "Comision porcentual": parseFloat(Porcentaje * 100),
                    "Comision fija": parseFloat(Fija),
                  };
                }
              ),
            });
          })
          .catch((err) => console.error(err));
      }
      handleClose();
    },
    [data, selectedOpt, handleClose]
  );
  const onChange = useCallback(
    (ev) => setQuery({ [ev.target.name]: ev.target.value }, { replace: true }),
    [setQuery]
  );

  return (
    <Fragment>
      <h1 className='text-3xl'>Crear comisión a cobrar:</h1>
      {/* <SearchComissions comissionFace="pay" onSelectItem={onSelectItem} /> */}
      {selectecConv ? (
        <Fragment>
          <MultipleSelect
            options={{
              [`Convenio: ${selectecConv[0]}) ${selectecConv[1]}`]: true,
            }}
            disabled
          />
        </Fragment>
      ) : (
        ""
      )}
      <Form onChange={onChangeNewComision} grid>
        {newComision?.["Convenio"] && (
          <Input
            id='Convenio'
            name='Convenio'
            label={"Convenio"}
            type='text'
            autoComplete='off'
            onChange={() => {}}
            value={newComision?.["Convenio"]}
            disabled
          />
        )}
        {newComision?.["Autorizador"] && (
          <Input
            id='Autorizador'
            name='Autorizador'
            label={"Autorizador"}
            type='text'
            autoComplete='off'
            onChange={() => {}}
            value={newComision?.["Autorizador"]}
            disabled
          />
        )}
        {newComision?.["Tipo de transaccion"] && (
          <Input
            id='Tipo de transaccion'
            name='Tipo de transaccion'
            label={"Tipo de transaccion"}
            type='text'
            autoComplete='off'
            value={newComision?.["Tipo de transaccion"]}
            onChange={() => {}}
            disabled
          />
        )}
        <Input
          id='Nombre comision'
          name='Nombre comision'
          label={"Nombre comisión"}
          type='text'
          autoComplete='off'
          value={newComision?.["Nombre comision"]}
          onChange={() => {}}
        />
        <Select
          id='Enlazado'
          name='Enlazado'
          label='Enlazado con:'
          options={{ Ninguno: "", Convenio: 1, "Tipo de transaccion": 2 }}
          defaultValue={newComision?.["Enlazado"]}
          required
        />
      </Form>
      <ButtonBar>
        {newComision?.["Enlazado"] == 1 && (
          <Button
            type='button'
            onClick={() => {
              setShowModal(true);
              setQuery({ ["selectedOpt"]: "convenio" }, { replace: true });
            }}>
            {newComision?.["Convenio"] ? "Editar convenio" : "Agregar convenio"}
          </Button>
        )}
        {newComision?.["Enlazado"] == 2 && (
          <Button
            type='button'
            onClick={() => {
              setShowModal(true);
              setQuery(
                { ["selectedOpt"]: "Tipo de transaccion" },
                { replace: true }
              );
            }}>
            {newComision?.["Tipo de transaccion"]
              ? "Editar tipo transacción"
              : "Agregar tipo transacción"}
          </Button>
        )}

        <Button
          type='button'
          onClick={() => {
            setShowModal(true);
            setQuery({ ["selectedOpt"]: "autorizador" }, { replace: true });
          }}>
          {newComision?.["Autorizador"]
            ? "Editar autorizador"
            : "Agregar autorizador"}
        </Button>
        <Button
          type='button'
          onClick={() => {
            setShowModal(true);
            setQuery({ ["selectedOpt"]: "comision" }, { replace: true });
          }}>
          Agregar comisión existente
        </Button>
      </ButtonBar>
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type='submit' onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        {/* {selectedOpt === "convenio" && */}
        <Fragment>
          {selectedOpt === "convenio" ? (
            <h1 className='text-3xl'>Seleccionar convenio</h1>
          ) : selectedOpt === "autorizador" ? (
            <h1 className='text-3xl'>Seleccionar autorizador</h1>
          ) : selectedOpt === "tipoContrato" ? (
            <h1 className='text-3xl'>Seleccionar contrato</h1>
          ) : selectedOpt === "Tipo de transaccion" ? (
            <h1 className='text-3xl'>Seleccionar tipo de transaccion</h1>
          ) : selectedOpt === "comision" ? (
            <h1 className='text-3xl'>Seleccionar comisión</h1>
          ) : (
            ""
          )}
          <Pagination maxPage={maxPages} onChange={onChange} grid>
            {selectedOpt === "comision" && (
              <>
                <Input
                  id={"convenioComissions"}
                  label={"Convenio"}
                  name={"convenio"}
                  type={"text"}
                  autoComplete='off'
                  defaultValue={convenio}
                />
                <Input
                  id={"tipoTrx"}
                  label={"Tipo de operación"}
                  name={"tipoTrx"}
                  type={"text"}
                  autoComplete='off'
                  defaultValue={tipoTrx}
                />
                <Input
                  id={"autorizadorComissions"}
                  label={"Autorizador"}
                  name={"autorizador"}
                  type={"text"}
                  autoComplete='off'
                  defaultValue={autorizador}
                />
              </>
            )}
          </Pagination>
          {Array.isArray(data) && data.length > 0 && (
            <Table
              headers={Object.keys(data[0])}
              data={data}
              onSelectRow={onSelectConvenio}
            />
          )}
        </Fragment>
      </Modal>
    </Fragment>
  );
};

export default CreateComisionCobrada;
