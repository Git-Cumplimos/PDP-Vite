import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchComisionesPagar } from "../../utils/fetchComisionesPagar";
import { fetchComisionesCobrar } from "../../utils/fetchComisionesCobrar";
import { getComisionesPlanes } from "../../utils/fetchComisionesPlanes";
import { onChangeNumber } from "../../../../utils/functions";
import {
  getAssingsCommissions,
  getComisionesPlanesCampanas,
} from "../../utils/fetchComisionesPlanesCampanas";
import Select from "../../../../components/Base/Select";

const SearchComissions = ({ comissionFace, onSelectItem }) => {
  const [
    {
      tipoComision = "",
      comercio = "",
      convenio = "",
      autorizador = "",
      fecha_inicio = "",
      nombre_comision = "",
      id_comision = "",

      comisiones = [],
      fecha_creacion = "",
      fecha_modificacion = "",
      nombre_plan_comision = "",
      fecha_final = "",

      pk_planes_comisiones = "",

      nombre_asignacion_comision = "",
      fk_tipo_op = "",
      fk_tbl_grupo_convenios = "",
      tipo_comision = "",
    },
    setQuery,
  ] = useQuery();
  const navigate = useNavigate();

  const [comissions, setComissions] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });

  const headersTable = useMemo(() => {
    if (comissions.length === 0) {
      return [];
    }
    const headers = Object.keys(comissions[0]);
    let newHeaders = [];
    if (headers.includes("id_comision_pagada")) {
      newHeaders.push("Id comisión");
    }
    if (headers.includes("id_comision_cobrada")) {
      newHeaders.push("Id comisión");
    }
    if (headers.includes("nombre_comision")) {
      newHeaders.push("Nombre comisión");
    }
    if (headers.includes("nombre_convenio")) {
      newHeaders.push("Convenio");
    }
    if (headers.includes("nombre_operacion")) {
      newHeaders.push("Operación");
    }
    if (headers.includes("id_comercio")) {
      newHeaders.push("Id comercio");
    }
    if (headers.includes("nombre_autorizador")) {
      newHeaders.push("Autorizador");
    }
    if (headers.includes("estado")) {
      newHeaders.push("Estado");
    }
    // if (headers.includes("comisiones")) {
    //   newHeaders.push("Comisiones");
    // }
    if (headers.includes("pk_planes_comisiones")) {
      newHeaders.push("Id Plan");
    }

    // if (headers.includes("fecha_modificacion")) {
    //   newHeaders.push("Fecha de modificación");
    // }
    if (headers.includes("nombre_plan_comision")) {
      newHeaders.push("Nombre Plan de Comisión");
    }
    if (headers.includes("fecha_inicio")) {
      newHeaders.push("Fecha de Inicio");
    }
    if (headers.includes("fecha_final")) {
      newHeaders.push("Fecha Final");
    }
    if (headers.includes("nombre_plan_comision_campana")) {
      newHeaders.push("Nombre Campaña");
    }

    if (headers.includes("nombre_asignacion_comision")) {
      newHeaders.push("Nombre asignación");
    }
    if (headers.includes("fk_tipo_op")) {
      newHeaders.push("Tipo operación");
    }
    if (headers.includes("tipo_comision")) {
      newHeaders.push("Tipo comisión");
    }
    if (headers.includes("fk_planes_comisiones")) {
      newHeaders.push("Plan asociado");
    }
    if (headers.includes("fecha_creacion")) {
      newHeaders.push("Fecha de Creación");
    }

    return newHeaders;
  }, [comissions]);

  const dataTable = useMemo(() => {
    if (comissionFace === "pay") {
      return comissions.map(
        ({
          id_comision_pagada,
          id_tipo_op,
          id_convenio,
          id_comercio,
          id_autorizador,
          comisiones,
          fecha_inicio,
          fecha_fin,
          estado,
          nombre_comision,
          nombre_operacion,
          nombre_convenio,
          nombre_autorizador,
        }) => {
          return {
            "Id Comision": id_comision_pagada,
            "Nombre comision": nombre_comision ?? "",
            Convenio: nombre_convenio ?? "",
            Operacion: nombre_operacion ?? "",
            "Id comercio": id_comercio ?? "",
            Autorizador: nombre_autorizador ?? "",
            Estado: estado ? "Activo" : "Inactivo",
            "Fecha de inicio": fecha_inicio,
          };
        }
      );
    } else if (comissionFace === "collect") {
      return comissions.map(
        ({
          comisiones,
          estado,
          id_autorizador,
          id_convenio,
          id_comision_cobrada,
          id_tipo_op,
          id_comercio,
          nombre_autorizador,
          nombre_operacion,
          nombre_convenio,
          nombre_comision,
        }) => {
          return {
            "Id comision cobrada": id_comision_cobrada,
            "Nombre comision": nombre_comision ?? "",
            Convenio: nombre_convenio ?? "",
            Operacion: nombre_operacion ?? "",
            Autorizador: nombre_autorizador ?? "",
            Estado: estado ? "Activo" : "Inactivo",
          };
        }
      );
    }
    if (comissionFace === "plans") {
      return comissions.map(
        ({
          comisiones,
          fecha_creacion,
          fecha_modificacion,
          nombre_plan_comision,
          pk_planes_comisiones,
          tipo_comision,
        }) => {
          return {
            "Id Plan": pk_planes_comisiones,
            "Nombre Plan de Comisión": nombre_plan_comision ?? "",
            "Tipo comision": tipo_comision ?? "",
            "Fecha de Creación":
              Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(
                new Date(fecha_creacion).setHours(
                  new Date(fecha_creacion + "-5").getHours()
                )
              ) ?? "",
          };
        }
      );
    }
    if (comissionFace === "campaigns") {
      return comissions.map(
        ({
          comisiones,
          fecha_creacion,
          fecha_inicio,
          fecha_final,
          nombre_plan_comision,
          nombre_plan_comision_campana,
          pk_planes_comisiones,
        }) => {
          return {
            "Id Plan": pk_planes_comisiones,

            // Comisiones: comisiones,
            // "Fecha de Creación": fecha_creacion ?? "",
            "Nombre Plan de Comisión": nombre_plan_comision ?? "",
            "Fecha Inicio":
              fecha_inicio === null
                ? "No definida"
                : Intl.DateTimeFormat("es-CO", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(
                    new Date(fecha_inicio).setHours(
                      new Date(fecha_inicio + "-5").getHours()
                    )
                  ) ?? "",
            "Fecha Final":
              fecha_final === null
                ? "No definida"
                : Intl.DateTimeFormat("es-CO", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(
                    new Date(fecha_final).setHours(
                      new Date(fecha_final + "-5").getHours()
                    )
                  ) ?? "",
            "Nombre Campaña": nombre_plan_comision_campana ?? "No definida",
          };
        }
      );
    }
    if (comissionFace === "assigns") {
      return comissions.map(
        ({
          nombre_asignacion_comision,
          fk_tipo_op,
          fk_comercio,
          fk_convenio,
          respuesta,
          tipo_comision,
          fk_planes_comisiones,
          pk_asignacion_comisiones,
          fecha_creacion,
        }) => {
          return {
            nombre_asignacion_comision,
            fk_tipo_op,
            tipo_comision,
            fk_planes_comisiones,
            fk_comercio,
            fk_convenio,
            respuesta,
            "Fecha de Creación":
              Intl.DateTimeFormat("es-CO", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(
                new Date(fecha_creacion).setHours(
                  new Date(fecha_creacion + "-5").getHours()
                )
              ) ?? "",
          };
        }
      );
    } else {
      return comissions.map(
        ({
          id_comision_pagada,
          id_tipo_op,
          id_convenio,
          id_comercio,
          id_autorizador,
          comisiones,
          fecha_inicio,
          fecha_fin,
          estado,
          nombre_comision,
          nombre_operacion,
          nombre_convenio,
          nombre_autorizador,
        }) => {
          return {
            "Id Comisión": id_comision_pagada,
            "Nombre comisión": nombre_comision ?? "",
            Convenio: nombre_convenio ?? "",
            Operacion: nombre_operacion ?? "",
            "Id comercio": id_comercio ?? "",
            Autorizador: nombre_autorizador ?? "",
            Estado: estado ? "Activo" : "Inactivo",
          };
        }
      );
    }
  }, [comissions, comissionFace]);

  const onChange = useCallback(
    (ev) => setQuery({ [ev.target.name]: ev.target.value }, { replace: true }),
    [setQuery]
  );

  const onSelectRow = useCallback(
    (ev, indx) => {
      const _id_comision_pagada = comissions?.[indx]?.["id_comision_pagada"];
      const _id_comision_cobrada = comissions?.[indx]?.["id_comision_cobrada"];
      const _id_plan_comision = comissions?.[indx]?.["pk_planes_comisiones"];
      const _id_plan_comision_campana =
        comissions?.[indx]?.["pk_planes_comisiones"];
      const _id_plan_asignacion_comision =
        comissions?.[indx]?.["pk_asignacion_comisiones"];
      // const _id_tipo_trx = comissions?.[indx]?.["id_tipo_op"];
      // const _id_comercio = comissions?.[indx]?.["id_comercio"];
      // const _id_autorizador = comissions?.[indx]?.Autorizador;
      // const _nombre_autorizador = comissions?.[indx]?.Autorizador;
      // const _id_convenio = comissions?.[indx]?.["id_convenio"];
      const urlParams = new URLSearchParams();
      if (_id_comision_pagada) {
        urlParams.append("id_comision_pagada", _id_comision_pagada);
      }
      if (_id_comision_cobrada) {
        urlParams.append("id_comision_cobrada", _id_comision_cobrada);
      }
      if (comissionFace === "plans") {
        urlParams.append("id_plan_comision", _id_plan_comision);
      }

      if (comissionFace === "campaigns") {
        urlParams.append("id_plan_comision_campana", _id_plan_comision_campana);
      }
      if (comissionFace === "assigns") {
        urlParams.append(
          "id_plan_asignacion_comision",
          _id_plan_asignacion_comision
        );
      }

      // if (_id_tipo_trx) {
      //   urlParams.append("id_tipo_trx", _id_tipo_trx);
      // }
      // if (_id_comercio) {
      //   urlParams.append("comercios_id_comercio", _id_comercio);
      // }
      // if (_id_autorizador) {
      //   urlParams.append("autorizador_id_autorizador", _id_autorizador);
      //   urlParams.append(
      //     "nombre_autorizador",
      //     JSON.stringify(_nombre_autorizador)
      //   );
      // }
      // if (_id_convenio) {
      //   urlParams.append("convenios_id_convenio", _id_convenio);
      // }
      navigate(`?${urlParams.toString()}`);
    },
    [navigate, comissions, comissionFace]
  );

  const passItem = useCallback(
    (ev, indx) => {
      onSelectItem?.(comissions?.[indx]);
      setComissions([]);
    },
    [onSelectItem, comissions]
  );

  useEffect(() => {
    if (comissionFace === "pay") {
      fecthComisionesPagarFunc();
    } else if (comissionFace === "collect") {
      fecthComisionesCobrarFunc();
    } else if (comissionFace === "plans") {
      fetchPlans();
    } else if (comissionFace === "campaigns") {
      fetchCampaignPlans();
    } else if (comissionFace === "assigns") {
      fetchAssingsCommission();
    }
  }, [
    convenio,
    comercio,
    tipoComision,
    autorizador,
    page,
    limit,
    nombre_comision,
    fecha_inicio,
    id_comision,
    nombre_plan_comision,
    pk_planes_comisiones,
    comissionFace,
    nombre_asignacion_comision,
    fk_tipo_op,
    fk_tbl_grupo_convenios,
    tipo_comision,
  ]);
  const fecthComisionesPagarFunc = () => {
    let obj = { page, limit };
    if (id_comision) obj["id_comision"] = id_comision;
    if (convenio !== "") obj["nombre_convenio"] = convenio;
    if (nombre_comision !== "") obj["nombre_comision"] = nombre_comision;
    if (tipoComision !== "") obj["nombre_operacion"] = tipoComision;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    if (comercio !== "") obj["id_comercio"] = parseInt(comercio);
    fetchComisionesPagar(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fecthComisionesCobrarFunc = () => {
    let obj = { page, limit };
    if (id_comision) obj["id_comision"] = id_comision;
    if (nombre_comision !== "") obj["nombre_comision"] = nombre_comision;
    if (convenio !== "") obj["nombre_convenio"] = convenio;
    if (tipoComision !== "") obj["nombre_operacion"] = tipoComision;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    fetchComisionesCobrar(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };

  const fetchPlans = () => {
    let obj = { page, limit, sortDir: "DESC", sortBy: "pk_planes_comisiones" };
    if (pk_planes_comisiones !== "")
      obj["pk_planes_comisiones"] = pk_planes_comisiones;
    if (tipoComision !== "") obj["tipo_comision"] = tipoComision;
    if (nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = nombre_plan_comision;

    getComisionesPlanes(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };

  const fetchCampaignPlans = () => {
    let obj = { page, limit, sortDir: "DESC", sortBy: "pk_planes_comisiones" };
    if (nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = nombre_plan_comision;

    getComisionesPlanesCampanas(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };
  const fetchAssingsCommission = () => {
    let obj = { page, limit };
    if (nombre_asignacion_comision !== "")
      obj["nombre_asignacion_comision"] = nombre_asignacion_comision;
    if (fk_tipo_op !== "") obj["fk_tipo_op"] = fk_tipo_op;
    if (fk_tbl_grupo_convenios !== "")
      obj["fk_tbl_grupo_convenios"] = fk_tbl_grupo_convenios;

    getAssingsCommissions(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Fragment>
      {/* <Pagination maxPage={maxPages} onChange={onChange} grid></Pagination> */}
      <TableEnterprise
        title={
          comissionFace === "pay"
            ? "Comisiones por pagar"
            : comissionFace === "collect"
            ? "Comisiones por cobrar"
            : comissionFace === "plans"
            ? "Lista de Planes de Comisión"
            : comissionFace === "campaigns"
            ? "Lista de Campañas"
            : comissionFace === "assigns"
            ? "Asignaciones de comisiones"
            : ""
        }
        maxPage={maxPages}
        onChange={onChange}
        headers={headersTable}
        data={dataTable}
        onSelectRow={onSelectItem ? passItem : onSelectRow}
        onSetPageData={setPageData}>
        {comissionFace === "pay" ? (
          <>
            <Input
              id={"convenio"}
              label={"Nombre convenio"}
              name={"convenio"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={convenio}
            />
            <Input
              id={"nombre_comision"}
              label={"Nombre comision"}
              name={"nombre_comision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={nombre_comision}
            />
            <Input
              id={"tipoComision"}
              label={"Tipo de transacción"}
              name={"tipoComision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={tipoComision}
            />
            <Input
              id={"id_comision"}
              label={"Id comisión"}
              name={"id_comision"}
              type='tel'
              step={"1"}
              maxLength={30}
              onChange={(ev) => ev.target.value = onChangeNumber(ev)}
              autoComplete='off'
              defaultValue={id_comision}
            />
          </>
        ) : null}
        {comissionFace === "collect" ? (
          <>
            <Input
              id={"convenio"}
              label={"Nombre convenio"}
              name={"convenio"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={convenio}
            />
            <Input
              id={"nombre_comision"}
              label={"Nombre comision"}
              name={"nombre_comision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={nombre_comision}
            />
            <Input
              id={"tipoComision"}
              label={"Tipo de transacción"}
              name={"tipoComision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={tipoComision}
            />
            <Input
              id={"id_comision"}
              label={"Id comisión"}
              name={"id_comision"}
              type='tel'
              step={"1"}
              maxLength={30}
              onChange={(ev) => ev.target.value = onChangeNumber(ev)}
              autoComplete='off'
              defaultValue={id_comision}
            />
          </>
        ) : null}
        {comissionFace === "plans" ? (
          <>
            <Input
              id={"nombre_plan_comision"}
              label={"Nombre comisión"}
              name={"nombre_plan_comision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={nombre_plan_comision}
            />
            <Select
              id='tipoComision'
              name='tipoComision'
              label='Tipo de comisión'
              options={{
                "": "",
                Pagar: "PAGAR",
                Cobrar: "COBRAR",
              }}
              defaultValue={tipoComision}
            />
            <Input
              id={"pk_planes_comisiones"}
              label={"Id plan"}
              name={"pk_planes_comisiones"}
              type='tel'
              step={"1"}
              maxLength={30}
              onChange={(ev) => ev.target.value = onChangeNumber(ev)}
              autoComplete='off'
              defaultValue={pk_planes_comisiones}
            />
          </>
        ) : null}
        {comissionFace === "campaigns" ? (
          <>
            <Input
              id={"nombre_plan_comision"}
              label={"Nombre plan comisión"}
              name={"nombre_plan_comision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={nombre_plan_comision}
            />
          </>
        ) : null}
        {comissionFace === "assigns" ? (
          <>
            <Input
              id={"nombre_asignacion_comision"}
              label={"Nombre asignación"}
              name={"nombre_asignacion_comision"}
              type={"text"}
              maxLength={50}
              autoComplete='off'
              defaultValue={nombre_asignacion_comision}
            />
            <Input
              id={"fk_tipo_op"}
              label={"Tipo de transacción"}
              name={"fk_tipo_op"}
              type={"tel"}
              autoComplete='off'
              maxLength={30}
              onChange={(ev) => ev.target.value = onChangeNumber(ev)}
              defaultValue={fk_tipo_op}
            />
          </>
        ) : null}
      </TableEnterprise>
    </Fragment>
  );
};

export default SearchComissions;
