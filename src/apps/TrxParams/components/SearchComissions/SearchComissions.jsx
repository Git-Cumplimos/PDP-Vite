import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import Table from "../../../../components/Base/Table";
import Input from "../../../../components/Base/Input";
import Pagination from "../../../../components/Compound/Pagination";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import {
  fetchConveniosMany,
  fetchConvsPerAuto,
} from "../../utils/fetchRevalConvenios";
import { fetchComisionesPagar } from "../../utils/fetchComisionesPagar";
import Modal from "../../../../components/Base/Modal";
import Form from "../../../../components/Base/Form";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";
import { notifyError } from "../../../../utils/notify";
import { fetchComisionesCobrar } from "../../utils/fetchComisionesCobrar";

const SearchComissions = ({ comissionFace, onSelectItem }) => {
  const [
    { tipoTrx = "", comercio = "", convenio = "", autorizador = "", page },
    setQuery,
  ] = useQuery();
  const navigate = useNavigate();

  const [comissions, setComissions] = useState([]);
  const [maxPages, setMaxPages] = useState(0);

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
    if (headers.includes("nombre_convenio")) {
      newHeaders.push("Convenio");
    }
    if (headers.includes("nombre_operacion")) {
      newHeaders.push("Operación");
    }
    if (headers.includes("id_comercio")) {
      newHeaders.push("Id comercio");
    }
    if (headers.includes("nombre_contrato")) {
      newHeaders.push("Contrato");
    }
    if (headers.includes("nombre_autorizador")) {
      newHeaders.push("Autorizador");
    }
    if (headers.includes("estado")) {
      newHeaders.push("Estado");
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
          id_tipo_contrato,
          id_comercio,
          id_autorizador,
          comisiones,
          fecha_inicio,
          fecha_fin,
          estado,
          nombre_operacion,
          nombre_convenio,
          nombre_contrato,
          nombre_autorizador,
        }) => {
          return {
            "Id Comision": id_comision_pagada,
            Convenio: nombre_convenio,
            Operacion: nombre_operacion,
            "Id comercio": id_comercio,
            Contrato: nombre_contrato,
            Autorizador: nombre_autorizador,
            Estado: estado ? "Activo" : "Inactivo",
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
        }) => {
          return {
            "Id comision cobrada": id_comision_cobrada,
            Convenio: nombre_convenio,
            Operacion: nombre_operacion,
            Autorizador: nombre_autorizador,
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
    [navigate, comissions]
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
    }
  }, [convenio, comercio, tipoTrx, autorizador, page]);
  const fecthComisionesPagarFunc = () => {
    let obj = { page };
    if (convenio !== "") obj["nombre_convenio"] = convenio;
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
    let obj = { page };
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

  return (
    <Fragment>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        <Input
          id={"convenioComissions"}
          label={"Convenio"}
          name={"convenio"}
          type={"text"}
          autoComplete="off"
          defaultValue={convenio}
        />
        <Input
          id={"tipoTrx"}
          label={"Tipo de transaccion"}
          name={"tipoTrx"}
          type={"text"}
          autoComplete="off"
          defaultValue={tipoTrx}
        />
        {comissionFace === "pay" ? (
          <Fragment>
            <Input
              id={"comercioComissions"}
              label={"Id comercio"}
              name={"comercio"}
              type="number"
              step={"1"}
              autoComplete="off"
              defaultValue={comercio}
            />
            <Input
              id={"autorizadorComissions"}
              label={"Autorizador"}
              name={"autorizador"}
              type={"text"}
              autoComplete="off"
              defaultValue={autorizador}
            />
          </Fragment>
        ) : comissionFace === "collect" ? (
          <Input
            id={"autorizadorComissions"}
            label={"Autorizador"}
            name={"autorizador"}
            type={"text"}
            autoComplete="off"
            defaultValue={autorizador}
          />
        ) : (
          ""
        )}
      </Pagination>
      {Array.isArray(comissions) && comissions.length > 0 ? (
        <Table
          headers={headersTable}
          data={dataTable}
          onSelectRow={onSelectItem ? passItem : onSelectRow}
          // onSelectRow={onSelectTipoContrato}
        />
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default SearchComissions;
