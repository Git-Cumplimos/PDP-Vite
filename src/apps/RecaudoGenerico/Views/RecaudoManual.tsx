import { Fragment, useCallback, useEffect, useState } from "react";

import TableEnterprise from "../../../components/Base/TableEnterprise/TableEnterprise";
import Input from "../../../components/Base/Input";
import ButtonBar from "../../../components/Base/ButtonBar";

const RecaudoManual = () => {
  return (
    <div className="py-10 flex items-center flex-col">
      <TableEnterprise
        title="Recaudo Servicios Públicos y Privados Manual"
        headers={["Código de convenio", "Nombre de convenio", "EAN"]}
        data={[]}
        maxPage={1}
        onSetPageData={() => {}}
        onSelectRow={() => {}}
        onChange={() => {}}
      >
        <></>
      </TableEnterprise>
      <Input
        id={"id_convenio"}
        label={"Código convenio - Nura"}
        type="tel"
        autoComplete="off"
        maxLength={20}
        onChange={undefined}
        required
      />
      <Input
        id={"nombre_convenio"}
        label={"Nombre convenio"}
        type="text"
        autoComplete="off"
        maxLength={30}
        required
      />
      <Input
        id={"ean"}
        label={"EAN"}
        type="text"
        autoComplete="off"
        maxLength={13}
        required
      />
    </div>
  );
};

export default RecaudoManual;
