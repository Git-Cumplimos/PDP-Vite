import React, { Fragment, useCallback, useState } from "react";
import { onChangeNumber } from "../../../utils/functions";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import Modal from "../../../components/Base/Modal";
import MoneyInput, { formatMoney } from "../../../components/Base/MoneyInput";
import PaymentSummary from "../../../components/Compound/PaymentSummary";
import { useAuth } from "../../../hooks/AuthHooks";
import { notify, notifyError, notifyPending } from "../../../utils/notify";
import { postCupoComercio } from "../utils/fetchCupo";
import { cargarArchivoCupoMasivo, getConsultaComercioEspecifico } from "../utils/fetchFunctions";
import { descargarArchivo, descargarFormato } from "../utils/functions";

const CrearCupo = () => {
  const [idComercio, setIdComercio] = useState(null);
  const [deuda, setDeuda] = useState(0);
  const [paymentStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState({});
  const [sobregiro, setSobregiro] = useState(0);
  const [diasMaxSobregiro, setDiasMaxSobregiro] = useState(0);
  const [canje, setCanje] = useState(0);
  const [baseCaja, setBaseCaja] = useState(0);
  const [showModalCargaMasiva, setShowModalCargaMasiva] = useState(false);
  const [cargarArchivo, setCargarArchivo] = useState(false);
  const [cupoComer, setCupoComer] = useState([]);
  const [file, setFile] = useState(null);
  const typoArchivos = ["text/csv"]

  const limitesMontos = {
    max: 9999999999,
    min: 0,
  };
  const { roleInfo, pdpUser } = useAuth();
  const navigate = useNavigate();

  const onChangeId = useCallback((ev) => {
    if ( cupoComer.length >= 1 ) return false

    const formData = new FormData(ev.target.form);
    const idComer = (
      (formData.get("Id comercio") ?? "").match(/\d/g) ?? []
    ).join("");
    setIdComercio(idComer);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);
  const handleCloseCargaMasiva = useCallback(() => {
    setShowModalCargaMasiva(false);
    setCargarArchivo(false);
  }, []);

  const onSubmitComercio = useCallback(
    (e) => {
      e.preventDefault();
      // if (
      //   sobregiro !== 0 && deuda !== 0 && canje !== 0
      // ) {
      setShowModal(true);
      setSummary({
        "Id del comercio": idComercio,
        "Sobregiro": formatMoney.format(sobregiro),
        "Cartera": formatMoney.format(deuda), // Deuda
        "Deuda": formatMoney.format(canje), // Cupo en canje
        "Base de caja": formatMoney.format(baseCaja),
        "Dias máximos de sobregiro": diasMaxSobregiro,
      });
      // } else {
      //   notifyError(
      //     "Los campos sobregiro, cartera o deuda no pueden ser cero"
      //   );
      // }
    },
    [idComercio, deuda, canje, sobregiro, baseCaja, diasMaxSobregiro]
  );
  const crearComercio = useCallback(
    (e) => {
      const body = {
        pk_id_comercio: idComercio,
        sobregiro: sobregiro,
        deuda: deuda,
        cupo_en_canje: canje,
        base_caja: baseCaja ?? 0,
        dias_max_sobregiro: parseInt(diasMaxSobregiro) ?? 0,
        usuario: roleInfo.id_usuario ?? pdpUser?.uuid ?? -1,
      };
      postCupoComercio(body)
        .then((res) => {
          if (!res?.status) {
            notifyError(res?.msg);
            return;
          }
          notify("Cupo creado exitosamente")
          navigate(`/cupo`)
        })
        .catch((r) => {
          console.error(r.message);
          notifyError("Error al crear cupo");
        });
    },
    [
      idComercio,
      deuda,
      baseCaja,
      diasMaxSobregiro,
      canje,
      sobregiro,
      roleInfo.id_usuario,
      navigate,
      pdpUser
    ]
  );

  const onMoneyChange = useCallback((e, valor = 0) => {
    const setValues = {
      "sobregiro": () => setSobregiro(valor),
      "deuda": () => setDeuda(valor),
      "cupo_canje": () => setCanje(valor),
      "base_caja": () => setBaseCaja(valor),
    }
    setValues[e.target.name]?.()
  }, []);

  const CargarArchivo = useCallback(
    async (e) => {
      e.preventDefault();
      if (!typoArchivos.includes(file.type)) {
        notifyError('Tipo de archivo incorrecto')
        return;
      }

      notifyPending(
        cargarArchivoCupoMasivo(
          file,
          roleInfo?.id_usuario ?? pdpUser?.uuid,
          roleInfo?.id_comercio ?? 0,
          roleInfo?.id_dispositivo ?? 0,
        ),
        {
          render() {
            return "Enviando solicitud";
          },
        },
        {
          render({ data: res }) {
            handleCloseCargaMasiva();
            return res?.msg;
          },
        },
        {
          render({ data: err }) {
            if (err?.obj?.url && err.obj?.url !== "") {
              descargarArchivo("Error-del-archivo.csv", err.obj?.url)
            }
            handleCloseCargaMasiva()
            if (!err.msg || err.msg === "") {
              return `Archivo erróneo`;
            }
            return err.msg
          },
        }
      );

    }, [handleCloseCargaMasiva, file, typoArchivos, roleInfo, pdpUser]);

  const consultaCupoComercios = useCallback((e) => {
    e.preventDefault();
    notifyPending(
      getConsultaComercioEspecifico({ 'pk_comercio': idComercio }),
      {
        render() {
          return "Enviando solicitud";
        },
      },
      {
        render({ data: res }) {
          if (!res?.obj || res?.obj?.length === 0) {
            notifyError("No se encontraron comercios con ese id");
            return;
          }
          setCupoComer(res?.obj ?? []);
          return res?.msg;
        },
      },
      {
        render({ data: err }) {
          console.log(err)
          return err?.message
        }
      }
    )

  }, [idComercio]);

  return (
    <Fragment>
      <h1 className="text-3xl mt-6">Crear cupo Comercios</h1>
      <Form onSubmit={cupoComer.length === 1 ? onSubmitComercio : consultaCupoComercios} grid>
        <ButtonBar className={"lg  col-span-2"}>
          <Button
            type="button"
            onClick={() => { setShowModalCargaMasiva(true) }}
          >
            Creación y/o actualización masiva de cupos
          </Button>
        </ButtonBar>
        <Input
          id="Id comercio"
          name="Id comercio"
          label="Id comercio"
          type="text"
          autoComplete="off"
          value={idComercio ?? ""}
          // minLength={"1"}
          maxLength={"10"}
          onChange={onChangeId}
          disabled={cupoComer.length >= 1 ? true : false}
          required
        />
        {cupoComer.length !== 1 ? (
          <ButtonBar>
            <Button type={"submit"} name="buscarComercio">
              Buscar comercio
            </Button>
          </ButtonBar>
        ) : (
          <>
            <Input
              id="nombre_comercio"
              name="Nombre comercio"
              label="Nombre comercio"
              type="text"
              value={cupoComer[0]?.nombre_comercio ?? ""}
              autoComplete="off"
              disabled={true}
              required
            />

            <MoneyInput
              id="sobregiro"
              name="sobregiro"
              label="Sobregiro"
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={sobregiro ?? 0}
              onInput={onMoneyChange}
              equalErrorMin={false}
              required
            />
            <MoneyInput
              id="deuda" // cartera
              name="deuda" // cartera
              label="Cartera" // Deuda
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={deuda ?? 0}
              equalErrorMin = {false}
              onInput={onMoneyChange}
              required
            />
            <MoneyInput
              id="cupo_canje"
              name="cupo_canje"
              label="Deuda" // Cupo en canje
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={canje ?? 0}
              equalErrorMin = {false}
              onInput={onMoneyChange}
              required
            />
            <MoneyInput
              id="base_caja"
              name="base_caja"
              label="Base de caja"
              autoComplete="off"
              maxLength={"14"}
              min={limitesMontos?.min}
              max={limitesMontos?.max}
              value={baseCaja ?? 0}
              onInput={onMoneyChange}
            />
            <Input
              id="dias_max_sobregiro"
              name="dias_max_sobregiro"
              label="Dias máximos sobregiro"
              type="tel"
              autoComplete="off"
              minLength={0}
              maxLength={2}
              defaultValue={0}
              onInput={(ev) => { setDiasMaxSobregiro(onChangeNumber(ev)) }}
            />

            <ButtonBar className={"lg  col-span-2"}>
              <Button type={"submit"}>Asignar cupo al comercio</Button>
            </ButtonBar>
          </>
        )}
      </Form>
      <Modal
        show={showModal}
        handleClose={paymentStatus ? () => { } : handleClose}
      >
        <PaymentSummary
          title="¿Está seguro de asignar el cupo al comercio?"
          subtitle="Resumen del comercio"
          summaryTrx={summary}
        >
          <ButtonBar>
            <Button type="submit" onClick={crearComercio}>
              Aceptar
            </Button>
            <Button onClick={handleClose}>Cancelar</Button>
          </ButtonBar>
        </PaymentSummary>
      </Modal>
      <Modal
        show={showModalCargaMasiva}
        handleClose={handleCloseCargaMasiva}
      >
        <h2 className="text-3xl mx-auto text-center mb-4">
          Gestión de archivos carga masiva de cupo
        </h2>
        <Form onSubmit={CargarArchivo}>
          {!cargarArchivo ?
            <ButtonBar>
              <Button
                type="button"
                onClick={() => {
                  setCargarArchivo(true);
                }}
              >
                Cargar Archivo
              </Button>
              <Button
                type="button"
                onClick={() => {
                  descargarFormato("Ejemplo_cupo_masivo.csv")
                  handleCloseCargaMasiva()
                }}
              >
                Formato del archivo
              </Button>
            </ButtonBar>
            : <>
              <Input
                type="file"
                autoComplete="off"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                }}
                accept=".csv,.xlsx"
                required
              />
              <ButtonBar>
                <Button type="submit">
                  Cargar Archivo
                </Button>
              </ButtonBar>
            </>
          }
        </Form>
      </Modal>
    </Fragment>
  );
};

export default CrearCupo;
