import classes from "./Fieldset.module.css";

const Fieldset = ({ legend, children, className }) => {
  const { Fieldset } = classes;
  return (
    <fieldset className={`${Fieldset} ${className}`}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  )
}

export default Fieldset
