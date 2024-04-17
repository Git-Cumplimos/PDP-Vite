import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { TypingDataInputAuto } from "./utils_typing";

const GouCheckUrlProcess = () => {
  const { state } = useLocation();
  const [dataInputAuto, setDataInputAuto] = useState<TypingDataInputAuto>({
    id_uuid_trx: "",
  });
  return <div>GouCheckUrlProcess</div>;
};

export default GouCheckUrlProcess;
