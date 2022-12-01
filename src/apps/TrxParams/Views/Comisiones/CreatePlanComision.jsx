import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Button from "../../../../components/Base/Button";
import FormComission from "../../components/FormComission/FormComission";
import { notify, notifyError } from "../../../../utils/notify";
import { useNavigate } from "react-router-dom";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import { fetchConveniosUnique } from "../../utils/fetchRevalConvenios";
import {
  getComisionesPlanes,
  postComisionesPlan,
} from "../../utils/fetchComisionesPlanes";
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

const CreatePlanComision = () => {
  const navigate = useNavigate();

  const comisionTypeRef = useRef();
  const comisionNameRef = useRef();

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
    "Tipo de comision": "",
    "Nombre plan de comision": "",
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

      // if (
      //   !newComision["Convenio"] &&
      //   !newComision["Tipo de transaccion"] &&
      //   !newComision["Id comercio"]
      // ) {
      //   notifyError(
      //     "Se debe agregar al menos un convenio o un tipo de transaccion o un id de comercio"
      //   );
      //   return;
      // }
      // if (newComision["Nombre comision"] === "") {
      //   notifyError("Se debe agregar el nombre de la comision");
      //   return;
      // }
      // if (!newComision["Autorizador"]) {
      //   notifyError("Se debe agregar el autorizador");
      //   return;
      // }

      // if (errRang) {
      //   notifyError("Se debe agregar al menos una comision");
      //   return;
      // }
      // if (newComision["Fecha fin"] !== "") {
      //   if (newComision["Fecha inicio"] !== "") {
      //     if (
      //       new Date(newComision["Fecha fin"]) <=
      //       new Date(newComision["Fecha inicio"])
      //     ) {
      //       notifyError("La fecha final debe ser mayor a la inicial");
      //       return;
      //     }
      //   } else {
      //     notifyError("Debe existir una fecha inicial");
      //     return;
      //   }
      // }

      comissionData?.ranges.reduce((prev, curr, indexR) => {
        if (
          !(parseInt(prev?.["Rango maximo"]) + 1 === curr?.["Rango minimo"])
        ) {
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
      if (newComision["Tipo de comision"]) {
        // obj["tipo_comision"] = newComision["Tipo de comision"];
      }
      if (newComision["Nombre plan de comision"]) {
        obj["nombre_plan_comision"] = newComision["Nombre plan de comision"];
      }
      // if (comissionData) {
      //   obj["comisiones"] = comissionData;
      // }
      // console.log("obj", obj);
      postComisionesPlan({
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
          // console.log("res", res);
          if (res?.status === false) {
            notifyError(`Error al crear la comision. Error: ${res?.msg}`);
            // navigate("/comisiones");
          } else {
            notify(`${res?.msg}`);
          }
          // navigate("/comisiones/planes");
        })
        // .then((res) => {
        //   if (res?.status) {
        //     notify(res?.msg);
        //     navigate(-1, { replace: true });
        //   } else {
        //     notifyError(res?.msg);
        //   }
        // })
        .catch((err) => console.error(err));
    },
    [comissionData, newComision, idComercios, navigate]
  );
  const onChangeNewComision = useCallback((ev) => {
    const formData = new FormData(ev.target.form);
    const newData = [];
    ["Nombre plan de comision"].forEach((col) => {
      let data = null;
      data = formData.get(col);
      newData.push([col, data]);
    });
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
    // if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    if (comercio !== "") obj["id_comercio"] = parseInt(comercio);
    getComisionesPlanes(obj)
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

  return (
    <Fragment>
      <h1 className="text-3xl">Crear plan de comisión:</h1>
      <Form onChange={onChangeNewComision}>
        {/* <Select
          name="Tipo de comision"
          label="Tipo de comision"
          options={{ NA: "", Cobrar: "COBRAR", Pagar: "PAGAR" }}
          value={newComision?.["Tipo de comision"]}
          onChange={() => {}}
          // defaultValue={""}
        /> */}
        <Input
          id="Nombre plan de comision"
          name="Nombre plan de comision"
          label={"Nombre plan de comisión"}
          type="text"
          autoComplete="off"
          value={newComision?.["Nombre plan de comision"]}
          onChange={() => {}}
        />
      </Form>
      {/* {JSON.stringify(newComision)} */}
      <FormComission outerState={[comissionData, setComissionData]}>
        <Button type="submit" onClick={createComission}>
          Crear comision
        </Button>
      </FormComission>
    </Fragment>
  );
};

export default CreatePlanComision;
