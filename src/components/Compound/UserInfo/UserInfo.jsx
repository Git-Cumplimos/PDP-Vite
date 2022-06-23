import { useAuth } from "../../../hooks/AuthHooks";
import classes from "./UserInfo.module.css";

const UserInfo = () => {
  const { userInfo: _userInfo, roleInfo } = useAuth();

  const { userInfo, name, conv, userid } = classes;

  return (
    <div className={userInfo}>
      <p className={name}>{_userInfo?.attributes?.name ?? ""}</p>
      <p className={conv}>{roleInfo?.["nombre comercio"] ?? ""}</p>
      <p className={userid}>
        {roleInfo?.["id_comercio"] ? "ID: " : ""}
        {roleInfo?.["id_comercio"]}
      </p>
    </div>
  );
};

export default UserInfo;
