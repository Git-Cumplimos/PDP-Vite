import { useHistory } from "react-router-dom";
import AppIcons from "../AppIcons/AppIcons";
import Button from "../Button/Button";

const SubPage = ({ label, children }) => {
  const history = useHistory();
  return (
    <div className="flex flex-col md:flex-row justify-evenly w-full">
      <div className="flex flex-col">
        <div className="hidden md:block">
          {label}
        </div>
        <div>
          <Button type={"button"} onClick={history.goBack}>
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
