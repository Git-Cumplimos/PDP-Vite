import FundacionWomen from "../RolesFundamujer/FundacionWomen";
import { useAuth } from "../../../../utils/AuthHooks";
import AdminLoteria from "../../../LoteriaBog/Roles/AdminLoteria";
import Providefundamujer from "../Providefundamujer";

const FunMujer = () => {
  const { roleInfo } = useAuth();
  return (
    <Providefundamujer>
    <div className="w-full flex flex-col justify-center items-center">
      {roleInfo !== undefined && roleInfo !== null ? (
        roleInfo.role === 0 ? (
          <AdminLoteria />
        ) : (
          <FundacionWomen/>
        )
      ) : (
        ""
      )}
    </div>
  </Providefundamujer>
  );
};

export default FunMujer;
