const classesModal = [
  "fixed",
  "inset-0",
  "w-full",
  "h-full",
  "justify-center",
  "content-center",
  "bg-gray-200",
  "bg-opacity-80",
  "overflow-auto",
];

const ScreenBlocker = ({ show, children }) => {
  return (
    show && (
      <div className={`${classesModal.join(" ")} flex`} style={{ zIndex: 7 }}>
        {children}
      </div>
    )
  );
};

export default ScreenBlocker;
