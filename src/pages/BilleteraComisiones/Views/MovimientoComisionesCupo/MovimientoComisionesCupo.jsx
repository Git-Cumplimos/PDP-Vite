import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Base/Button";
import ButtonBar from "../../../../components/Base/ButtonBar";
import Form from "../../../../components/Base/Form";
import Input from "../../../../components/Base/Input";
import Modal from "../../../../components/Base/Modal";
import MoneyInput, {
  formatMoney,
} from "../../../../components/Base/MoneyInput";
import Select from "../../../../components/Base/Select";
import SimpleLoading from "../../../../components/Base/SimpleLoading";
import { useAuth } from "../../../../hooks/AuthHooks";
import { notify, notifyError } from "../../../../utils/notify";
import { postTransferenciaComisiones } from "../../utils/fetchTransferenciaCom";

const MovimientoComisionesCupo = () => {
  const { quotaInfo, roleInfo } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [limiteRecarga, setLimiteRecarga] = useState({
    superior: 1000000,
    inferior: 100,
  });
  const [datosTrans, setDatosTrans] = useState({
    valor: 0,
    seleccion: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // /*ENVIAR NUMERO DE TARJETA Y VALOR DE LA RECARGA*/
  const onSubmit = (e) => {
    e.preventDefault();
    if (datosTrans.seleccion === "Parcial") {
      if (datosTrans.valor > limiteRecarga.superior)
        return notifyError(
          "El valor de la transferencia debe ser menor a " +
            formatMoney.format(limiteRecarga.superior)
        );
      if (datosTrans.valor < limiteRecarga.inferior)
        return notifyError(
          `El valor de la transferencia debe ser mayor a ${formatMoney.format(
            limiteRecarga.inferior
          )}`
        );
    }
    habilitarModal();
  };

  /*Funcion para habilitar el modal*/
  const habilitarModal = () => {
    setShowModal(!showModal);
  };

  const hideModal = () => {
    setShowModal(false);
    setDatosTrans({
      valor: 0,
      seleccion: "",
    });
  };

  const transferenciaComision = () => {
    const obj = {};
    if (datosTrans.seleccion === "Parcial") obj["valor"] = datosTrans.valor;

    setIsUploading(true);
    postTransferenciaComisiones({
      ...obj,
      id_comercio: roleInfo?.id_comercio ? roleInfo?.id_comercio : 0,
      id_usuario: roleInfo?.id_usuario ? roleInfo?.id_usuario : 0,
      id_terminal: roleInfo?.id_dispositivo ? roleInfo?.id_dispositivo : 0,
      nombre_comercio: roleInfo?.["nombre comercio"]
        ? roleInfo?.["nombre comercio"]
        : "No hay datos",
      opcion: datosTrans.seleccion,
    })
      .then((res) => {
        if (res?.status) {
          setIsUploading(false);
          notify(res?.msg);
          navigate(-1);
          hideModal();
        } else {
          setIsUploading(false);
          notifyError(res?.msg);
          hideModal();
        }
      })
      .catch((err) => {
        setIsUploading(false);
        notifyError("No se ha podido conectar al servidor");
        hideModal();
        console.error(err);
      });
  };
  return (
    <>
      <SimpleLoading show={isUploading} />
      <h1 className='text-3xl mb-10'>
        Movimiento billetera comisiones al cupo PDP
      </h1>
      <Form grid onSubmit={onSubmit} autoComplete='off'>
        <MoneyInput
          id='comisionActual'
          name='comisionActual'
          label='Saldo comisión Actual'
          type='text'
          autoComplete='off'
          maxLength={"15"}
          value={formatMoney.format(quotaInfo?.comision ?? 0)}
          onInput={(e, valor) => {}}
          disabled></MoneyInput>
        <Select
          id='seleccion'
          name='seleccion'
          label='Tipo de transferencia'
          options={{
            "": "",
            Total: "Total",
            Parcial: "Parcial",
          }}
          onChange={(e) => {
            setDatosTrans((old) => {
              return { ...old, seleccion: e.target.value };
            });
          }}
          required
        />
        {datosTrans.seleccion === "Parcial" && (
          <MoneyInput
            id='valor'
            name='valor'
            label='Valor a transferir'
            type='text'
            autoComplete='off'
            maxLength={"15"}
            value={datosTrans.valor ?? ""}
            onInput={(e, valor) => {
              if (!isNaN(valor)) {
                const num = valor;
                setDatosTrans((old) => {
                  return { ...old, valor: num };
                });
              }
            }}
            required></MoneyInput>
        )}
        <ButtonBar className='lg:col-span-2'>
          <Button type='submit'>Aceptar</Button>
        </ButtonBar>
      </Form>
      <Modal show={showModal} handleClose={hideModal}>
        <div className='grid grid-flow-row auto-rows-max gap-4 place-items-center text-center'>
          <h1 className='text-2xl font-semibold'>
            ¿Está seguro de realizar la transferencia de comisión?
          </h1>
          {datosTrans.seleccion === "Parcial" ? (
            <h2 className='text-base'>
              {`Valor de transacción: ${formatMoney.format(datosTrans.valor)} `}
            </h2>
          ) : (
            <h2 className='text-base'>
              {`Valor de transacción: ${formatMoney.format(
                quotaInfo?.comision ?? 0
              )} `}
            </h2>
          )}
          <ButtonBar>
            <Button onClick={hideModal}>Cancelar</Button>
            <Button type='submit' onClick={transferenciaComision}>
              Aceptar
            </Button>
          </ButtonBar>
        </div>
      </Modal>
    </>
  );
};

export default MovimientoComisionesCupo;
