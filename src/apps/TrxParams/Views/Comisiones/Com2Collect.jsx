import { Fragment } from "react";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";

const Com2Collect = () => {
  const [{ id_tipo_trx, convenios_id_convenio, autorizador_id_autorizador }] =
    useQuery();

  return (
    <Fragment>
      {!(id_tipo_trx || convenios_id_convenio || autorizador_id_autorizador) ? (
        <SearchComissions comissionFace="collect" />
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Collect;
