import React, { useEffect, ReactNode, Fragment } from "react";
import classes from "./MFAScreen.module.css";

import { MFAContext, useProvideMFA, useMFAApi } from "./useMFA";
import { onChangeNumber } from "../../../utils/functions";

type Props = {};

const { card, field } = classes;

export const MFAScreen = (props: Props) => {
  const { deactivateTotpWall, activeModal, setCurrentTotp, submitEvent } =
    useMFAApi();

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeModal]);

  if (!activeModal) {
    return <Fragment />;
  }

  return (
    <div className="w-full h-full fixed bg-gray-200 bg-opacity-50 z-50">
      <div className="h-full grid col-span-1 place-items-center">
        <div className={`${card} bg-white bg-opacity-100`}>
          <h1 className="uppercase text-2xl font-medium text-center">
            Validación usuario
          </h1>
          <hr />
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              submitEvent(ev);
              deactivateTotpWall();
            }}
          >
            <div className={field}>
              <label htmlFor="totp">Código de seguridad:</label>
              <input
                id="totp"
                type="tel"
                name="totp"
                maxLength={6}
                autoFocus
                autoComplete="off"
                // value={totp}
                onChange={(ev) => setCurrentTotp(onChangeNumber(ev))}
              />
            </div>
            <div className={field}>
              <button type="submit">Validar codigo</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const MFAScreenProvider = ({ children }: { children: ReactNode }) => {
  const mfaValues = useProvideMFA();
  return (
    <MFAContext.Provider value={mfaValues}>
      <MFAScreen />
      {children}
    </MFAContext.Provider>
  );
};
