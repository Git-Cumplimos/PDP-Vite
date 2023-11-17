import classes from "./ToggleInput.module.css";

const ToggleInput = ({
  label,
  title = "Activar / desactivar opcion",
  ...select
}) => {
  const { formItem, toggle, slider, round } = classes;
  const { id: _id } = select;

  return (
    <div className={formItem} title={title}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <label className={toggle}>
        <input id={_id} type="checkbox" {...select} />
        <span className={`${slider} ${round}`} />
      </label>
    </div>
  );
};

export default ToggleInput;
