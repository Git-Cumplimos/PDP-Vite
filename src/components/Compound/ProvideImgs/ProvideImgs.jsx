import { ImgsContext, useProvideImgs } from "../../../utils/ImgsHooks";

const ProvideImgs = ({ children }) => {
  const auth = useProvideImgs();
  return <ImgsContext.Provider value={auth}>{children}</ImgsContext.Provider>;
};

export default ProvideImgs;