import { Fragment, useCallback, useEffect, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import SimpleLoading from "../../../components/Base/SimpleLoading";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../utils/notify";
import { postCodigoBarrasComercio } from "../utils/fetchCodigoBarrasComercio";

const CodigoBarrasComercio = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { roleInfo } = useAuth();
  const [userData, setUserData] = useState({
    id_comercio: roleInfo?.id_comercio?.toString()
      ? roleInfo?.id_comercio?.toString()
      : "",
    nombre_comercio: roleInfo["nombre comercio"]
      ? roleInfo["nombre comercio"]
      : "",
  });
  //   useEffect(() => {
  //     console.log(roleInfo);
  //   }, []);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      setIsUploading(true);
      postCodigoBarrasComercio(userData)
        .then((res) => {
          if (res?.status) {
            notify(res?.msg);
            window.open(res?.obj?.url);
            setIsUploading(false);
          } else {
            notifyError(res?.msg);
            setIsUploading(false);
          }
        })
        .catch((err) => console.error(err));
    },
    [userData]
  );
  return (
    <Fragment>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl font-medium my-6'>
        Generación del código de barras del comercio
      </h1>
      <ButtonBar>
        <Button type='submit' onClick={onSubmit}>
          Generar código de barras del comercio
        </Button>
      </ButtonBar>
    </Fragment>
  );
};

export default CodigoBarrasComercio;
