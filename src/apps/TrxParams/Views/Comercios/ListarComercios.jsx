import { Fragment, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import CommerceTable from "../../components/Commerce/CommerceTable";

const ListarComercios = () => {
  const navigate = useNavigate();

  const onSelectComercios = useCallback(
    (comercio) =>
      navigate(
        `/params-operations/comercios-params/comercios/${comercio.pk_comercio}`
      ),
    [navigate]
  );

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() =>
            navigate("/params-operations/comercios-params/comercios/crear")
          }
        >
          Crear comercio
        </Button>
      </ButtonBar>
      <CommerceTable onSelectComerce={onSelectComercios} />
    </Fragment>
  );
};

export default ListarComercios;
