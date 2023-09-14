import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/AuthHooks";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import Input from "../../../../components/Base/Input";
import { notify, notifyError, notifyPending } from "../../../../utils/notify";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import {
  postConsultaCasasApuestas,
  postCasaApuestas,
  postInsertCasaApuestas,
  postDeleteCasaApuestas,
} from "../../utils/fetchServicioApuestas";
import Form from "../../../../components/Base/Form";
import { fetchCustom } from "../../utils/fetchPractisistemas";
import { useFetch } from "../../../../hooks/useFetch";

const URL_CONSULTAR_CASAS = `${process.env.REACT_APP_PRACTISISTEMAS}/apuestas-deportivas/tabla-casa-apuestas`;

const ApuestasDeportivas = ({ subRoutes }) => {
  const [respuesta, setRespuesta] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
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

  const fecthTablaCasasApuestasPaginadoFunc = () => {
    setRespuesta(true);
    postConsultaCasasApuestas({
      casaApuesta: datosTrans.casaApuesta,
    })
      .then((autoArr) => {
        if (autoArr?.error_msg?.error_bd_logs?.description) {
          notifyError(autoArr?.error_msg.error_bd_logs.description);
        }
        setRespuesta(false);
        setMaxPages(autoArr?.maxPages);
        setCasas(autoArr?.response ?? []);
      })
      .catch((err) => console.error(err));
  };
  const [loadingPeticionConsultaCasas, peticionConsultaCasas] = useFetch(
    fetchCustom(URL_CONSULTAR_CASAS, "GET", "Consultar casas apuestas")
  );
  useEffect(() => {
    fetchCasasApuestasFunc();
  }, [datosTrans, page, limit]);
  const fetchCasasApuestasFunc = useCallback(() => {
    const data = {
      page,
      limit,
    };
    if (datosTrans.casaApuesta !== "")
      data["descripcion"] = datosTrans?.casaApuesta;
    notifyPending(
      peticionConsultaCasas(data, {}),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          console.log(res);
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
  }, [limit, page, datosTrans]);
  const onSelectHouse = useCallback(
    (e, i) => {
      setRespuesta(true);
      postCasaApuestas({
        idcomercio: roleInfo?.["id_comercio"],
        casaApuesta: casas[i]["descripcion"],
      })
        .then((response) => {
          setRespuesta(false);
          if (response.length != 0) {
            navigate("../apuestas-deportivas/Recargar", {
              state: {
                casaApuesta: casas[i]["descripcion"],
                producto: casas[i]["op"],
              },
            });
          } else {
            notify(
              "La casa de apuestas " +
                casas[i]["descripcion"] +
                " no tiene datos por mostrar"
            );
          }
        })
        .catch((err) => console.error(err));
    },
    [navigate, casas]
  );

  return (
    <>
      <SimpleLoading show={respuesta} />
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
