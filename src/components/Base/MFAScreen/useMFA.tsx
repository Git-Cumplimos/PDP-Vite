import {
  createContext,
  useCallback,
  useContext,
  useState,
  FormEventHandler,
  FormEvent,
  MouseEvent,
  useEffect,
  SetStateAction,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";
import useLocalStorage from "../../../hooks/useLocalStorage";

export const MFAContext = createContext({
  consumer: {
    activateTotpWall: () => {},
    submitEventSetter: (_: FormEventHandler<HTMLFormElement>) => {},
  },
  api: {
    activeModal: false,
    submitEvent: (_: FormEvent<HTMLFormElement>) => {},
    setCurrentTotp: (_: SetStateAction<string | null>) => {},
    deactivateTotpWall: () => {},
  },
});

export const useMFA = () => {
  return useContext(MFAContext).consumer;
};
export const useMFAApi = () => {
  return useContext(MFAContext).api;
};

export const useProvideMFA = () => {
  const { commerceInfo } = useAuth();

  const commUseTotp = useMemo(
    () => (commerceInfo as any)?.use_totp ?? false,
    [commerceInfo]
  );

  const { pathname } = useLocation();

  const [activeModal, setActiveModal] = useState(false);
  const [, setCurrentTotp] = useLocalStorage<string | null>(
    "current_totp",
    null
  );
  const [submitEvent, setSubmitEvent] = useState<
    FormEventHandler<HTMLFormElement>
  >(() => () => {});
  const [commerceUseTotp, setCommerceUseTotp] = useLocalStorage<boolean>(
    "commerce_use_totp",
    false
  );

  const activateTotpWall = useCallback(
    (ev?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
      if (ev && ev.type === "submit") {
        ev.preventDefault();
      }
      setActiveModal(true);
    },
    []
  );
  const deactivateTotpWall = useCallback(() => {
    setActiveModal(false);
    setCurrentTotp(null);
  }, [setCurrentTotp]);

  const submitEventSetter = useCallback(
    (onSubmit: FormEventHandler<HTMLFormElement>) => {
      if (!commerceUseTotp) {
        return onSubmit;
      }
      setSubmitEvent(() => onSubmit);
      return activateTotpWall;
    },
    [activateTotpWall, commerceUseTotp]
  );

  useEffect(() => {
    setSubmitEvent(() => () => {});
  }, [pathname]);

  useEffect(() => {
    setCommerceUseTotp(commUseTotp ?? false);
  }, [commUseTotp, setCommerceUseTotp]);

  return {
    consumer: {
      activateTotpWall,
      submitEventSetter,
    },
    api: {
      activeModal,
      submitEvent,
      setCurrentTotp,
      deactivateTotpWall,
    },
  };
};
