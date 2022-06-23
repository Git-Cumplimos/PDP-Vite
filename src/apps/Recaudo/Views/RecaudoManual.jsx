import { Fragment, useEffect, useMemo, useState } from "react";
import useQuery from "../../../hooks/useQuery";
import fetchData from "../../../utils/fetchData";
import FlujoRecaudo from "../components/FlujoRecaudo/FlujoRecaudo";

const urlConvenios = process.env.REACT_APP_URL_REVAL_CONVENIOS;

const RecaudoManual = () => {
  const [{ id_convenio }] = useQuery();

  const [dataConvenio, setDataConvenio] = useState(null);
  const foundRefs = useMemo(() => {
    if (!dataConvenio?.referencias) {
      return [];
    }
    return [
      ...dataConvenio?.referencias?.map(({ nombre_referencia, min, max }) => {
        return {
          nombre_referencia,
          name: "referencias",
          type: "text",
          minLength: min,
          maxLength: max,
          defaultValue: "",
          required: true,
        };
      }),
      {
        nombre_referencia: "Valor",
        name: "valor",
        type: "number",
        min: 1000,
        max: 99999999,
        defaultValue: "",
      },
    ];
  }, [dataConvenio]);

  useEffect(
    () => {
      
      fetchData(`${urlConvenios}/convenio_unique`, "GET", {
        id_convenio,
      })
        .then((res) => {
          if (res?.status) {
            setDataConvenio(res?.obj?.results?.[0]);
          } else {
            setDataConvenio(null);
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    },
    [id_convenio]
  );

  return (
    <Fragment>
      {dataConvenio && "nombre_convenio" in dataConvenio ? (
        <h1 className="text-3xl mt-6">Recaudo {dataConvenio?.nombre_convenio}</h1>
      ) : (
        ""
      )}
      <FlujoRecaudo foundRefs={foundRefs} />
    </Fragment>
  );
};

export default RecaudoManual;
