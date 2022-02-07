import classes from "./LoginLayout.module.css";
import SocialBar from "../../components/Compound/SocialBar/SocialBar";
import LogoPDP from "../../components/Base/LogoPDP/LogoPDP";
import RightArrow from "../../components/Base/RightArrow/RightArrow";
import { useImgs } from "../../hooks/ImgsHooks";
import { useEffect } from "react";
import { useWindowSize } from "../../hooks/WindowSizeHooks";
import { useNavigate } from "react-router-dom";
import ButtonBar from "../../components/Base/ButtonBar/ButtonBar";
import { lazy } from "react";

const Botton = lazy(() => import("../../components/Base/Button/Button"));

const LoginLayout = ({ children }) => {
  const { loginLayout, wave, headerPDP, usrData } = classes;

  const {
    imgs: { personas },
    svgs: { backIcon, backIconSecondary },
  } = useImgs();

  const [clientWidth] = useWindowSize();
  let navigate = useNavigate();

  useEffect(() => {
    if (clientWidth > 768) {
      document.body.style.backgroundImage = `url("${personas}"), url("${backIcon}"), url("${backIconSecondary}")`;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "2.5% 100%, center, center";
      document.body.style.backgroundSize = "500px, cover, cover";
    } else {
      document.body.style.backgroundImage = "none";
    }
  }, [backIcon, personas, backIconSecondary, clientWidth]);

  const incribirComercio = async (event) => {
    event.preventDefault();
    navigate("/Solicitud-enrolamiento");
  };

  return (
    <div className={loginLayout}>
      <div className={wave}>
        <SocialBar />
      </div>
      <header className={headerPDP}>
        <div className={usrData}>
          <LogoPDP large />
          <RightArrow large />
        </div>
        <h1 className="text-3xl mb-6">¡Bienvenido!</h1>
      </header>
      <main className="container">
        {children}{" "}
        <ButtonBar type="">
          <Botton type={"submit"} onClick={(e) => incribirComercio(e)}>
            Inscribirse
          </Botton>
        </ButtonBar>
      </main>
    </div>
  );
};

export default LoginLayout;
