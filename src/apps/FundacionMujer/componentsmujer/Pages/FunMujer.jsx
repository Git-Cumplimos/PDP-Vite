import FundacionWomen from "../RolesFundamujer/FundacionWomen";
import { useAuth } from "../../../../hooks/AuthHooks";
import Providefundamujer from "../Providefundamujer";

const FunMujer = () => {
  const { roleInfo } = useAuth();
  return (
    <Providefundamujer>
    <div className="w-full flex flex-col justify-center items-center">
      {roleInfo !== undefined && roleInfo !== null ? (
        roleInfo.role === 0 ? (
          ""
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
