import classes from "./Form.module.css";

const Form = ({ children, ...formProps }) => {
  const { Form } = classes;
  return (
    <form className={Form} {...formProps}>
      {children}
    </form>
  );
};

export default Form;