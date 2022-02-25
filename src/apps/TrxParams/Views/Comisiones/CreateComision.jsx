import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button/Button";
import MultipleSelect from "../../../../components/Base/MultipleSelect/MultipleSelect";
import { postComission } from "../../utils/fetchRevalComissions";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form/Form";
import Select from "../../../../components/Base/Select/Select";
import Input from "../../../../components/Base/Input/Input";
import { fetchTiposContratosComisiones } from "../../utils/fetchTiposContratosComisiones";
import { fetchConveniosMany } from "../../utils/fetchRevalConvenios";
import { postComisionesPagar } from "../../utils/fetchComisionesPagar";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import Modal from "../../../../components/Base/Modal/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar/ButtonBar";
import Table from "../../../../components/Base/Table/Table";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";
import Pagination from "../../../../components/Compound/Pagination/Pagination";

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

const CreateComision = () => {
  const navigate = useNavigate();

  const [
    {
      comercios_id_comercio,
      convenios_id_convenio,
      comercio,
      page = 1,
      selectedOpt,
    },
    setQuery,
  ] = useQuery();

  const [selectecConv, setSelectecConv] = useState(null);
  const [comissionData, setComissionData] = useState(initComissionData);
  const [newComision, setNewComision] = useState([]);
  const [tiposContratosComisiones, setTiposContratosComisiones] = useState([]);
  const [data, setdata] = useState([]);
  const [autorizadores, setAutorizadores] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setQuery({ ["page"]: 1 }, { replace: true });
  }, []);

  const onSelectItem = useCallback(
    (selected) => setSelectecConv(selected.Convenio),
    []
  );

  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;

      if (
        !newComision["Convenio"] &&
        !newComision["Tipo de transaccion"] &&
        !newComision["Id comercio"]
      ) {
        notifyError(
          "Se debe agregar al menos un convenio o un tipo de transaccion o un id de comercio"
        );
        return;
      }
      if (!newComision["Tipo contrato"]) {
        notifyError("Se debe agregar el tipo de contrato");
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
        if (prev?.["Rango maximo"] > curr?.["Rango minimo"]) {
          notifyError(`El rango maximo de un rango comision no puede 
            ser mayor al rango minimo del siguiente 
            rango de comision (Rango ${indexR} - Rango ${indexR + 1})`);
          errRang = true;
        }
        return curr;
      });

      if (errRang) {
        return;
      }
      let obj = {};
      if (parseInt(newComision["Id comercio"])) {
        obj["id_comercio"] = parseInt(newComision["Id comercio"]);
      }
      if (parseInt(newComision["Autorizador"])) {
        obj["id_autorizador"] = parseInt(newComision["Autorizador"]);
      }
      if (parseInt(newComision["Convenio"])) {
        obj["id_convenio"] = parseInt(newComision["Convenio"]);
      }
      if (parseInt(newComision["Tipo de transaccion"])) {
        obj["id_tipo_op"] = parseInt(newComision["Tipo de transaccion"]);
      }
      if (parseInt(newComision["Tipo contrato"])) {
        obj["id_tipo_contrato"] = parseInt(newComision["Tipo contrato"]);
      }
      if (newComision["Fecha inicio"] !== "") {
        obj["fecha_inicio"] = newComision["Fecha inicio"];
      }
      if (newComision["Fecha fin"] !== "") {
        obj["fecha_fin"] = newComision["Fecha fin"];
      }
      postComisionesPagar({
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
    [
      "Convenio",
      "Tipo de transaccion",
      "Tipo contrato",
      "Id comercio",
      "Fecha inicio",
      "Fecha fin",
      "Autorizador",
    ].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
    setNewComision((old) => ({
      ...Object.fromEntries(newData),
    }));
  }, []);

  useEffect(() => {
    if (selectedOpt === "convenio") {
      fetchConveniosFunc();
    } else if (selectedOpt === "autorizador") {
      fetchAutorizadoresFunc();
    } else if (selectedOpt === "tipoContrato") {
      fetchTiposContratosComisionesFunc();
    } else if (selectedOpt === "Tipo de transaccion") {
      fetchTiposTransaccionFunc();
    }
  }, [selectedOpt, page]);
  const fetchTiposContratosComisionesFunc = () => {
    fetchTiposContratosComisiones({ page })
      .then((res) => {
        setdata(
          [...res?.results].map(({ id_tipo_contrato, nombre_contrato }) => {
            return {
              "Id contrato": id_tipo_contrato,
              "Nombre contrato": nombre_contrato,
            };
          })
        );
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
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
  const onSelectConvenio = useCallback(
    (e, i) => {
      setShowModal(true);
      if (selectedOpt === "convenio") {
        setNewComision((old) => {
          return { ...old, "Id convenio": data[i]?.["Id convenio"] };
        });
        console.log(newComision);
        console.log(data[i]?.["Id convenio"]);
      } else if (selectedOpt === "autorizador") {
        console.log(data[i]?.["Id autorizador"]);
      } else if (selectedOpt === "tipoContrato") {
        console.log(data[i]?.["Id contrato"]);
      } else if (selectedOpt === "Tipo de transaccion") {
        console.log(data[i]?.["Id tipo operacion"]);
      }
      handleClose();
    },
    [data, newComision, data]
  );
  return (
    <Fragment>
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
            defaultValue={newComision?.["Convenio"]}
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
            defaultValue={newComision?.["Autorizador"]}
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
            defaultValue={newComision?.["Tipo de transaccion"]}
            disabled
          />
        )}
        {newComision?.["Tipo contrato"] && (
          <Input
            id='Tipo contrato'
            name='Tipo contrato'
            label={"Tipo contrato"}
            type='text'
            autoComplete='off'
            defaultValue={newComision?.["Tipo contrato"]}
            disabled
          />
        )}
        <Input
          id='Id comercio'
          name='Id comercio'
          label={"Id comercio"}
          type='text'
          autoComplete='off'
          defaultValue={newComision?.["Id comercio"]}
        />
        <Input
          id='Fecha inicio'
          name='Fecha inicio'
          label={"Fecha inicio"}
          type='date'
          autoComplete='off'
          defaultValue={newComision?.["Fecha inicio"]}
        />
        <Input
          id='Fecha fin'
          name='Fecha fin'
          label={"Fecha fin"}
          type='date'
          autoComplete='off'
          defaultValue={newComision?.["Fecha fin"]}
        />
      </Form>
      <ButtonBar>
        <Button
          type='button'
          onClick={() => {
            setShowModal(true);
            setQuery({ ["selectedOpt"]: "convenio" }, { replace: true });
          }}>
          {newComision?.["Id comercio"]
            ? "Edicar convenio"
            : "Agregar convenio"}
        </Button>
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
            setQuery({ ["selectedOpt"]: "tipoContrato" }, { replace: true });
          }}>
          {newComision?.["Tipo contrato"]
            ? "Editar contrato"
            : "Agregar contrato"}
        </Button>
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
          ) : (
            ""
          )}
          <Pagination maxPage={maxPages} grid></Pagination>
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

export default CreateComision;
