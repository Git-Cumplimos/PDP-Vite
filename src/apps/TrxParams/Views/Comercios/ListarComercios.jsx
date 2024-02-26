import { Fragment, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import CommerceTable from "../../components/Commerce/CommerceTable";
import CrearComerciosMasivo from "./CrearComerciosMasivo";
import { useState } from "react";

const ListarComercios = () => {
  const navigate = useNavigate();
  const [showMassive, setShowMassive] = useState(false);
  const [searchCommercesFn, setSearchCommercesFn] = useState(() => () => undefined);

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
        <Button type="submit" onClick={() => setShowMassive(true)}>
          Crear comercios masivo
        </Button>
      </ButtonBar>
      <CommerceTable
        onSelectComerce={onSelectComercios}
        setSearchCommercesFn={setSearchCommercesFn}
      />
      <CrearComerciosMasivo
        showMassive={showMassive}
        setShowMassive={setShowMassive}
        searchCommercesFn={searchCommercesFn}
      />
    </Fragment>
  );
};

export default ListarComercios;
