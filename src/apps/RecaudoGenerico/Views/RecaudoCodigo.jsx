import { Fragment, useCallback } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import BarcodeReader from "../../../components/Base/BarcodeReader";
import { useNavigate } from "react-router-dom";
import fetchData from "../../../utils/fetchData";
import { useAuth } from "../../../hooks/AuthHooks";

const url = process.env.REACT_APP_URL_RECAUDO_GENERICO;

const RecaudoCodigo = () => {
  const navigate = useNavigate();
  const { pdpUser, roleInfo } = useAuth();

  const navigateRecaudo = useCallback(
    (codigo_barras) => {
      const data = {
        comercio: {
          id_comercio: roleInfo.id_comercio,
          id_usuario: roleInfo.id_usuario,
          id_terminal: roleInfo.id_dispositivo,
          nombre_comercio: roleInfo?.["nombre comercio"],
          nombre_usuario: pdpUser?.uname,
        },
        ubicacion: {
          address: roleInfo.direccion,
          dane_code: roleInfo.codigo_dane,
          city: roleInfo.ciudad,
        },
        info_transaccion: {
          codigo_barras: codigo_barras,
        },
      };
      fetchData(
        `${url}/backend/recaudo-generico/convenios/consulta-convenio-codigo-barras`,
        "POST",
        {},
        data
      )
        .then((res) => {
          if (res?.status) {
            navigate("../recaudo-generico/trx", {
              state: {
                // autorizadores: res?.obj?.result?.autorizadores,
                pk_fk_id_convenio: res?.obj?.result?.pk_fk_id_convenio,
                convenio_name:
                  res?.obj?.result?.data_codigo_barras?.nombre_convenio,
                referencia:
                  res?.obj?.result?.data_codigo_barras?.codigosReferencia[0],
                // valor: res?.obj?.result?.data_codigo_barras?.pago,
              },
            });
          } else {
            console.error(res?.msg);
          }
        })
        .catch(() => {});
    },
    [navigate]
  );

  return (
    <Fragment>
      <Form grid={false} formDir="col">
        <BarcodeReader onSearchCodigo={navigateRecaudo} />
        <ButtonBar className="lg:col-span-2">
          <Button type="reset">Volver a ingresar código de barras</Button>
        </ButtonBar>
      </Form>
    </Fragment>
  );
};

export default RecaudoCodigo;
