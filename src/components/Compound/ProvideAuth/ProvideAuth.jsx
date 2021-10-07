import { AuthContext, useProvideAuth } from "../../../utils/AuthHooks";

const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default ProvideAuth;