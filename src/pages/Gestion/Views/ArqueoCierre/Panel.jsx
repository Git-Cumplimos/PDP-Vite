import { useState, useEffect, Fragment, useCallback } from "react";
import Arqueo from "./Arqueo";
import Cierre from "./Cierre";
import Modal from "../../../../components/Base/Modal";
import Button from "../../../../components/Base/Button";
import { useAuth } from "../../../../hooks/AuthHooks";
import { searchCash, searchCierre, buscarComprobantes } from "../../utils/fetchCaja";

const Panel = () => {
  const [total, setTotal] = useState("");
  const [totalCierres, setTotalCierres] = useState(false);
  const [allowClose, setAllowClose] = useState(true);
  const [cierre, setCierre] = useState(false);
  const [resArqueo, setResArqueo] = useState("");
  const [respuestaComprobante, setRespuestaComprobante] = useState([]);
  const [sobrante, setSobrante] = useState("");
  const [faltante, setFaltante] = useState("");
  const { roleInfo } = useAuth();

  // const date = new Date();

  useEffect(() => {
    const query = {
      id_usuario: roleInfo?.id_usuario,
      id_comercio: roleInfo?.id_comercio,
      id_terminal: roleInfo?.id_dispositivo,
    };
    searchCash(query)
      .then((res) => {
        setTotal(res);
      })
      .catch((err) => {
        throw err;
      });
    searchCierre(query)
      .then((res) => {
        if (res?.status) {
          setTotalCierres(res?.obj);
          query.status = "APROBADO";
          buscarComprobantes(query)
            .then((res) => {
              console.log(res);
              setRespuestaComprobante(res?.obj?.results);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [roleInfo?.id_comercio, roleInfo?.id_dispositivo, roleInfo?.id_usuario]);

  const [estado, setEstado] = useState(false);
  const closeModalFunction = useCallback(() => {
    setEstado(false);
    setCierre(false);
  }, []);

  return (
    roleInfo.tipo_comercio === "OFICINAS PROPIAS" && (
      <Fragment>
        {totalCierres === 2 ? (
          <Fragment>
            <h1>Señor usuario la caja ya fue cerrada el día de hoy</h1>
          </Fragment>
        ) : totalCierres === 3 || totalCierres === 1 || true ? (
          <Fragment>
            <Button onClick={() => setEstado(true)}>
              Arqueo y cierre de caja
            </Button>
          </Fragment>
        ) : (
          <h1>Cargando...</h1>
        )}
        <Modal
          show={estado}
          handleClose={closeModalFunction}
          allowClose={allowClose}
        >
          {!cierre && (
            <Arqueo
              caja={total}
              respuestaComprobante={respuestaComprobante}
              setCierre={setCierre}
              setResArqueo={setResArqueo}
              setSobrante={setSobrante}
              setFaltante={setFaltante}
              setAllowClose={setAllowClose}
            />
          )}
          {cierre && (
            <Cierre
              arqueo={resArqueo}
              respuestaComprobante={respuestaComprobante}
              caja={total}
              roleInfo={roleInfo}
              setEstado={setEstado}
              setCierre={setCierre}
              sobra={sobrante}
              falta={faltante}
            />
          )}
        </Modal>
      </Fragment>
    )
  );
};

export default Panel;
