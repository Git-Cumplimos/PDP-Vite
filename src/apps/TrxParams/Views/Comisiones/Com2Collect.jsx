import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";

const Com2Collect = () => {
  const [{ id_comision_cobrada }] = useQuery();
  const navigate = useNavigate();
  return (
    <Fragment>
      {!id_comision_cobrada ? (
        <Fragment>
          <ButtonBar>
            <Button onClick={() => navigate("crear")}>Crear comision</Button>
          </ButtonBar>
          <SearchComissions comissionFace="collect" />
        </Fragment>
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Collect;
