import { ImgsContext, useProvideImgs } from "../../../hooks/ImgsHooks";

const ProvideImgs = ({ children }) => {
  const auth = useProvideImgs();
  return <ImgsContext.Provider value={auth}>{children}</ImgsContext.Provider>;
};

export default ProvideImgs;