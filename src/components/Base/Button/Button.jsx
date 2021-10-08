import classes from "./Button.module.css";

const Button = ({ self = false, ...button }) => {
  const { formItem } = classes;

  return self ? (
    <button {...button} />
  ) : (
    <div className={formItem}>
      <button {...button} />
    </div>
  );
};

export default Button;
