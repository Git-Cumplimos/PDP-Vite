import React, { Fragment } from "react";
import Input from "../../../../components/Base/Input";
import Select from "../../../../components/Base/Select";
import { PropsGouFormularioAdd } from "../../../Gou/viewsHigherOrder/utils/utils.typing";

//FRAGMENT ******************** CONST ***********************************
const tipoDocumentoOptions: { [key: string]: string } = {
  "Cedula de Ciudadanía": "Cédula de Ciudadanía",
  "Cédula de Extranjería": "Cédula de Extranjería",
  NIT: "NIT",
  Pasaporte: "Pasaporte",
  "Permiso Especial de Permanecía": "Permiso Especial de Permanecía",
};
const options_select: Array<{ value: string; label: string }> = Object.keys(
  tipoDocumentoOptions
).map((key_: string) => ({
  value: key_,
  label: tipoDocumentoOptions[key_],
}));

//FRAGMENT ******************** COMPONENT *******************************
const RecargaCupoConGou = ({ others }: PropsGouFormularioAdd) => {
  return (
    <Fragment>
      <div className="col-span-2">
        <Input
          id="nombre_completo/text"
          name="nombre_completo"
          label="Nombre Completo"
          type="text"
          autoComplete="off"
          maxLength={70}
          value={others.dataInputAddOwn.nombre_completo}
          required
        />
      </div>
      <div className="col-span-2">
        <Input
          id="correo/email/correo|confirmacion=>correo"
          name="correo"
          label="Correo electrónico"
          type="email"
          autoComplete="off"
          maxLength={100}
          value={others.dataInputAddOwn.correo}
          required
        />
      </div>
      <div className="col-span-2">
        <Input
          id="correo|confirmacion/email/correo|confirmacion=>correo"
          name="correo|confirmacion"
          label="Confirmación de correo electrónico"
          type="email"
          autoComplete="off"
          maxLength={100}
          value={others.dataInputAddOwn["correo|confirmacion"]}
          invalid={others.dataInvalid["correo|confirmacion"]}
          required
          onPaste={(ev) => ev.preventDefault()}
          onDrop={(ev) => ev.preventDefault()}
        />
      </div>
      <Input
        id="celular/cel/celular|confirmacion=>celular"
        name="celular"
        label="Número de celular"
        type="text"
        autoComplete="off"
        minLength={10}
        maxLength={10}
        value={others.dataInputAddOwn.celular}
        invalid={others.dataInvalid.celular}
        required
      />
      <Input
        id="celular|confirmacion/cel/celular|confirmacion=>celular"
        name="celular|confirmacion"
        label="Confirmar número de celular"
        type="text"
        autoComplete="off"
        minLength={10}
        maxLength={10}
        value={others.dataInputAddOwn["celular|confirmacion"]}
        invalid={others.dataInvalid["celular|confirmacion"]}
        required
        onPaste={(ev) => ev.preventDefault()}
        onDrop={(ev) => ev.preventDefault()}
      />
      <Select label="Tipo de documento" options={options_select} />
      <Input
        id="documento/number"
        name="documento"
        label="Número de documento"
        type="text"
        autoComplete="off"
        minLength={5}
        maxLength={10}
        value={others.dataInputAddOwn.documento}
        required
      />
    </Fragment>
  );
};

export default RecargaCupoConGou;
