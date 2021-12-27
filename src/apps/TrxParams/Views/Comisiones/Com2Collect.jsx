import { Fragment } from "react";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";

const Com2Collect = () => {
  const [{ id_tipo_trx, id_autorizador, id_convenio }] = useQuery();

  return (
    <Fragment>
      {!(id_tipo_trx || id_autorizador || id_convenio) ? (
        <SearchComissions comissionFace="collect" />
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Collect;
