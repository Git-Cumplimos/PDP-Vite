import classes from "./ProgressBar.module.css";

const ProgressBar = ({ ...progress }) => {
  const { progressBar } = classes;
  return <progress className={progressBar} {...progress}></progress>;
};

export default ProgressBar;
