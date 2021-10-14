import classes from "./Form.module.css";

const Form = ({ children, grid = false, formDir = "row", ...formProps }) => {
  const { Flex, Grid } = classes;
  return (
    <form
      className={`${grid ? Grid : `${Flex} flex-${formDir}`}`}
      {...formProps}
    >
      {children}
    </form>
  );
};

export default Form;
