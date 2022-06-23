import classes from "./ProgressBar.module.css";

const ProgressBar = ({ self = false, ...progress }) => {
  const { progressBar, colorProgress } = classes;
  return self ? (
    <progress className={colorProgress} {...progress}></progress>
  ) : (
    <progress className={progressBar} {...progress}></progress>
  );
};

export default ProgressBar;
