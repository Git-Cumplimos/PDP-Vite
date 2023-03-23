import classes from "./LoadingIcon.module.css";

const LoadingIcon = () => {
  const { ldsring } = classes;

  return (
    <div className={ldsring}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingIcon;
