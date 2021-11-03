import { LoteriaContext, useProvideLoteria } from "../../FundacionMujer/componentsmujer/utils/mujerHooks";

const ProvideFundamujer = ({ children }) => {
  const LDB = useProvideLoteria();
  return (
    <LoteriaContext.Provider value={LDB}>{children}</LoteriaContext.Provider>
  );
};

export default ProvideFundamujer;
