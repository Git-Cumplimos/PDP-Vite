import { useAuth } from "../../utils/AuthHooks";
import ProvideLoteria from "./components/ProvideLoteria";
import CashierLoteria from "./Roles/CashierLoteria";

const AdminLoteria = () => {
  return <div>Estamos en loteria Admin</div>;
};

const LoteriaBog = () => {
  const auth = useAuth();
  return (
    <ProvideLoteria>
      {auth.roleInfo.role === 0 ? <AdminLoteria /> : <CashierLoteria />}
    </ProvideLoteria>
  );
};

export default LoteriaBog;
