import classes from "./Input.module.css";

const Input = ({ label, self = false, ...input }) => {
  const { formItem } = classes;
  const { id: _id } = input;

  return self ? (
    <>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} />
    </>
  ) : (
    <div className={formItem}>
      {label && label !== "" && <label htmlFor={_id}>{label}</label>}
      <input {...input} />
    </div>
  );
};

export default Input;
