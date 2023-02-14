import { useRef } from "react";
import TextArea from "../TextArea";

const BarcodeReader = ({
  onSearchCodigo = (codigo) => {},
  onSetCodigo = (codigoActual) => {},
}) => {
  const isAlt = useRef("");
  const isAltCR = useRef({ data: "", state: false });

  return (
    <TextArea
      id="codigo_barras"
      name="codigo_barras"
      label="Escanee el código de barras"
      className={"place-self-stretch w-full"}
      autoComplete="off"
      autoFocus
      onChange={(ev) => onSetCodigo(ev.target.value)}
      onKeyDown={(ev) => {
        if (ev.keyCode === 13 && ev.shiftKey === false) {
          onSearchCodigo(ev.target.value);
          return;
        }
        if ((ev.keyCode === 8 || ev.keyCode === 46) && ev.shiftKey === false) {
          ev.preventDefault();
          return;
        }
        if (ev.altKey) {
          if (isAltCR.current.state) {
            isAltCR.current = {
              ...isAltCR.current,
              data: isAltCR.current.data + ev.key,
            };
          }
          if (ev.keyCode !== 18) {
            isAlt.current += ev.key;
          } else {
            isAltCR.current = { ...isAltCR.current, state: true };
          }
        }
      }}
      onKeyUp={(ev) => {
        if (ev.altKey === false && isAlt.current !== "") {
          let value = String.fromCharCode(parseInt(isAlt.current));
          isAlt.current = "";
          if (value === "\u001d") {
            ev.target.value = ev.target.value + "\u001d";
            //ev.target.value = ev.target.value.slice(0, -1) + "\u001d";
          }
        }
        if (ev.keyCode === 18) {
          if (isAltCR.current.data === "013") {
            onSearchCodigo(ev.target.value);
          }
          isAltCR.current = {
            ...isAltCR.current,
            state: false,
            data: "",
          };
        }
      }}
      required
    />
  );
};

export default BarcodeReader;
