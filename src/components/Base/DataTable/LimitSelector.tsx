import React from "react";
import classes from "./DataTable.module.css";

const { limitsBtn } = classes;

type Props = {
  onChangeLimit: (limit: number) => void;
  defaultValue?: number
};

const LimitSelector = ({ onChangeLimit, defaultValue = 10 }: Props) => {
  return (
    <select
      name="limits"
      className={`${limitsBtn} appearance-none`}
      onChange={(ev) => onChangeLimit(parseInt(ev.target.value))}
      defaultValue={defaultValue}
    >
      {[5, 10, 20, 50].map((val, idx) => (
        <option value={val} key={idx}>
          {val} items por página
        </option>
      ))}
    </select>
  );
};

export default LimitSelector;
