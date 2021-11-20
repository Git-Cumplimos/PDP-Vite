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
          {roleInfo?.role.includes(1)? (
            <AdminLoteria/>          
          ):("")}
          {roleInfo?.role.includes(2)?(
            <CashierLoteria/>) : ("")}
        </>)} */}
          <AdminLoteria/>
         <CashierLoteria/>
      </div>
    </ProvideLoteria>
  );
};

export default LoteriaBog;
