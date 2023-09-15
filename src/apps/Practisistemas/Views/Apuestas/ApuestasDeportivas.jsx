import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Input from "../../../../components/Base/Input";
import { notifyPending } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { fetchCustom } from "../../utils/fetchPractisistemas";
import { useFetch } from "../../../../hooks/useFetch";
import useDelayedCallback from "../../../../hooks/useDelayedCallback";

const URL_CONSULTAR_CASAS = `${process.env.REACT_APP_PRACTISISTEMAS}/apuestas-deportivas/tabla-casa-apuestas`;
const URL_CONSULTAR_CASAS_PRACTISISTEMAS = `${process.env.REACT_APP_PRACTISISTEMAS}/apuestas-deportivas/consulta-casa-apuestas`;

const ApuestasDeportivas = ({ subRoutes }) => {
  const navigate = useNavigate();
  const [casas, setCasas] = useState([]);
  const [maxPages, setMaxPages] = useState(0);
  const { roleInfo } = useAuth();
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  const [datosTrans, setDatosTrans] = useState({
    casaApuesta: "",
    inputCasa: "",
  });

  const tablaCasaApuestas = useMemo(() => {
    return [
      ...casas.map(({ descripcion }) => {
        return {
          Descripcion: descripcion,
        };
      }),
    ];
  }, [casas]);

  const [loadingPeticionConsultaCasas, peticionConsultaCasas] = useFetch(
    fetchCustom(URL_CONSULTAR_CASAS, "GET", "Consultar casas apuestas")
  );
  const [
    loadingPeticionConsultaCasasPractisistemas,
    peticionConsultaCasasPractisitemas,
  ] = useFetch(
    fetchCustom(
      URL_CONSULTAR_CASAS_PRACTISISTEMAS,
      "POST",
      "Consultar casas apuestas practisistemas"
    )
  );
  useEffect(() => {
    fetchCasasApuestasFunc();
  }, [datosTrans, page, limit]);
  const fetchCasasApuestasFunc = useDelayedCallback(
    useCallback(() => {
      const data = {
        page,
        limit,
      };
      if (datosTrans.casaApuesta !== "")
        data["descripcion"] = datosTrans?.casaApuesta;
      if (
        !loadingPeticionConsultaCasasPractisistemas &&
        !loadingPeticionConsultaCasas
      ) {
        notifyPending(
          peticionConsultaCasas(data, {}),
          {
            render: () => {
              return "Procesando consulta";
            },
          },
          {
            render: ({ data: res }) => {
              if (res.obj.length === 2) {
                setCasas(res?.obj[0] ?? []);
                setMaxPages(res?.obj[1] ?? 1);
                return "Consulta satisfactoria";
              } else {
                return "Error al procesar los datos";
              }
            },
          },
          {
            render: ({ data: error }) => {
              return error?.message ?? "Consulta fallida";
            },
          }
        );
      }
    }, [
      limit,
      page,
      datosTrans,
      loadingPeticionConsultaCasas,
      loadingPeticionConsultaCasasPractisistemas,
    ]),
    500
  );
  const onSelectHouse = useCallback(
    (e, i) => {
      const data = {
        idcomercio: roleInfo?.["id_comercio"],
        casaApuesta: casas[i]["descripcion"],
      };
      if (
        !loadingPeticionConsultaCasasPractisistemas &&
        !loadingPeticionConsultaCasas
      ) {
        notifyPending(
          peticionConsultaCasasPractisitemas({}, data),
          {
            render: () => {
              return "Procesando consulta";
            },
          },
          {
            render: ({ data: res }) => {
              if (res.obj.length !== 0) {
                navigate("../apuestas-deportivas/Recargar", {
                  state: {
                    casaApuesta: casas[i]["descripcion"],
                    producto: casas[i]["op"],
                  },
                });
                return "Consulta satisfactoria";
              } else {
                return `La casa de apuestas ${casas[i]["descripcion"]} no tiene datos por mostrar`;
              }
            },
          },
          {
            render: ({ data: error }) => {
              return error?.message ?? "Consulta fallida";
            },
          }
        );
      }
    },
    [
      navigate,
      casas,
      roleInfo,
      loadingPeticionConsultaCasas,
      loadingPeticionConsultaCasasPractisistemas,
    ]
  );

  return (
    <>
      <h1 className='text-3xl text-center'>Servicios de Apuestas Deportivas</h1>
      <TableEnterprise
        title='Tabla Casas de Apuestas Deportivas'
        maxPage={maxPages}
        headers={["Nombre"]}
        data={tablaCasaApuestas}
        onSelectRow={onSelectHouse}
        onSetPageData={setPageData}>
        <Input
          id='searchConvenio'
          name='searchConvenio'
          label={"Nombre Casa de Apuesta Deportiva"}
          minLength='1'
          maxLength='30'
          type='text'
          autoComplete='off'
          onInput={(e) => {
            setDatosTrans((old) => {
              return { ...old, casaApuesta: e.target.value };
            });
          }}
        />
      </TableEnterprise>
    </>
  );
};

export default ApuestasDeportivas;
