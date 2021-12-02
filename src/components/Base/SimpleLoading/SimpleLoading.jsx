import classes from "./SimpleLoading.module.css";

const SimpleLoading = ({ show = false }) => {
  const { modal, modalContent } = classes;
  return show ? (
    <div className={modal}>
      <div className={modalContent}>
        <div className="animate-spin">
          <span className="bi bi-arrow-clockwise text-6xl" />
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default SimpleLoading;
