import React, { useState } from "react";
import Form from "../../components/Base/Form";
import Input from "../../components/Base/Input";
import Button from "../../components/Base/Button";
import ButtonBar from "../../components/Base/ButtonBar";
import Modal from "../../components/Base/Modal";

const Circulemos = () => {
  const [modal, setModal] = useState(false);
  const [payment, setPayment] = useState(false);
  const [temp, setTemp] = useState("{}");
  const [type, setType] = useState("");

  const paymentType = (value) => {
    setType(value);
  };
  const HandleClick = (e) => {
    e.preventDefault();
    setModal(true);
    setTemp({
      codigo: 200,
      status: true,
      msg: "Consulta de radicado exitosa",
      res: {
        codigo: "1",
        descripcion: "1",
        prefacturas: {
          carteraWSDTO: { idTipoObligacionDto: 1, numeroObligacion: "1234" },
          codigoOrganismoDetalle: { codigo: "1234", descripcion: "pruebas" },
          estadoPrefactura: 1,
          fechaLiquidacion: "22-04-2022",
          fechaPrefactura: "10-01-2022",
          fechaVencimiento: "28-04-2022",
          numeroLiquidacion: "123",
          numeroPrefactura: "12345",
          solicitante: {
            codigoTipoIdentificacion: "1",
            numeroIdentificacion: "1015456",
          },
          tramites: {
            cantidad: 1,
            codigoTramite: "1",
            conceptos: {
              codigo: "1",
              naturaleza: "1",
              nombre: "Datos",
              tipoSaldo: "saldo",
              unidadesALiquidar: 10,
              valorTotal: 10000,
              valorUnitario: 1000,
            },
            idTramite: 1,
            radicadoSolicitud: "1",
            referencias: ["ref1", "ref2", "ref3"],
          },
          valorTotal: 10000,
        },
      },
    });
  };
  console.log(modal, temp, payment, type);
  return (
    <>
      <h1 className="text-3xl mt-6">Consulta radicado</h1>
      <div class="hidden sm:block" aria-hidden="true">
        <div class="py-5">
          <div class="border-t border-gray-900 overflow"></div>
        </div>
      </div>
      <Form>
        {!temp?.status && (
          <>
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
            <ButtonBar className="col-auto md:col-span-2">
              <Button type="submit" onClick={(e) => HandleClick(e)}>
                Consultar radicado
              </Button>
            </ButtonBar>
          </>
        )}
        {temp?.status && (
          <>
            <>
              {[temp?.res].map((data) => {
                return (
                  <div className="p-4 mx-16 space-y-4">
                    <span class="inline-block w-32 h-12 rounded-lg">
                      Código: {data?.codigo}
                    </span>
                    <span class="inline-block w-32 h-12 rounded-lg">
                      Descripción: {data?.descripcion}
                    </span>
                    <span class="block h-12 rounded-lg">
                      {[data?.prefacturas].map((prefactura) => {
                        return (
                          <>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Estado: {prefactura?.estadoPrefactura}
                            </span>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Fecha liquidación: {prefactura?.fechaLiquidacion}
                            </span>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Fecha prefactura: {prefactura?.fechaPrefactura}
                            </span>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Fecha vencimiento: {prefactura?.fechaVencimiento}
                            </span>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Número liquidación:{" "}
                              {prefactura?.numeroLiquidacion}
                            </span>
                            <span class="inline-block w-32 h-12 rounded-lg">
                              Número prefactura: {prefactura?.numeroPrefactura}
                            </span>
                            <span class="block h-12 rounded-lg">
                              <span class="inline-block w-32 h-12 rounded-lg">
                                Solicitante:{" "}
                                {[prefactura?.solicitante].map(
                                  (solicitante) => {
                                    return (
                                      <>
                                        <span class="inline-block w-32 h-12 rounded-lg">
                                          Tipo identificación:{" "}
                                          {
                                            solicitante?.codigoTipoIdentificacion
                                          }
                                        </span>
                                        <span class="inline-block w-32 h-12 rounded-lg">
                                          Número identificación:{" "}
                                          {solicitante?.numeroIdentificacion}
                                        </span>
                                      </>
                                    );
                                  }
                                )}
                              </span>
                              <span class="inline-block w-32 h-12 rounded-lg">
                                Organismo:{" "}
                                {[prefactura?.codigoOrganismoDetalle].map(
                                  (organismo) => {
                                    return (
                                      <>
                                        <span class="inline-block w-32 h-12 rounded-lg">
                                          Código: {organismo?.codigo}
                                        </span>
                                        <span class="inline-block w-32 h-12 rounded-lg">
                                          Detalle: {organismo?.descripcion}
                                        </span>
                                      </>
                                    );
                                  }
                                )}
                              </span>
                              <span class="inline-block w-32 h-12 rounded-lg">
                                Cartera:{" "}
                                {[prefactura?.carteraWSDTO].map((cartera) => {
                                  return (
                                    <>
                                      <span class="inline-block w-32 h-12 rounded-lg">
                                        Tipo obligación:{" "}
                                        {cartera?.idTipoObligacionDto}
                                      </span>
                                      <span class="inline-block w-32 h-12 rounded-lg">
                                        Número obligación:{" "}
                                        {cartera?.numeroObligación}
                                      </span>
                                    </>
                                  );
                                })}
                              </span>
                              <span class="inline-block w-32 h-12 rounded-lg">
                                Trámites:{" "}
                                {[prefactura?.tramites].map((tramite) => {
                                  return (
                                    <>
                                      <span class="inline-block w-32 h-12 rounded-lg">
                                        Tipo obligación:{" "}
                                        {tramite?.idTipoObligacionDto}
                                      </span>
                                      <span class="inline-block w-32 h-12 rounded-lg">
                                        Número obligación:{" "}
                                        {tramite?.numeroObligación}
                                      </span>
                                      <span class="inline-block w-32 h-12 rounded-lg">
                                        Número obligación:{" "}
                                        {tramite?.numeroObligación}
                                      </span>
                                    </>
                                  );
                                })}
                              </span>
                              <span class="inline-block w-32 h-12 rounded-lg">
                                Valor total: {prefactura?.valorTotal}
                              </span>
                            </span>
                          </>
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </>
            <Button type="button" onClick={() => setPayment(true)}>
              Pagar
            </Button>
          </>
        )}
      </Form>
      <Modal show={payment} handleClose={() => setPayment(false)}>
        <h1>Metodos de pago</h1>
        <br />
        <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
          Efectivo
          <input
            id="Efectivo"
            value="efectivo"
            name="pago"
            type="radio"
            onChange={(e) => paymentType(e.target.value)}
          />
          Tarjeta débito/crédito
          <input
            id="tarjeta"
            value="tarjeta"
            name="pago"
            type="radio"
            onChange={(e) => paymentType(e.target.value)}
          />
        </div>
        {type === "efectivo" ? (
          <>
            <Input
              id="codigoTipoIdentificacion"
              label="Valor efectivo"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
              <Button type="button">Finalizar transacción</Button>
            </div>
          </>
        ) : type === "tarjeta" ? (
          <>
            <h1>Datos voucher</h1>
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <br />
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <br />
            <Input
              id="codigoTipoIdentificacion"
              label="Data 1"
              type="text"
              minLength="7"
              maxLength="12"
              autoComplete="off"
            />
            <div className="flex flex-row justify-center items-center mx-auto container gap-10 text-lg">
              <Button type="button">Finalizar transacción</Button>
            </div>
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};

export default Circulemos;
