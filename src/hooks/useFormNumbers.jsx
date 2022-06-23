import { useState } from "react";

const useFormNumbers = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  return [
    values,
    (e) => {
      if (!isNaN(e?.target?.value)) {
        setValues({
          ...values,
          [e?.target?.name]: e?.target?.value,
        });
      }
    },
  ];
};

export default useFormNumbers;
