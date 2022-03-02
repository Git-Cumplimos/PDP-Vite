import { useNavigate } from "react-router-dom";
import Button from "../Button";

const SubPage = ({ label, children }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row justify-evenly w-full">
      <div className="flex flex-col mr-4">
        <div className="hidden md:block">{label}</div>
        <div>
          <Button type={"button"} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center flex-1">
        {children}
      </div>
    </div>
  );
};

export default SubPage;
