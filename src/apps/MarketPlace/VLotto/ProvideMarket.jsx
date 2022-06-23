import React from "react";
import {
  MarketContext,
  useProvideMarketPlace,
} from "../utils/MarketPlaceHooks";

const ProvideMarket = ({ children }) => {
  const LBD = useProvideMarketPlace();
  return (
    <MarketContext.Provider value={LBD}>{children}</MarketContext.Provider>
  );
};

export default ProvideMarket;
