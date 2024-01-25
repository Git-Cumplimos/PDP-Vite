import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifyPending } from "../../../../utils/notify";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useFetch } from "../../../../hooks/useFetch";
import { fetchCustom } from "../../utils/fetchCreditoFacil";
import TablaExtractoCreditos from "../../components/TablaExtractoCreditos";
import Modal from "../../../../components/Base/Modal";
import PaymentSummary from "../../../../components/Compound/PaymentSummary";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";

const URL_CONSULTA_CREDITO = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/extractos-credito-facil/consulta-creditos`;
const URL_GENERAR_EXTRACTOS = `${process.env.REACT_APP_URL_CORRESPONSALIA_OTROS}/extractos-credito-facil/generacion-extracto`;

const DATA_CREDITO_UNIQUE_SIIAN_INI = {
  Agrupacion: "",
  Calificacion: "",
  Calificacionactual: "",
  Codigoasesor: "",
  Codigore: "",
  Cuotasmora: 0,
  Cuotaspagadas: 0,
  Diasmoraacumulado: 0,
  Diasmorapromedio: 0,
  Estado: "",
  Fechadesembolso: "",
  Fechadeultimopago: "",
  Fechavencimientoproximo: "",
  Formapago: "",
  Frecuenciapagocapital: "",
  Frecuenciapagointeres: "",
  Id: 0,
  Idsucursal: 0,
  Idtercero: 0,
  Nombreasesor: "",
  Nombrere: "",
  Numeroprestamo: "",
  Saldo: 0,
  Sucursal: "",
  Tasaprestamo: 0,
  Terceroprestamo: "",
  Tipocredito: "",
  Valorcuotaactual: 0,
  Valordecuota: 0,
  Valordesembolso: 0,
  Valorinteresanticipado: 0,
  Valorpagototal: 0,
  Valorpagototalcausado: 0,
  Valorparaestaraldia: 0,
  cuotas: 30,
};

const ExtractosCreditosComerciosPDP = () => {
  const validNavigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [dataCreditos, setDataCreditos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dataCreditoUnique, setDataCreditoUnique] = useState(
    DATA_CREDITO_UNIQUE_SIIAN_INI
  );
  const [loadingPeticionConsultaCredito, peticionConsultaCredito] = useFetch(
    fetchCustom(URL_CONSULTA_CREDITO, "POST", "Consultar credito")
  );
  const [loadingPeticionGeneracionExtractos, peticionGeneracionExtractos] =
    useFetch(
      fetchCustom(URL_GENERAR_EXTRACTOS, "POST", "Generación extractos")
    );
  const closeModule = useCallback(() => {
    setDataCreditoUnique(DATA_CREDITO_UNIQUE_SIIAN_INI);
    setDataCreditos([]);
    setShowModal(false);
    validNavigate(-1);
  }, [validNavigate]);
  const closeModal = useCallback(() => {
    setDataCreditoUnique(DATA_CREDITO_UNIQUE_SIIAN_INI);
    setShowModal(false);
  }, []);
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      validNavigate("/");
    } else {
      fetchComercio();
    }
  }, []);
  useEffect(() => {
    consultaCredito();
    return () => {};
  }, []);
  const fetchComercio = useCallback(() => {
    let hasKeys = true;
    const keys = [
      "id_comercio",
      "id_usuario",
      "tipo_comercio",
      "id_dispositivo",
      "ciudad",
      "direccion",
    ];
    for (const key of keys) {
      if (!(key in roleInfo)) {
        hasKeys = false;
        break;
      }
    }
    if (!hasKeys) {
      notifyError(
        "El usuario no cuenta con datos de comercio, no se permite la transaccion"
      );
      validNavigate("/");
    }
  }, [roleInfo, validNavigate]);
  const consultaCredito = useCallback(() => {
    const data = {
      id_comercio: roleInfo?.id_comercio,
    };
    notifyPending(
      peticionConsultaCredito({}, data),
      {
        render: () => {
          return "Procesando consulta";
        },
      },
      {
        render: ({ data: res }) => {
          const dataTemp = res.obj.data;
          setDataCreditos(dataTemp ?? []);
          return "Consulta satisfactoria";
        },
      },
      {
        render: ({ data: error }) => {
          closeModule();
          return error?.message ?? "Consulta fallida";
        },
      }
    );
  }, [validNavigate, roleInfo.id_comercio]);
  const generacionExtractos = useCallback(
    (tipo_extracto) => (ev) => {
      const data = {
        // id_credito: dataCreditoUnique?.cuotas,
        id_credito: 50,
        tipo_extracto: tipo_extracto,
        nombre_comercio: roleInfo?.["nombre comercio"],
        ciudad: roleInfo?.["ciudad"],
        direccion: roleInfo?.["direccion"],
        email: pdpUser?.email,
        nombre_usuario: pdpUser?.uname,
        telefono: roleInfo?.["telefono"],
        cuotas: dataCreditoUnique?.cuotas,
        estado_credito: dataCreditoUnique?.Estado,
        valor_desembolso: dataCreditoUnique?.Valordesembolso,
        saldo_credito: dataCreditoUnique?.Saldo,
        valor_pagado:
          dataCreditoUnique?.Valordesembolso - dataCreditoUnique?.Saldo,
      };
      notifyPending(
        peticionGeneracionExtractos({}, data),
        {
          render: () => {
            return "Generando reporte";
          },
        },
        {
          render: ({ data: res }) => {
            window.open(res?.obj?.url);
            closeModal();
            return "Reporte exitoso";
          },
        },
        {
          render: ({ data: error }) => {
            closeModule();
            return error?.message ?? "Reporte fallido";
          },
        }
      );
    },
    [validNavigate, roleInfo, dataCreditoUnique, pdpUser]
  );

  return (
    <>
      <h1 className="text-3xl">Extracto Créditos</h1>
      <TablaExtractoCreditos
        dataCreditos={dataCreditos}
        setDataCreditoUnique={setDataCreditoUnique}
        setShowModal={setShowModal}
      />
      <Modal
        show={showModal}
        handleClose={() => {
          if (!loadingPeticionGeneracionExtractos) closeModal();
        }}
        className="flex align-middle"
      >
        <PaymentSummary
          title="Descargar extractos de crédito"
          subtitle="Seleccione en que formato los desea descargar"
        >
          <ButtonBar>
            <Button
              type="submit"
              onClick={generacionExtractos("pdf")}
              disabled={loadingPeticionGeneracionExtractos}
            >
              Descargar extractos PDF
            </Button>
            <Button
              type="submit"
              onClick={generacionExtractos("excel")}
              disabled={loadingPeticionGeneracionExtractos}
            >
              Descargar extractos Excel
            </Button>
          </ButtonBar>
        </PaymentSummary>
      </Modal>
    </>
  );
};

export default ExtractosCreditosComerciosPDP;
