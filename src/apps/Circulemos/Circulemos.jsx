import React from "react";
import Form from "../../components/Base/Form";
import Input from "../../components/Base/Input";
import Button from "../../components/Base/Button";
import ButtonBar from "../../components/Base/ButtonBar";

const Circulemos = () => {
  return (
    <>
      <h1 className="text-3xl mt-6">Consulta radicado</h1>
      <div class="hidden sm:block" aria-hidden="true">
        <div class="py-5">
          <div class="border-t border-gray-900 overflow"></div>
        </div>
      </div>
      <Form>
        <Input
          id="codigoTipoIdentificacion"
          label="Tipo Identificación"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="numeroIdentificacion"
          label="Numero identificación"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="numeroPrefactura"
          label="Numero prefactura"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="codigoServicioFacturacion"
          label="Código servicio facturación"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="fechaInicial"
          label="Fecha inicial"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="fechaFinal"
          label="Fecha final"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="listadoEstadosPrefactura"
          label="Estados prefactura"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <Input
          id="radicadoSolicitud"
          label="Solicitud radicado"
          type="text"
          minLength="7"
          maxLength="12"
          autoComplete="off"
          value="Valor quemado"
        />
        <ButtonBar className="col-auto md:col-span-2">
          <Button type="submit">Consultar recaudos</Button>
        </ButtonBar>
      </Form>
    </>
  );
};

export default Circulemos;
