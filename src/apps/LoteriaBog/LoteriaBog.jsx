import { useAuth } from "../../utils/AuthHooks";
import ProvideLoteria from "./components/ProvideLoteria";
import AdminLoteria from "./Roles/AdminLoteria";
import CashierLoteria from "./Roles/CashierLoteria";

const LoteriaBog = () => {
  const auth = useAuth();
  return (
    <ProvideLoteria>
      <div className="w-full flex flex-col justify-center items-center">
        {auth.roleInfo.role === 0 ? (
          <AdminLoteria />
        ) : (
          <CashierLoteria />
        )}
      </div>
    </ProvideLoteria>
  );
};

export default LoteriaBog;
