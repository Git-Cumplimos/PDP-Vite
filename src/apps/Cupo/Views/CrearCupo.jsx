import React, { Fragment, useCallback, useState } from "react";
import Button from "../../../components/Base/Button";
import ButtonBar from "../../../components/Base/ButtonBar";
import Form from "../../../components/Base/Form";
import Input from "../../../components/Base/Input";
import MoneyInput from "../../../components/Base/MoneyInput";
import Select from "../../../components/Base/Select";
import { notify, notifyError } from "../../../utils/notify";
import { postDtlCambioLimiteCanje } from "../utils/fetchCupo";

const CrearCupo = () => {
  return (
    <div>
      <Fragment>
        <h1 className="text-3xl mt-6">Crear cupo Comercios</h1>
      </Fragment>
    </div>
  );
};

export default CrearCupo;
