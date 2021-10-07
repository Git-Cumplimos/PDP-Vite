import { useAuth } from "../../../utils/AuthHooks";
import classes from "./UserInfo.module.css";

const UserInfo = () => {
  const auth = useAuth();

  const { userInfo, name, conv, userid } = classes;

  const ShowUsr = () => {
    if (auth.userInfo) {
      return <p className={name}>{auth.userInfo.attributes.name}</p>;
    } else {
      return <p className={name}></p>;
    }
  };

  return (
    <div className={userInfo}>
      <ShowUsr />
      <p className={conv}>Punto de Pago "pdpago"</p>
      <p className={userid}>ID: 124214</p>
    </div>
  );
};

export default UserInfo;
