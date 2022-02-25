import React from "react";
import { useMarketPlace } from "./utils/MarketPlaceHooks";

const Products = () => {
  const {
    infoMarket: { consulta },
  } = useMarketPlace();
  return (
    <>
      {consulta?.obj?.productos.map((row) => {
        return (
          <>
            <ul>
              <li>{row?.name}</li>
              <li>Cantidad: {row?.qty}</li>
            </ul>
          </>
        );
      })}
    </>
  );
};

export default Products;
