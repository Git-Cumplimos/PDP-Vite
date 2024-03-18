import {
  createContext,
  useCallback,
  useContext,
  useState,
  FormEvent,
  MouseEvent,
  useEffect,
  SetStateAction,
  useMemo,
  Dispatch,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";
import useLocalStorage from "../../../hooks/useLocalStorage";

type EventHandler = (
  _?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
) => void;

type MFATontextType = {
  consumer: {
    activateTotpWall: EventHandler;
    submitEventSetter: (_: EventHandler) => EventHandler;
  };
  api: {
    activeModal: boolean;
    submitEvent: EventHandler;
    setCurrentTotp: Dispatch<SetStateAction<string | null>>;
    deactivateTotpWall: () => void;
  };
};

export const MFAContext = createContext<MFATontextType>({
  consumer: {
    activateTotpWall: () => {},
    submitEventSetter: (_) => _,
  },
  api: {
    activeModal: false,
    submitEvent: (_) => {},
    setCurrentTotp: (_) => {},
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
  const [submitEvent, setSubmitEvent] = useState<EventHandler>(() => () => {});
  const [commerceUseTotp, setCommerceUseTotp] = useLocalStorage<boolean>(
    "commerce_use_totp",
    false
  );

  const activateTotpWall = useCallback<EventHandler>((ev) => {
    if (ev && ev.type === "submit") {
      ev.preventDefault();
    }
    setActiveModal(true);
  }, []);
  const deactivateTotpWall = useCallback(() => {
    setActiveModal(false);
    setCurrentTotp(null);
  }, [setCurrentTotp]);

  const submitEventSetter = useCallback(
    (onSubmit: EventHandler) => {
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
