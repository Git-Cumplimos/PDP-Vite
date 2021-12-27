import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import useQuery from "../../../../hooks/useQuery";

import Table from "../../../../components/Base/Table/Table";
import Form from "../../../../components/Base/Form/Form";
import Input from "../../../../components/Base/Input/Input";
import { useNavigate } from "react-router-dom";

const initTable = [
  {
    "Tipo de transaccion": [2, "Recaudo"],
    Comercio: [4, "papeleria"],
    Convenio: [3, "Enel"],
  },
];

const initTableAuto = [
  {
    "Tipo de transaccion": [2, "Recaudo"],
    Autorizador: [4, "Davivienda"],
    Convenio: [3, "Enel"],
  },
];

const SearchComissions = ({ comissionFace }) => {
  const [
    { typeTrx = "", comercio = "", convenio = "", autorizador = "" },
    setQuery,
  ] = useQuery();

  const navigate = useNavigate();

  const [comissions, setComissions] = useState([]);

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
      const _id_comercio = comissions?.[indx]?.Comercio?.[0];
      const _id_autorizador = comissions?.[indx]?.Autorizador?.[0];
      const _id_convenio = comissions?.[indx]?.Convenio?.[0];
      const urlParams = new URLSearchParams();
      if (_id_tipo_trx) {
        urlParams.append("id_tipo_trx", _id_tipo_trx);
      }
      if (_id_comercio) {
        urlParams.append("id_comercio", _id_comercio);
      }
      if (_id_autorizador) {
        urlParams.append("id_autorizador", _id_autorizador);
      }
      if (_id_convenio) {
        urlParams.append("id_convenio", _id_convenio);
      }
      navigate(`?${urlParams.toString()}`);
    },
    [navigate, comissions]
  );

  useEffect(() => {
    setComissions(
      comissionFace === "pay"
        ? initTable
        : comissionFace === "collect"
        ? initTableAuto
        : []
    );
  }, [comissionFace]);

  // useEffect(() => {
  //   const typeTrx = typeTrx;
  // fetchData("", "GET", { tipo_op: typeTrx })
  //   .then((res) => {
  //     if (res?.status) {
  //       setComissions(res?.obj);
  //     } else {
  //       console.error(res?.msg);
  //     }
  //   })
  //   .catch((err) => console.error(err));
  // }, [typeTrx]);

  // useEffect(() => {
  //   const comercio = comercio;
  //   fetchData("", "GET", { comercio })
  //     .then((res) => {
  //       if (res?.status) {
  //         setComissions(res?.obj);
  //       } else {
  //         console.error(res?.msg);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [comercio]);

  // useEffect(() => {
  //   const convenio = convenio;
  //   fetchData("", "GET", { convenio })
  //     .then((res) => {
  //       if (res?.status) {
  //         setComissions(res?.obj);
  //       } else {
  //         console.error(res?.msg);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [convenio]);

  return (
    <Fragment>
      <Form onLazyChange={{ callback: onChange, timeOut: 500 }} grid>
        <Input
          label={"Tipo de transaccion"}
          name={"typeTrx"}
          type={"text"}
          autoComplete="off"
          defaultValue={typeTrx}
        />
        {comissionFace === "pay" ? (
          <Input
            label={"Comercio"}
            name={"comercio"}
            type={"text"}
            autoComplete="off"
            defaultValue={comercio}
          />
        ) : comissionFace === "collect" ? (
          <Input
            label={"Autorizador"}
            name={"autorizador"}
            type={"text"}
            autoComplete="off"
            defaultValue={autorizador}
          />
        ) : (
          ""
        )}
        {Array.isArray(comissions) &&
        comissions
          .map(({ "Tipo de transaccion": [, tipo_trx] }) => tipo_trx)
          .includes("Recaudo") ? (
          <Input
            label={"Convenio"}
            name={"convenio"}
            type={"text"}
            autoComplete="off"
            defaultValue={convenio}
          />
        ) : (
          ""
        )}
      </Form>
      {Array.isArray(comissions) && comissions.length > 0 ? (
        <Table
          headers={headersTable}
          data={dataTable}
          onSelectRow={onSelectRow}
        />
      ) : (
        ""
      )}
    </Fragment>
  );
};

export default SearchComissions;
