import { FDLMContext, useProvideFDLM } from "../utils/mujerHooks";

const ProvideFundamujer = ({ children }) => {
  const LDB = useProvideFDLM();
  console.log(LDB);
  return <FDLMContext.Provider value={LDB}>{children}</FDLMContext.Provider>;
};

export default ProvideFundamujer;
