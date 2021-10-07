import { LoteriaContext, useProvideLoteria } from "../utils/LoteriaHooks";

const ProvideLoteria = ({ children }) => {
  const LDB = useProvideLoteria();
  return (
    <LoteriaContext.Provider value={LDB}>{children}</LoteriaContext.Provider>
  );
};

export default ProvideLoteria;
