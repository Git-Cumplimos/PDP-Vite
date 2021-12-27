import { Fragment } from "react";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";

const Com2Pay = () => {
  const [{ id_tipo_trx, id_comercio, id_convenio }] = useQuery();

  return (
    <Fragment>
      {!(id_tipo_trx || id_comercio || id_convenio) ? (
        <SearchComissions comissionFace="pay" />
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Pay;
