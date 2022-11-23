import classes from "./Select.module.css";

const Select = ({ label, options, self = false, info = "", ...select }) => {
  const { formItem } = classes;
  const { id: _id } = select;

  if (Array.isArray(options)) {
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
        <div>
          <select id={_id} {...select}>
            {options.map(({ value, label }, idx) => {
              return (
                <option key={`${value}_${idx}`} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          {info ? <p>{info}</p> : ""}
        </div>
      </div>
    );
  }

  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <select id={_id} {...select}>
        {Object.entries(options).map(([label, value]) => {
          return (
            <option key={label} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </>
  ) : (
    <div className={formItem}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <div>
        <select id={_id} {...select}>
          {Object.entries(options).map(([label, value]) => {
            return (
              <option key={label} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        {info ? <p>{info}</p> : ""}
      </div>
    </div>
  );
};

export default Select;
