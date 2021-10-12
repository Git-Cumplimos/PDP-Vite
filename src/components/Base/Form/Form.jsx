import classes from "./Form.module.css";

const Form = ({ children, formDir = "row", ...formProps }) => {
  const { Form } = classes;
  return (
    <form className={`${Form} flex-${formDir}`} {...formProps}>
      {children}
    </form>
  );
};

export default Form;