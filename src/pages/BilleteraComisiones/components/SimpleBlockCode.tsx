import React from "react";
import { notify } from "../../../utils/notify";

type Props = {
  json: any;
};

const classesCopyBtn =
  "absolute right-4 top-4 bi bi-clipboard p-1 border border-white " +
  "rounded-md w-9 h-9 text-center hover:border-coolGray-700 hover:bg-white " +
  "hover:text-coolGray-700 font-semibold cursor-pointer text-xl";

const SimpleBlockCode = ({ json }: Props) => {
  return (
    <pre className="whitespace-pre-wrap">
      <code className="block p-4 rounded-md border bg-coolGray-700 text-white relative">
        {JSON.stringify(json, null, 2)}
        <span
          className={`${classesCopyBtn}`}
          onClick={() => {
            if (navigator) {
              navigator.clipboard.writeText(JSON.stringify(json, null, 2));
              notify("Response copiado al portapapeles satisfactoriamente", {
                toastId: "copy-response",
              });
            }
          }}
        />
      </code>
    </pre>
  );
};

export default SimpleBlockCode;
