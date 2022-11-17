import classes from "./LoginLayout.module.css";
import LogoPDP from "../../components/Base/LogoPDP";
import RightArrow from "../../components/Base/RightArrow";
import { useImgs } from "../../hooks/ImgsHooks";
import { Suspense, useEffect } from "react";
import { useWindowSize } from "../../hooks/WindowSizeHooks";
import PublicNav from "../../components/Compound/PublicNav";
import { Outlet } from "react-router-dom";
import ContentBox from "../../components/Base/SkeletonLoading/ContentBox";

const LoginLayout = ({ children }) => {
  const { loginLayout, wave, headerPDP, usrData } = classes;

  const {
    imgs: { personas },
    svgs: { backIcon, backIconSecondary },
  } = useImgs();

  const [clientWidth] = useWindowSize();

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

  return (
    <div className={loginLayout}>
      <div className={`${wave} top-52`}>
        <PublicNav />
      </div>
      <header className={headerPDP}>
        <div className={usrData}>
          <LogoPDP large />
          <RightArrow large />
        </div>
        <h1 className="text-3xl mb-6">¡Bienvenido!</h1>
      </header>
      <main className="container">
        <Suspense fallback={<ContentBox />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default LoginLayout;
