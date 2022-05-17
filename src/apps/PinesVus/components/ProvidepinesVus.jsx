import { pinesVusContext, useProvidePinesVus } from "../utils/pinesVusHooks";

const ProvideFundamujer = ({ children }) => {
  const LDB = useProvidePinesVus();
  console.log(LDB);
  return (
    <pinesVusContext.Provider value={LDB}>{children}</pinesVusContext.Provider>
  );
};

export default ProvideFundamujer;
