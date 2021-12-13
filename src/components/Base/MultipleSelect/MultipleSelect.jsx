import { useEffect, useState } from "react";
import classes from "./MultipleSelect.module.css";

const MultipleSelect = ({ label, options, onChange, ...select }) => {
  const { formItem, items, divChecked } = classes;

  const [values, setValues] = useState(options);

  useEffect(() => {
    setValues(options);
  }, [options])

  return (
    <div className={formItem}>
      {label && label !== "" && <label>{label}</label>}
      <div className={items}>
        {Object.entries(values).map(([label, checked]) => {
          return (
            <div
              key={label}
              className={`${checked ? divChecked : ""}`}
              onClick={() => {
                const copy_vals = { ...values };
                copy_vals[label] = !checked;
                setValues({ ...copy_vals });
                onChange?.({ ...copy_vals });
              }}
            >
              <label htmlFor={label}>{label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleSelect;
