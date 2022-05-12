import React, { useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Fieldset from "../../../components/Base/Fieldset";
import Input from "../../../components/Base/Input";
import LogoPDP from "../../../components/Base/LogoPDP";
import Modal from "../../../components/Base/Modal";
import Select from "../../../components/Base/Select";
import fetchData from "../../../utils/fetchData";
import { notify, notifyError } from "../../../utils/notify";
import { useAuth } from "../../../hooks/AuthHooks";

const PpsVoluntarioDemanda = ({ ced }) => {
  const [tipoIdentificacion, setTipoIdentificacion] = useState("");
  const [numDocumento, setNumDocumento] = useState(ced);
  const [numCelular, setNumCelular] = useState("");
  const [valorAportar, setValorAportar] = useState();
  const [showModal, setShowModal] = useState(true);
  const { quotaInfo, roleInfo } = useAuth();

  console.log(roleInfo);
  const [cupoLogin, setCupoLogin] = useState(quotaInfo["quota"]);
  const [idComercio, setIdComercio] = useState(roleInfo["id_comercio"]);
  const [idusuario, setIdUsuario] = useState(roleInfo["id_usuario"]);
  const [iddispositivo, setIddispositivo] = useState(
    roleInfo["id_dispositivo"]
  );
  const [tipoComercio, setTipoComercio] = useState(roleInfo["tipo_comercio"]);
  const [esPropio, setEsPropio] = useState(false);
  const [tieneCupo, setTieneCupo] = useState(false);

  const url = process.env.REACT_APP_URL_TRXS_TRX;

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const enviar = (e) => {
    e.preventDefault();
    if (cupoLogin >= valorAportar) {
      if (tipoComercio === "OFICINAS PROPIAS") {
        setEsPropio(true);
        fetchData(
          `${url}/ModificarCupoCrearPlanillaDemanda`,
          /* `http://127.0.0.1:7000/ModificarCupoCrearPlanillaDemanda`, */
          "POST",
          {},
          {
            tipo_id: tipoIdentificacion,
            identificacion: numDocumento,
            financial_institution_code: "96",
            canal_code: "20",
            operador_code: "84",
            trazability_financial_institution_code: "1",
            value_amount: valorAportar,
            celular: numCelular,
            id_comercio: idComercio,
            id_dispositivo: iddispositivo,
            id_usuario: idusuario,
            estado_pago: "",
            es_Propio: esPropio,
          },
          {},
          {}
        )
          .then((respuesta) => {
            console.log(respuesta);
            if (
              respuesta?.msg ==
              "Exception: No fue posible hacer una conexion a la base de datos"
            ) {
              notifyError(
                "No fue posible hacer una conexion a la base de datos"
              );
            }
            if (
              respuesta?.msg ==
              "SchemaError: Key 'num_pago_pdp' error:\nint('') raised ValueError(\"invalid literal for int() with base 10: ''\")"
            ) {
              notifyError("Selecciones un Numero de Pagos");
            } else {
              if (
                respuesta?.msg ==
                "Se ha creado el comercio domiciliado voluntario exitosamente"
              ) {
                notify(
                  "Se ha creado el comercio domiciliado voluntario exitosamente"
                );
              }
            }
          })
          .catch((err) => {
            console.log(err);
            notifyError("Error al subir Formulario");
          });
      }
    } else {
      notifyError("No Tiene el Cupo Suficiente Para el Aporte a Colpensiones.");
    }
  };

  return (
    <div>
      <Modal show={showModal} handleClose={handleClose}>
        <LogoPDP small></LogoPDP>
        <Fieldset
          legend="Formulario Aporte Voluntario"
          /* className="lg:col-span-3" */
        >
          <Select
            onChange={(event) => setTipoIdentificacion(event?.target?.value)}
            id="comissionType"
            label="Tipo de Identificación"
            options={{
              "": "",
              "C.C Cedula de Ciudadania": "1",
              "C.E Cedula de Extranjeria": "2",
            }}
          ></Select>
          <Input
            label={"N° Documento"}
            placeholder={"Ingrese su Numero Documento"}
            value={numDocumento}
            onChange={(e) => setNumDocumento(e.target.value)}
            type={"number"}
            disabled
          ></Input>

          <Input
            label={"N° Celular"}
            placeholder={"Ingrese su Numero Celular"}
            value={numCelular}
            onChange={(e) => setNumCelular(e.target.value)}
            type={"number"}
          ></Input>
          <Input
            label={"Valor Aportar"}
            placeholder={"Ingrese Valor Aportar"}
            value={valorAportar}
            onChange={(e) => setValorAportar(e.target.value)}
            type={"number"}
          ></Input>
        </Fieldset>
        <ButtonBar className={"lg:col-span-2"} type="">
          {
            <Button type="submit" onClick={(e) => enviar(e)}>
              Guardar Datos
            </Button>
            /*  ) : null */
          }
        </ButtonBar>
      </Modal>
    </div>
  );
};

export default PpsVoluntarioDemanda;
