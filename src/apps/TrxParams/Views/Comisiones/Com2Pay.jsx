import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import useQuery from "../../../../hooks/useQuery";

import EditComission from "../../components/EditComission/EditComission";
import SearchComissions from "../../components/SearchComissions/SearchComissions";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";

const Com2Pay = () => {
  const [{ id_comision_pagada }] = useQuery();

  const navigate = useNavigate();

  return (
    <Fragment>
      {!id_comision_pagada ? (
        <Fragment>
          <ButtonBar>
            <Button onClick={() => navigate("personalizadas")}>
              Crear comision
            </Button>
          </ButtonBar>
          <SearchComissions comissionFace="pay" />
        </Fragment>
      ) : (
        <EditComission />
      )}
    </Fragment>
  );
};

export default Com2Pay;
