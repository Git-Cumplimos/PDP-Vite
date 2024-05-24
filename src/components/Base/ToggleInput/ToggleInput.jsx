import classes from "./ToggleInput.module.css";

const { formItem, toggle, slider, round } = classes;

const ToggleInput = ({
  label = "",
  title = "Activar / desactivar opcion",
  self = false,
  ...select
}) => {
  const { id: _id } = select;

  return !self ? (
    <div className={formItem} title={title}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <label className={toggle}>
        <input id={_id} type="checkbox" {...select} />
        <span className={`${slider} ${round}`} />
      </label>
    </div>
  ) : (
    <label className={toggle} title={title}>
      <input id={_id} type="checkbox" {...select} />
      <span className={`${slider} ${round}`} />
    </label>
  );
};

export default ToggleInput;
