import BarIcon from "../BarIcon/BarIcon";
import RightArrow from "../RightArrow/RightArrow";
import ContentBox from "./ContentBox/ContentBox";
import LogoSk from "./LogoSk/LogoSk";
import classes from "./SkeletonLoading.module.css";

const SkeletonLoading = () => {
  const {
    headerPDP,
    topHeader,
    usrData,
    userInfo,
    textCls,
    btnCls,
    navbar,
    textClsSm,
    list,
  } = classes;
  return (
    <div className={`animate-pulse`}>
      <header className={headerPDP}>
        <div className={topHeader}>
          <div className={usrData}>
            {/* Logo and user info */}
            <LogoSk />
            <BarIcon />
            <div className={userInfo}>
              <span className={textCls} />
              <span className={textCls} />
              <span className={textCls} />
            </div>
            <RightArrow small />
          </div>
          <div className={usrData}>
            {/* Quota buttons */}
            <button className={btnCls}></button>
            <button className={btnCls}></button>
            <button className={btnCls}></button>
          </div>
        </div>
        <nav className={navbar}>
          <ul className={list}>
            {/* Upper nav */}
            {Array(8)
              .fill(0)
              .map((_, ind) => {
                return (
                  <li key={ind}>
                    <span className={textClsSm} />
                  </li>
                );
              })}
          </ul>
        </nav>
      </header>
      <main className="flex justify-center items-center container mx-auto">
        <ContentBox />
      </main>
    </div>
  );
};

export default SkeletonLoading;
