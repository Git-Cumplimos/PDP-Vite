import { useNavigate } from "react-router-dom";
import Button from "../Button";

const SubPage = ({ label, upperRoute, children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-evenly w-full gap-4">
      <div className="flex flex-col mr-4">
        <div className="hidden md:block">{label}</div>
        <div>
          <Button type={"button"} onClick={() => navigate(upperRoute || -1)}>
            Volver
          </Button>
        </div>
      </div>
      <div className="grid grid-flow-row place-items-center flex-1 gap-4">
        {children}
      </div>
    </div>
  );
};

export default SubPage;
