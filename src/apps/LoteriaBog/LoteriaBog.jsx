import { useAuth } from "../../utils/AuthHooks";
import ProvideLoteria from "./components/ProvideLoteria";
import AdminLoteria from "./Roles/AdminLoteria";
import CashierLoteria from "./Roles/CashierLoteria";


const LoteriaBog = () => {
  const { roleInfo } = useAuth();
  return (
    <ProvideLoteria>
      <div className="w-full flex flex-col justify-center items-center">
        {/* {roleInfo !== undefined && roleInfo !== null && (
          <>
          {roleInfo?.roles?.includes(1)? (
            <AdminLoteria/>          
          ):("")}
          {roleInfo?.roles?.includes(3)?(
            <CashierLoteria/>) : ("")}
        </>)} */}
        {roleInfo !== undefined && roleInfo !== null && (
          <>
            {roleInfo?.roles?.includes(1) ? (
              <AdminLoteria />
            ) : (
              <>
              <CashierLoteria />
              <AdminLoteria />
              </>
            )}
          </>
        )}
      </div>
    </ProvideLoteria>
  );
};

export default LoteriaBog;
