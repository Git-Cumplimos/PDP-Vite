import { useNavigate, useLocation } from "react-router-dom";
import Button from "../Button";
import { useMemo } from "react";

const SubPage = ({ label, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  const backPath = useMemo(() => {
    if (currentPath === "/") {
      return "/";
    }
    const copy = currentPath;
    const copyArr = copy.split("/");
    copyArr.pop();
    const copyJoin = copyArr.join("/");
    if (copyJoin === "") {
      return "/";
    }
    return copyJoin;
  }, [currentPath]);

  return (
    <div className="flex flex-col md:flex-row justify-evenly w-full gap-4">
      <div className="flex flex-col mr-4">
        <div className="hidden md:block">{label}</div>
        <div>
          <Button
            type={"button"}
            onClick={() => {
              if (currentPath !== backPath) {
                navigate(backPath);
              }
            }}
          >
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
