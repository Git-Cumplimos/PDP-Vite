import { Fragment, useCallback, useEffect, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { fetchConveniosUnique } from "../../utils/fetchRevalConvenios";
import {
  fetchComisionesPagar,
  postComisionesPagar,
} from "../../utils/fetchComisionesPagar";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import Modal from "../../../../components/Base/Modal";
import ButtonBar from "../../../../components/Base/ButtonBar";
import { fetchTrxTypesPages } from "../../utils/fetchTiposTransacciones";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import TagsAlongSide from "../../../../components/Base/TagsAlongSide";
import Select from "../../../../components/Base/Select";

// const initComissionData = {
//   type: "trx",
//   ranges: [
//     {
//       "Rango minimo": 0,
//       "Rango maximo": 0,
//       "Comision porcentual": 0,
//       "Comision fija": 0,
//     },
//   ],
// };

const CreateAssigns = () => {
  const navigate = useNavigate();

  const [
    {
      tipoTrx = "",
      comercio = "",
      convenio = "",
      autorizador = "",
      selectedOpt,
    },
    setQuery,
  ] = useQuery();

  const [headersTable, setHeadersTable] = useState([]);
  const [transactionType, setTransactionType] = useState([]);
  const [idComercios, setIdComercios] = useState([]);
  const [comissionData, setComissionData] = useState({
    type: "trx",
    ranges: [
      {
        "Rango minimo": 0,
        "Rango maximo": 0,
        "Comision porcentual": 0,
        "Comision fija": 0,
      },
    ],
  });
  const [newComision, setNewComision] = useState({
    "Id comercio": "",
    "Nombre comision": "",
    "Fecha inicio": "",
    "Fecha fin": "",
  });
  const [data, setdata] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
    setQuery(
      {
        ["selectedOpt"]: "",
        ["tipoTrx"]: "",
        ["comercio"]: "",
        ["autorizador"]: "",
      },
      { replace: true }
    );
  }, []);
  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();

      let errRang = comissionData?.ranges?.length === 0;
      setNewComision({
        ...newComision,
        "Tipo de transaccion": transactionType,
      });

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
      if (newComision["Nombre comision"] === "") {
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
      if (newComision["Fecha fin"] !== "") {
        if (newComision["Fecha inicio"] !== "") {
          if (
            new Date(newComision["Fecha fin"]) <=
            new Date(newComision["Fecha inicio"])
          ) {
            notifyError("La fecha final debe ser mayor a la inicial");
            return;
          }
        } else {
          notifyError("Debe existir una fecha inicial");
          return;
        }
      }

      comissionData?.ranges.reduce((prev, curr, indexR) => {
        if (!(prev?.["Rango maximo"] + 1 === curr?.["Rango minimo"])) {
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
      if (newComision["Nombre comision"]) {
        obj["nombre_comision"] = newComision["Nombre comision"];
      }
      if (idComercios?.length > 0) {
        obj["id_comercios"] = idComercios;
      }
      if (newComision["Autorizador"]) {
        obj["id_autorizador"] = parseInt(newComision["Id autorizador"]);
      }
      if (newComision["Convenio"]) {
        obj["id_convenio"] = parseInt(newComision["Id convenio"]);
      }
      if (newComision["Tipo de transaccion"]) {
        obj["id_tipo_op"] = parseInt(newComision["Id tipo operacion"]);
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
    [comissionData, newComision, idComercios, navigate]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Id comercio", "Fecha inicio", "Fecha fin", "Nombre comision"].forEach(
      (col) => {
        let data = null;
        data = formData.get(col);
        newData.push([col, data]);
      }
    );
    setNewComision((old) => ({
      ...old,
      ...Object.fromEntries(newData),
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
      fecthComisionesPagarFunc();
    } else {
      setdata([]);
    }
  }, [selectedOpt, page, tipoTrx, comercio, convenio, autorizador]);
  const fetchConveniosFunc = useCallback(() => {
    fetchConveniosUnique({ tags: "", page, limit })
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
      .catch((err) => {
        notifyError("No se ha podido conectar al servidor");
        console.error(err);
      });
  }, [page, limit]);
  // const fetchConveniosFunc = () => {
  //   fetchConveniosMany({ tags: "", page })
  //     .then((res) => {
  //       setdata(
  //         [...res?.results].map(({ id_convenio, nombre_convenio }) => {
  //           return {
  //             "Id convenio": id_convenio,
  //             "Nombre convenio": nombre_convenio,
  //           };
  //         })
  //       );
  //       setMaxPages(res?.maxPages);
  //     })
  //     .catch((err) => console.error(err));
  // };
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
  const fecthComisionesPagarFunc = () => {
    let obj = { page };
    if (convenio !== "") obj["nombre_convenio"] = convenio;
    if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    if (comercio !== "") obj["id_comercio"] = parseInt(comercio);
    fetchComisionesPagar(obj)
      .then((res) => {
        setdata(
          [...res?.results].map(
            ({
              id_comision_pagada,
              id_comercio,
              nombre_operacion,
              nombre_convenio,
              nombre_autorizador,
            }) => {
              return {
                "Id comision": id_comision_pagada,
                Transaccion: nombre_operacion,
                Comercio: id_comercio,
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
      } else if (selectedOpt === "Tipo de transaccion") {
        setNewComision((old) => ({
          ...old,
          "Id tipo operacion": data[i]?.["Id tipo operacion"],
          "Tipo de transaccion": data[i]?.["Nombre transaccion"],
        }));
      } else if (selectedOpt === "comision") {
        fetchComisionesPagar({ id_comision_pagada: data[i]?.["Id comision"] })
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
  const addComercio = useCallback(
    (ev) => {
      ev.preventDefault();

      if (
        !idComercios.find((a) => a === newComision["Id comercio"]) &&
        newComision["Id comercio"] !== ""
      ) {
        setIdComercios((old) => {
          return [...old, newComision["Id comercio"]];
        });
      }
    },
    [newComision, idComercios]
  );
  const onSelectComercio = useCallback(
    (e, i) => {
      let temp = [...idComercios];
      temp?.splice(i, 1);
      setIdComercios(temp);
    },
    [idComercios]
  );

  return (
    <Fragment>
      <h1 className='text-3xl'>Configuración:</h1>
      <Select
        id='tipo_transaccion'
        name='tipo_transaccion'
        label='Tipo de transacción'
        options={{ Cobrar: "cobrar", Pagar: "pagar" }}
        value={transactionType}
        onChange={() => {
          setTransactionType(transactionType === "cobrar" ? "cobrar" : "pagar");
        }}
        // defaultValue={comissionData?.type}
        required
      />
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
          <TableEnterprise
            title={
              selectedOpt === "convenio"
                ? "Seleccionar convenio"
                : selectedOpt === "autorizador"
                ? "Seleccionar autorizador"
                : selectedOpt === "Tipo de transaccion"
                ? "Seleccionar tipo de transacción"
                : selectedOpt === "comision"
                ? "Seleccionar comisión"
                : ""
            }
            maxPage={maxPages}
            headers={headersTable}
            data={data}
            onSelectRow={onSelectConvenio}
            onSetPageData={setPageData}
            onChange={onChange}>
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
                  id={"comercioComissions"}
                  label={"Id comercio"}
                  name={"comercio"}
                  type='number'
                  step={"1"}
                  autoComplete='off'
                  defaultValue={comercio}
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
          </TableEnterprise>
        </Fragment>
      </Modal>
    </Fragment>
  );
};

export default CreateAssigns;
