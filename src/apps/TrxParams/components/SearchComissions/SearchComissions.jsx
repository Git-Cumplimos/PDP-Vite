import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import Table from "../../../../components/Base/Table/Table";
import Input from "../../../../components/Base/Input/Input";
import Pagination from "../../../../components/Compound/Pagination/Pagination";
import { fetchAutorizadores } from "../../utils/fetchRevalAutorizadores";
import {
  fetchConveniosMany,
  fetchConvsPerAuto,
} from "../../utils/fetchRevalConvenios";

const SearchComissions = ({ comissionFace, onSelectItem }) => {
  const [
    {
      /* typeTrx = "", */ comercio = "",
      convenio = "",
      autorizador = "",
      page,
    },
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
    if (headers.includes("Tipo de transaccion")) {
      newHeaders.push("Tipo de transaccion");
    }
    if (headers.includes("Convenio")) {
      newHeaders.push("Convenio");
    }
    if (headers.includes("Comercio")) {
      newHeaders.push("Comercio");
    }
    if (headers.includes("Autorizador")) {
      newHeaders.push("Autorizador");
    }
    return newHeaders;
  }, [comissions]);

  const dataTable = useMemo(() => {
    return comissions.map(
      ({ "Tipo de transaccion": typeT, Convenio, Comercio, Autorizador }) => {
        let obj = {};
        if (typeT) {
          const [, tipoTrx] = typeT;
          obj = { ...obj, tipoTrx };
        }
        if (Convenio) {
          const [, conv] = Convenio;
          obj = { ...obj, conv };
        }
        if (Comercio) {
          const [, come] = Comercio;
          obj = { ...obj, come };
        }
        if (Autorizador) {
          const [, autho] = Autorizador;
          obj = { ...obj, autho };
        }
        return { ...obj };
      }
    );
  }, [comissions]);

  const onChange = useCallback(
    (ev) => setQuery({ [ev.target.name]: ev.target.value }, { replace: true }),
    [setQuery]
  );

  const onSelectRow = useCallback(
    (ev, indx) => {
      const _id_tipo_trx = comissions?.[indx]?.["Tipo de transaccion"]?.[0];
      const _id_comercio = comercio;
      const _id_autorizador = comissions?.[indx]?.Autorizador?.[0];
      const _nombre_autorizador = comissions?.[indx]?.Autorizador?.[1];
      const _id_convenio = comissions?.[indx]?.Convenio?.[0];
      const urlParams = new URLSearchParams();
      if (_id_tipo_trx) {
        urlParams.append("id_tipo_trx", _id_tipo_trx);
      }
      if (_id_comercio) {
        urlParams.append("comercios_id_comercio", _id_comercio);
      }
      if (_id_autorizador) {
        urlParams.append("autorizador_id_autorizador", _id_autorizador);
        urlParams.append(
          "nombre_autorizador",
          JSON.stringify(_nombre_autorizador)
        );
      }
      if (_id_convenio) {
        urlParams.append("convenios_id_convenio", _id_convenio);
      }
      navigate(`?${urlParams.toString()}`);
    },
    [navigate, comissions, comercio]
  );

  const passItem = useCallback(
    (ev, indx) => {
      onSelectItem?.(comissions?.[indx]);
      setComissions([]);
    },
    [onSelectItem, comissions]
  );

  useEffect(() => {
    if (convenio && autorizador) {
      fetchConvsPerAuto(convenio, autorizador)
        .then((res) => {
          setComissions([
            ...res.map(
              ({
                Convenio: { id_convenio, nombre_convenio },
                Autorizador: { id_autorizador, nombre_autorizador },
              }) => {
                return {
                  Convenio: [id_convenio, nombre_convenio],
                  Autorizador: [id_autorizador, nombre_autorizador],
                };
              }
            ),
          ]);
          setMaxPages(0);
        })
        .catch((err) => console.error(err));
    } else if (convenio) {
      fetchConveniosMany(convenio, page)
        .then((res) => {
          setComissions([
            ...res?.results.map(({ id_convenio, nombre_convenio }) => {
              return { Convenio: [id_convenio, nombre_convenio] };
            }),
          ]);
          setMaxPages(res?.maxPages);
        })
        .catch((err) => console.error(err));
    } else if (autorizador) {
      fetchAutorizadores(autorizador, page)
        .then((res) => {
          setComissions([
            ...res?.results.map(({ id_autorizador, nombre_autorizador }) => {
              return { Autorizador: [id_autorizador, nombre_autorizador] };
            }),
          ]);
          setMaxPages(res?.maxPages);
        })
        .catch((err) => console.error(err));
    }
  }, [convenio, autorizador, page]);

  return (
    <Fragment>
      <Pagination maxPage={maxPages} onChange={onChange} grid>
        {/* <Input
          label={"Tipo de transaccion"}
          name={"typeTrx"}
          type={"text"}
          autoComplete="off"
          defaultValue={typeTrx}
        /> */}
        <Input
          id={"convenioComissions"}
          label={"Convenio"}
          name={"convenio"}
          type={"text"}
          autoComplete="off"
          defaultValue={convenio}
        />
        {comissionFace === "pay" ? (
          <Input
            id={"comercioComissions"}
            label={"Comercio"}
            name={"comercio"}
            type={"number"}
            step={"1"}
            autoComplete="off"
            defaultValue={comercio}
          />
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
        />
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default SearchComissions;
