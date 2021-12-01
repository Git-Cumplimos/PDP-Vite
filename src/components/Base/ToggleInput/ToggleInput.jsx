import classes from "./ToggleInput.module.css";

const ToggleInput = ({
  label,
  self = false,
  value = false,
  setValue = () => {},
  ...select
}) => {
  const { formItem, toggle, slider, round } = classes;
  const { id: _id } = select;

  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <label className={toggle}>
        <input
          id={_id}
          type="checkbox"
          {...select}
        />
        <span className={`${slider} ${round}`} />
      </label>
    </>
  ) : (
    <div className={formItem}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <label className={toggle}>
        <input
          id={_id}
          type="checkbox"
          {...select}
        />
        <span className={`${slider} ${round}`} />
      </label>
    </div>
  );
};

export default ToggleInput;
