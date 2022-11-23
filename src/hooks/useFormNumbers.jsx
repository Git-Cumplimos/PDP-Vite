import { useState } from "react";

const useFormNumbers = (initialValues) => {
  const [values, setValues] = useState(initialValues);

  return [
    values,
    (e) => {
      if (e.target.value <= 9999) {
        if (!isNaN(e?.target?.value)) {
          setValues({
            ...values,
            [e?.target?.name]: e?.target?.value,
          });
        }
      }
    },
  ];
};

export default useFormNumbers;
