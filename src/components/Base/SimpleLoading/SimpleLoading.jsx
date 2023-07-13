import classes from "./SimpleLoading.module.css";

const SimpleLoading = ({ show = false }) => {
  const { modal, modalContent } = classes;

  if (show) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return show ? (
    <div className={modal}>
      <div className={modalContent}>
        <div className="animate-spin">
          <span className="bi bi-arrow-clockwise text-6xl" />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default SimpleLoading;
