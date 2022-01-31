import Button from "../../../components/Base/Button/Button";
import Form from "../../../components/Base/Form/Form";
import "../../SolicitudEnrolamiento/views/FormularioEnrolamiento.css";
import Input from "../../../components/Base/Input/Input";
import ButtonBar from "../../../components/Base/ButtonBar/ButtonBar";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonLink from "../../../components/Base/ButtonLink/ButtonLink";
const FormularioEnrolamiento = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [estadoFormulario, setEstadoForm] = useState(false);
  let navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const datos = {
      f_name: nombre,
      lastname: apellido,
      email: correo,
      telefono: telefono,
      task_token: "token",
      validation_state: "Iniciado",
      completado: false,
    };
    fetch(
      `http://conexionstatemachine-dev.us-east-2.elasticbeanstalk.com/crear-proceso`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    )
      .then((res) => res.json())
      .then((respuesta) => console.log(respuesta));
    /*    setNombre("");
    setApellido("");
    setTelefono("");
    setCorreo(""); */
  };
  const handleReconoser = async (event) => {
    /*   event.preventDefault(); */
    /* await submitForm(event.target); */
    navigate("/Solicitud-enrolamiento/reconoserid", {
      replace: true,
    });
  };
  return (
    <div class="w-full flex flex-col justify-center items-center my-8">
      <span className="titulo-formulario-inscripcion">
        Formulario de Inscripción
      </span>
      <Form grid={true} onSubmit={(e) => handleSubmit(e) || handleReconoser(e)}>
        <Input
          label={"Nombre:"}
          placeholder="Ingrese su Nombre"
          onChange={(e) => setNombre(e.target.value)}
        ></Input>

        <Input
          label={"Apellido:"}
          placeholder="Ingrese su Apellido"
          onChange={(e) => setApellido(e.target.value)}
        ></Input>

        <Input
          label={"Telefono:"}
          placeholder="Ingrese su Telefono"
          onChange={(e) => setTelefono(e.target.value)}
        ></Input>

        <Input
          label={"Correo:"}
          placeholder="Ingrese su Correo"
          onChange={(e) => setCorreo(e.target.value)}
        ></Input>

        <ButtonBar className={"lg:col-span-2"} type="">
          {estadoFormulario ? null : (
            <Button type="submit" onClick={() => setEstadoForm((old) => !old)}>
              Enviar Formulario
            </Button>
          )}
        </ButtonBar>
        <ButtonBar className={"lg:col-span-2"} type="">
          {estadoFormulario ? (
            <Button type="submit" onClick={() => handleReconoser()}>
              Comenzar ReconoserID
            </Button>
          ) : null}
        </ButtonBar>
      </Form>
    </div>
  );
};

export default FormularioEnrolamiento;
