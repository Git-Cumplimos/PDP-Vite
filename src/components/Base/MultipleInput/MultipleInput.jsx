import { Fragment } from "react";
import Button from "../Button";
import ButtonBar from "../ButtonBar";
import Input from "../Input";

const MultipleInput = ({
  arrState,
  label,
  min = 1,
  max,
  required = false,
  type = "text",
}) => {
  const [arrData, setArrData] = arrState;
  if (!Array.isArray(arrData)) {
    throw Error("Se debe enviar un estado de un useState");
  }

  return (
    <>
      {arrData.map((value, index) => {
        return (
          <Fragment key={index}>
            <Input
              id={`arrData_${index}`}
              label={`${label(index)}`}
              type={type}
              autoComplete="off"
              value={value}
              onInput={(e) => {
                const arrData_copy = [...arrData];
                arrData_copy[index] = e.target.value;
                setArrData([...arrData_copy]);
              }}
              required={required}
            />
            <ButtonBar key={`btnBar_key_${index}`}>
              <Button
                disabled={arrData.length < min + 1}
                type="button"
                onClick={() => {
                  const arrData_copy = [...arrData];
                  arrData_copy.splice(index, 1);
                  setArrData([...arrData_copy]);
                }}
              >
                Eliminar
              </Button>
            </ButtonBar>
          </Fragment>
        );
      })}
      <ButtonBar className="lg:col-span-2">
        <Button
          disabled={max !== undefined && arrData.length >= max}
          type="button"
          onClick={() => {
            const arrData_copy = [...arrData];
            arrData_copy.push("");
            setArrData([...arrData_copy]);
          }}
        >
          Añadir
        </Button>
      </ButtonBar>
    </>
  );
};

export default MultipleInput;
