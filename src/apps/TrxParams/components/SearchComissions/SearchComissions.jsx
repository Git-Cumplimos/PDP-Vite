import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import TableEnterprise from "../../../../components/Base/TableEnterprise";
import Input from "../../../../components/Base/Input";
import { fetchComisionesPagar } from "../../utils/fetchComisionesPagar";
import { fetchComisionesCobrar } from "../../utils/fetchComisionesCobrar";
import { getComisionesPlanes } from "../../utils/fetchComisionesPlanes";
import { getComisionesPlanesCampanas } from "../../utils/fetchComisionesPlanesCampanas";
import Select from "../../../../components/Base/Select";

const SearchComissions = ({ comissionFace, onSelectItem }) => {
  const [
    {
      tipoTrx = "",
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
    if (headers.includes("fecha_creacion")) {
      newHeaders.push("Fecha de Creación");
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
        }) => {
          return {
            "Id Plan": pk_planes_comisiones,
            // Comisiones: comisiones,
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
            // "Fecha de Modificación": fecha_modificacion ?? "",
            "Nombre Plan de Comisión": nombre_plan_comision ?? "",
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
    }
  }, [
    convenio,
    comercio,
    tipoTrx,
    autorizador,
    page,
    limit,
    nombre_comision,
    fecha_inicio,
    id_comision,
    nombre_plan_comision,
    pk_planes_comisiones,
    comissionFace,
  ]);
  const fecthComisionesPagarFunc = () => {
    let obj = { page, limit };
    if (id_comision) obj["id_comision"] = id_comision;
    if (convenio !== "") obj["nombre_convenio"] = convenio;
    if (nombre_comision !== "") obj["nombre_comision"] = nombre_comision;
    if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
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
    if (tipoTrx !== "") obj["nombre_operacion"] = tipoTrx;
    if (autorizador !== "") obj["nombre_autorizador"] = autorizador;
    fetchComisionesCobrar(obj)
      .then((res) => {
        setComissions(res?.results);
        setMaxPages(res?.maxPages);
      })
      .catch((err) => console.error(err));
  };

  const fetchPlans = () => {
    console.log("fecthComisionescomisiones");

    let obj = { page, limit };
    if (pk_planes_comisiones !== "")
      obj["pk_planes_comisiones"] = pk_planes_comisiones;
    if (comisiones !== "") obj["comisiones"] = comisiones;
    if (fecha_creacion !== "") obj["fecha_creacion"] = fecha_creacion;
    if (fecha_modificacion !== "")
      obj["fecha_modificacion"] = fecha_modificacion;
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
    let obj = { page, limit };
    if (comisiones !== "") obj["comisiones"] = comisiones;
    if (fecha_creacion !== "") obj["fecha_creacion"] = fecha_creacion;
    if (fecha_inicio !== "") obj["fecha_inicio"] = fecha_inicio;
    if (fecha_final !== "") obj["fecha_final"] = fecha_final;
    if (nombre_plan_comision !== "")
      obj["nombre_plan_comision"] = nombre_plan_comision;

    getComisionesPlanesCampanas(obj)
      .then((res) => {
        console.log(res);
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
            : ""
        }
        maxPage={maxPages}
        onChange={onChange}
        headers={headersTable}
        data={dataTable}
        onSelectRow={onSelectItem ? passItem : onSelectRow}
        onSetPageData={setPageData}
      >
        {comissionFace === "pay" ? (
          <>
            <Input
              id={"convenio"}
              label={"Nombre convenio"}
              name={"convenio"}
              type={"text"}
              autoComplete="off"
              defaultValue={convenio}
            />
            <Input
              id={"nombre_comision"}
              label={"Nombre comision"}
              name={"nombre_comision"}
              type={"text"}
              autoComplete="off"
              defaultValue={nombre_comision}
            />
            <Input
              id={"tipoTrx"}
              label={"Tipo de transacción"}
              name={"tipoTrx"}
              type={"text"}
              autoComplete="off"
              defaultValue={tipoTrx}
            />
            <Input
              id={"id_comision"}
              label={"Id comisión"}
              name={"id_comision"}
              type="number"
              step={"1"}
              autoComplete="off"
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
              autoComplete="off"
              defaultValue={convenio}
            />
            <Input
              id={"nombre_comision"}
              label={"Nombre comision"}
              name={"nombre_comision"}
              type={"text"}
              autoComplete="off"
              defaultValue={nombre_comision}
            />
            <Input
              id={"tipoTrx"}
              label={"Tipo de transacción"}
              name={"tipoTrx"}
              type={"text"}
              autoComplete="off"
              defaultValue={tipoTrx}
            />
            <Input
              id={"id_comision"}
              label={"Id comisión"}
              name={"id_comision"}
              type="number"
              step={"1"}
              autoComplete="off"
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
              autoComplete="off"
              defaultValue={nombre_plan_comision}
            />
            <Input
              id={"tipoTrx"}
              label={"Tipo de transacción"}
              name={"tipoTrx"}
              type={"text"}
              autoComplete="off"
              defaultValue={tipoTrx}
            />
            <Input
              id={"pk_planes_comisiones"}
              label={"Id plan"}
              name={"pk_planes_comisiones"}
              type="number"
              step={"1"}
              autoComplete="off"
              defaultValue={pk_planes_comisiones}
            />
          </>
        ) : null}
        {comissionFace === "campaigns" ? (
          <>
            <Input
              id={"nombre_comision"}
              label={"Nombre comisión"}
              name={"nombre_comision"}
              type={"text"}
              autoComplete="off"
              defaultValue={nombre_comision}
            />
            <Input
              id={"tipoTrx"}
              label={"Tipo de transacción"}
              name={"tipoTrx"}
              type={"text"}
              autoComplete="off"
              defaultValue={tipoTrx}
            />
            <Input
              id={"id_comision"}
              label={"Id comisión"}
              name={"id_comision"}
              type="number"
              // step={"1"}
              autoComplete="off"
              defaultValue={comercio}
            />
          </>
        ) : null}
        {/* <Select
          id="tipoTrx"
          name="tipoTrx"
          label="Tipo de transacción"
          options={{ Cobrar: "cobrar", Pagar: "pagar" }}
          value={tipoTrx}
          // defaultValue={comissionData?.type}
          required
        /> */}
        {/* <Input
          id={"fecha_inicio"}
          label={"Fecha inicio"}
          name={"fecha_inicio"}
          type={"date"}
          autoComplete="off"
          defaultValue={fecha_inicio}
        /> */}
      </TableEnterprise>
    </Fragment>
  );
};

export default SearchComissions;
