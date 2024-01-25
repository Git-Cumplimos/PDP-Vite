import classes from "./Fieldset.module.css";

const { Fieldset: FieldsetClass } = classes;

const Fieldset = ({ legend, children, className = "" }) => {
  return (
    <fieldset className={`${FieldsetClass} ${className ?? ""}`}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  )
}

export default Fieldset
