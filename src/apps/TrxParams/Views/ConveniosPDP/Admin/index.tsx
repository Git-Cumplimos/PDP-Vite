import { Fragment } from "react";
import Button from "../../../../../components/Base/Button";
import ButtonBar from "../../../../../components/Base/ButtonBar";
import TablaConveniosPDP from "../components/ConveniosPDP";
import { useNavigate } from "react-router-dom";

const AdminConveniosPDP = () => {
  const navigate = useNavigate();

  return (
    <Fragment>
      <ButtonBar>
        <Button
          type="submit"
          onClick={() =>
            navigate(`/params-operations/convenios-recaudo/administrar/crear`)
          }
        >
          Crear convenio
        </Button>
      </ButtonBar>
      <TablaConveniosPDP
        onSelect={(selected) =>
          navigate(
            `/params-operations/convenios-recaudo/administrar/${selected.pk_id_convenio}`
          )
        }
      />
    </Fragment>
  );
};

export default AdminConveniosPDP;
