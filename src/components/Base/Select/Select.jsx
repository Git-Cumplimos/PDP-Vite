import classes from "./Select.module.css";

const Select = ({ label, options, self = false, ...select}) => {
  const { formItem } = classes;
  const { id: _id } = select;
  
  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <select id={_id} {...select}>
        {options.map(({ value, label }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </>
  ) : (
    <div className={formItem}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <select id={_id} {...select}>
        {options.map(({ value, label }, idx) => {
          return (
            <option key={`${value}_${idx}`} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
