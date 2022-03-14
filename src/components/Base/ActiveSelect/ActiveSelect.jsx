import classes from "./ActiveSelect.module.css";

const ActiveSelect = ({ label, value, onChange, disabled = false }) => {
  const { formItem, items, divChecked } = classes;

  return (
    <div className={formItem}>
      {label && label !== "" && <label>{label}</label>}
      <div className={items}>
        <div
          key={label}
          className={`${value ? divChecked : ""}`}
          onClick={() => {
            if (!disabled) {
              onChange?.(!value);
            }
          }}>
          <label htmlFor={value ? "Activo" : "Inactivo"}>
            {value ? "Activo" : "Inactivo"}
          </label>
        </div>
      </div>
    </div>
  );
};

export default ActiveSelect;
