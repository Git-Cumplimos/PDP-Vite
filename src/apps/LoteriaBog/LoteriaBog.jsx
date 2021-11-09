import { useAuth } from "../../utils/AuthHooks";
import ProvideLoteria from "./components/ProvideLoteria";
import AdminLoteria from "./Roles/AdminLoteria";
import CashierLoteria from "./Roles/CashierLoteria";


const LoteriaBog = () => {
  const { roleInfo } = useAuth();
  return (
    <ProvideLoteria>
      <div className="w-full flex flex-col justify-center items-center">
        {roleInfo !== undefined && roleInfo !== null ? (
          roleInfo.role[0] === 1 ? (
            <AdminLoteria />
          ) : (
            <CashierLoteria />
          )
        ) : (
          ""
        )}
      </div>
    </ProvideLoteria>
  );
};

export default LoteriaBog;
