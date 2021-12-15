import classes from "./LoginLayout.module.css";
import SocialBar from "../../components/Compound/SocialBar/SocialBar";
import LogoPDP from "../../components/Base/LogoPDP/LogoPDP";
import RightArrow from "../../components/Base/RightArrow/RightArrow";

const LoginLayout = ({ children }) => {
  const { loginLayout, wave, headerPDP, usrData } = classes;

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
        {children}
      </main>
    </div>
  );
};

export default LoginLayout;
