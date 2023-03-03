import { Fragment, useEffect, useState } from "react";
import { useAuth } from "../../../../hooks/AuthHooks";
import { useNavigate } from "react-router-dom";
import ConsultarRecaudosMultiples from "../components/ConsultarRecaudosMultiples";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Button from "../../../../components/Base/Button";

const ConsultaRecaudoMultiple = () => {
  const navigate = useNavigate();
  const { roleInfo, pdpUser } = useAuth();
  const [uuid, setUuid] = useState("");
  const [intUuid, setIntUuid] = useState("");
  useEffect(() => {
    if (!roleInfo || (roleInfo && Object.keys(roleInfo).length === 0)) {
      navigate("/");
    }
  }, []);
  const onSubmitUuid = (e) => {
    e.preventDefault();
    setUuid(intUuid);
    setIntUuid("");
  };
  const resetUuid = (e) => {
    e.preventDefault();
    setUuid("");
    setIntUuid("");
  };
  return (
    <>
      <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
        <h1 className='text-3xl text-center mb-10 mt-5'>
          Consulta recaudo multiple
        </h1>
        {uuid === "" ? (
          <Form onSubmit={onSubmitUuid}>
            <Input
              id='intUuid'
              label='Identificador proceso'
              type='text'
              name='intUuid'
              minLength='36'
              maxLength='36'
              required
              value={intUuid}
              autoComplete='off'
              onInput={(e) => {
                setIntUuid(e.target.value);
              }}
            />
            <ButtonBar>
              <Button type='submit'>Realizar consulta</Button>
            </ButtonBar>
          </Form>
        ) : (
          <>
            <ConsultarRecaudosMultiples
              uuid={uuid}
              roleInfo={roleInfo}
              pdpUser={pdpUser}
            />
            <ButtonBar>
              <Button type='submit' onClick={resetUuid}>
                Volver a ingresar indentificador
              </Button>
            </ButtonBar>
          </>
        )}
      </div>
    </>
  );
};

export default ConsultaRecaudoMultiple;
