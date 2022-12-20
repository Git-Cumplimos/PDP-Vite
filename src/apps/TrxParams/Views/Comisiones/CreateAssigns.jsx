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
import SearchPlanesComisiones from "../../components/PlanesComisiones/SearchPlanesComisiones";
import Fieldset from "../../../../components/Base/Fieldset";

const CreateAssigns = () => {
  const navigate = useNavigate();

  const [idComercios, setIdComercios] = useState([]);
  const [newComision, setNewComision] = useState({
    fk_tipo_op: "",
    nombre_tipo_operacion: "",
    fk_planes_comisiones: "",
    nombre_plan: "",
    nombre_asignacion_comision: "",
    fk_tbl_grupo_convenios: "",
    nombre_grupo_convenios: "",
  });
  const [selectedOpt, setSelectedOpt] = useState("");
  const [data, setdata] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const [showModal, setShowModal] = useState(false);
  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const createComission = useCallback(
    (ev) => {
      ev.preventDefault();
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
    },
    [newComision, idComercios, navigate]
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
  }, [selectedOpt, page]);
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
    // if (convenio !== "") obj["nombre_convenio"] = convenio;
    // if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
    // if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    // if (comercio !== "") obj["id_comercio"] = parseInt(comercio);
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
      }
      handleClose();
    },
    [data, selectedOpt, handleClose]
  );
  // const onChange = useCallback(
  //   (ev) => setQuery({ [ev.target.name]: ev.target.value }, { replace: true }),
  //   [setQuery]
  // );
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
  const handleShow = useCallback(
    (data) => (ev) => {
      ev.preventDefault();
      setSelectedOpt(data);
      setShowModal(true);
    },
    []
  );

  return (
    <Fragment>
      <h1 className='text-3xl'>Crear asignación comisión</h1>
      <Form grid>
        <Input
          id='nombre_asignacion_comision'
          name='nombre_asignacion_comision'
          label={"Nombre asignación de comisión"}
          type='text'
          autoComplete='off'
          value={newComision?.["nombre_asignacion_comision"]}
          onChange={() => {}}
        />
        {newComision?.fk_planes_comisiones !== "" && (
          <Input
            id='nombre_plan'
            name='nombre_plan'
            label={"Plan de comisión"}
            type='text'
            autoComplete='off'
            value={newComision?.nombre_plan}
            onChange={() => {}}
            disabled
          />
        )}
        {newComision?.fk_tipo_op !== "" && (
          <Input
            id='nombre_tipo_operacion'
            name='nombre_tipo_operacion'
            label={"Tipo de operación"}
            type='text'
            autoComplete='off'
            value={newComision?.["nombre_tipo_operacion"]}
            onChange={() => {}}
            disabled
          />
        )}
        {newComision?.fk_tbl_grupo_convenios !== "" && (
          <Input
            id='nombre_grupo_convenios'
            name='nombre_grupo_convenios'
            label={"Grupo convenios"}
            type='text'
            autoComplete='off'
            value={newComision?.["nombre_grupo_convenios"]}
            onChange={() => {}}
            disabled
          />
        )}
        <Fieldset legend='Datos de la comisión' className='lg:col-span-2'>
          <ButtonBar className='lg:col-span-2'>
            <Button type='button' onClick={handleShow("planComision")}>
              {newComision?.fk_planes_comisiones !== ""
                ? "Actualizar plan de comisión"
                : "Agregar plan de comisión"}
            </Button>
            <Button type='button' onClick={handleShow("tipoOperacion")}>
              {newComision?.fk_tipo_op !== ""
                ? "Actualizar tipo de operación"
                : "Agregar tipo de operación"}
            </Button>
            <Button type='button' onClick={handleShow("grupoConvenios")}>
              {newComision?.fk_tbl_grupo_convenios !== ""
                ? "Actualizar grupo convenios"
                : "Agregar grupo convenios"}
            </Button>
          </ButtonBar>
        </Fieldset>
        <ButtonBar className='lg:col-span-2'>
          <Button type='button' onClick={handleClose}>
            Cancelar
          </Button>
          <Button type='submit'>
            {/* {selectedGruposComercios?.pk_tbl_grupo_comercios !== ""
                ? "Actualizar grupo comercios"
                : "Crear grupo comercios"} */}
            Crear asignación de comisión
          </Button>
        </ButtonBar>
      </Form>
      <Modal
        show={showModal}
        handleClose={handleClose}
        className='flex align-middle'>
        {selectedOpt === "planComision" ? (
          <SearchPlanesComisiones
            handleClose={handleClose}
            setNewComision={setNewComision}
            newComision={newComision}
          />
        ) : (
          <></>
        )}
      </Modal>
    </Fragment>
  );
};

export default CreateAssigns;
