import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "../../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCajaSocial";
import TableEnterprise from "../../../../../components/Base/TableEnterprise";
import Input from "../../../../../components/Base/Input";
import { notifyPending } from "../../../../../utils/notify";
import useDelayedCallback from "../../../../../hooks/useDelayedCallback";

const URL_CONSULTA_CONVENIO = `${process.env.REACT_APP_URL_CORRESPONSALIA_CAJA_SOCIAL}/recaudo-servicios-caja-social/consulta-convenios`;

const DATA_CONVENIOS_INIT = {
  convenios: [],
  estadoTrx: 1,
  filterConvenio: {
    codigoConvenio: "",
    nombreConvenio: "",
  },
};

const SeleccionConvenioRecaudoServiciosCajaSocial = () => {
  const validNavigate = useNavigate();
  const [dataConvenios, setDataConvenios] = useState(DATA_CONVENIOS_INIT);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [maxPages, setMaxPages] = useState(0);
  const [loadingPeticionConsultaConvenio, peticionConsultaConvenio] = useFetch(
    fetchCustom(URL_CONSULTA_CONVENIO, "POST", "Consulta convenio")
  );
  useEffect(() => {
    consultaConveniosCajaSocial();
  }, [dataConvenios.filterConvenio, limit, page]);
  const consultaConveniosCajaSocial = useDelayedCallback(
    useCallback(
      (ev) => {
        let obj = {
          permite_captura_manual: "1",
        };
        if (dataConvenios.filterConvenio.codigoConvenio !== "")
          obj["pk_convenios"] = dataConvenios.filterConvenio.codigoConvenio;
        if (dataConvenios.filterConvenio.nombreConvenio !== "")
          obj["nombre_convenio"] = dataConvenios.filterConvenio.nombreConvenio;

        const data = {
          ...obj,
          page,
          limit,
          sortBy: "pk_convenios",
          sortDir: "DESC",
        };
        notifyPending(
          peticionConsultaConvenio({}, data),
          {
            render: () => {
              return "Procesando consulta";
            },
          },
          {
            render: ({ data: res }) => {
              setDataConvenios((old) => {
                return { ...old, convenios: res.obj.results ?? [] };
              });
              setMaxPages(res.obj.maxPages ?? 0);
              return res?.msg ?? "Consulta satisfactoria";
            },
          },
          {
            render: ({ data: error }) => {
              validNavigate(-1);
              return error?.message ?? "Consulta fallida";
            },
          }
          // { toastId: "1" }
        );
      },
      [dataConvenios, limit, page]
    ),
    500
  );
  const tableConvenios = useMemo(() => {
    return [
      ...dataConvenios.convenios.map(({ pk_convenios, nombre_convenio }) => {
        return {
          "Id convenio": pk_convenios,
          Convenio: nombre_convenio !== "" ? nombre_convenio : "N/A",
        };
      }),
    ];
  }, [dataConvenios.convenios]);
  const onSelectConvenio = useCallback(
    (e, i) => {
      validNavigate(
        "../corresponsalia/corresponsalia-caja-social/recaudo-servicios-publicos-privados/recaudo-manual",
        {
          state: {
            id: tableConvenios[i]["Id convenio"],
            convenio: [dataConvenios.convenios[i]] ?? [],
            tipo_operacion: "manual",
          },
        }
      );
    },
    [tableConvenios, dataConvenios.convenios]
  );
  const onChangeFormat = useCallback((ev) => {
    let value = ev.target.value;
    if (ev.target.name === "codigoConvenio") {
      if (!isNaN(value)) {
        value = value.replace(/[\s\.\-+eE]/g, "");
        setDataConvenios((old) => {
          return { ...old, filterConvenio: { [ev.target.name]: value } };
        });
      }
    } else {
      setDataConvenios((old) => {
        return { ...old, filterConvenio: { [ev.target.name]: value } };
      });
    }
  }, []);
  return (
    <>
      <h1 className="text-3xl mt-10">Recaudo Servicios Públicos y Privados</h1>
      {dataConvenios.estadoTrx === 1 ? (
        <TableEnterprise
          title="Convenios Corresponsal Bancario BCSC"
          maxPage={maxPages}
          headers={["Código Convenio", "Nombre Convenio"]}
          data={tableConvenios}
          onSelectRow={onSelectConvenio}
          onSetPageData={setPageData}
          // onChange={onChange}
        >
          <Input
            id="codigoConvenio"
            label="Código Convenio"
            type="text"
            name="codigoConvenio"
            minLength="1"
            maxLength="8"
            autoComplete="off"
            required
            value={dataConvenios.filterConvenio.codigoConvenio}
            onInput={onChangeFormat}
          ></Input>
          <Input
            id="nombreConvenio"
            name="nombreConvenio"
            label={"Nombre Convenio"}
            minLength="1"
            maxLength="30"
            type="text"
            autoComplete="off"
            value={dataConvenios.filterConvenio.nombreConvenio}
            onInput={onChangeFormat}
          />
        </TableEnterprise>
      ) : (
        <></>
      )}
    </>
  );
};

export default SeleccionConvenioRecaudoServiciosCajaSocial;
