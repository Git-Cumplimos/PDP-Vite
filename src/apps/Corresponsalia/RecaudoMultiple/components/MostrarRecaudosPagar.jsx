import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Modal from "../../../../components/Base/Modal";
import TableEnterprise from "../../../../components/Base/TableEnterprise";
import { makeMoneyFormatter } from "../../../../utils/functions";
import { notifyError } from "../../../../utils/notify";
import { postConsultaRecaudoMultiple } from "../utils/fetchRecaudoMultiple";

const formatMoney = makeMoneyFormatter(2);

const MostrarRecaudosPagar = ({
  fileName,
  setIsUploading,
  setEstadoTrx,
  roleInfo,
  pdpUser,
}) => {
  const [recaudosMultiples, setRecaudosMultiples] = useState([]);
  const [maxPages, setMaxPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [{ page, limit }, setPageData] = useState({
    page: 1,
    limit: 10,
  });
  useEffect(() => {
    fetchRecaudoMultipleFunc();
  }, [fileName]);
  const dataTable = useMemo(() => {
    return recaudosMultiples.map(
      ({ id_convenio, numero_referencia, valor_trx }) => {
        return {
          id_convenio,
          numero_referencia,
          valor_trx: formatMoney.format(valor_trx),
        };
      }
    );
  }, [recaudosMultiples]);
  const fetchRecaudoMultipleFunc = () => {
    let obj = {
      filename: fileName,
      comercio: {
        id_comercio: roleInfo?.id_comercio,
        id_usuario: roleInfo?.id_usuario,
        id_terminal: roleInfo?.id_dispositivo,
        nombre_comercio: roleInfo?.["nombre comercio"],
        nombre_usuario: pdpUser?.uname ?? "",
        is_oficina_propia:
          roleInfo?.tipo_comercio === "OFICINAS PROPIAS" ||
          roleInfo?.tipo_comercio === "KIOSCO"
            ? true
            : false,
      },
      ubicacion: {
        address: roleInfo?.direccion,
        dane_code: roleInfo?.codigo_dane,
        city: roleInfo?.ciudad,
      },
    };
    postConsultaRecaudoMultiple(obj)
      .then((res) => {
        if (!res?.status) {
          setIsUploading(false);
          setEstadoTrx(0);
          return notifyError(res?.msg);
        }
        setRecaudosMultiples(res?.obj?.results ?? []);
      })
      .catch((err) => {
        notifyError("Error de conexion con el servicio");
        setIsUploading(false);
        setEstadoTrx(0);
        console.error(err);
      });
  };
  return (
    <>
      <ButtonBar>
        <Button
          onClick={() => {
            notifyError("Transacción cancelada por el usuario");
            setEstadoTrx(0);
          }}>
          Cancelar proceso
        </Button>
        <Button
          onClick={() => {
            setShowModal(true);
          }}
          type='submit'>
          Realizar transacción
        </Button>
      </ButtonBar>
      <TableEnterprise
        title='Lista de recaudos'
        maxPage={maxPages}
        headers={["Id convenio", "Referencia", "Valor trx"]}
        data={dataTable}
        onSetPageData={setPageData}></TableEnterprise>
      <Modal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
        }}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          <h1 className='text-2xl text-center mb-5 font-semibold'>
            ¿Está seguro de realizar el proceso de recaudo?
          </h1>
          <ButtonBar>
            <Button
              onClick={() => {
                notifyError("Transacción cancelada por el usuario");
                setEstadoTrx(0);
              }}>
              Cancelar
            </Button>
            <Button type='submit' onClick={() => setEstadoTrx(2)}>
              Realizar pago
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </>
  );
};

export default MostrarRecaudosPagar;
