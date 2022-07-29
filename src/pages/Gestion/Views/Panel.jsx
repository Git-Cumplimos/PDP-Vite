import { useState, useEffect } from "react";
import Arqueo from "./Arqueo";
import Cierre from "./Cierre";
import Modal from "../../../components/Base/Modal";
import Button from "../../../components/Base/Button";
import { useAuth } from "../../../hooks/AuthHooks";
import { searchCash, searchCierre, searchReceipt } from "../utils/fetchCaja";

const Panel = () => {
  const [total, setTotal] = useState("");
  const [totalCierres, setTotalCierres] = useState(false);
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
          searchReceipt(query)
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
  }, []);

  const [estado, setEstado] = useState(false);
  const closeModalFunction = () => {
    setEstado(false);
    setCierre(false);
  };

  return (
    <>
      {roleInfo.tipo_comercio === "OFICINAS PROPIAS" ? (<>
        {totalCierres === 2 ? (
        <>
          <h1>Señor usuario la caja ya fue cerrada el día de hoy</h1>
        </>
      ) : totalCierres === 3 || totalCierres === 1 || true ? (
        <>
          <Button onClick={() => setEstado(true)}>
            Arqueo y cierre de caja
          </Button>
        </>
      ) : (
        <h1>Cargando...</h1>
      )}
      <Modal show={estado} handleClose={closeModalFunction}>
        {!cierre && (
          <Arqueo
            caja={total}
            respuestaComprobante={respuestaComprobante}
            setCierre={setCierre}
            setResArqueo={setResArqueo}
            setSobrante={setSobrante}
            setFaltante={setFaltante}
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
      </>) : (<></>)}
    </>
  );
};

export default Panel;
