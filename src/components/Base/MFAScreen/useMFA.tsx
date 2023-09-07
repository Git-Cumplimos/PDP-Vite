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
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthHooks";
import useLocalStorage from "../../../hooks/useLocalStorage";
import useFetchDispatchDebounce from "../../../hooks/useFetchDispatchDebounce";

const urlComercios = process.env.REACT_APP_URL_SERVICE_COMMERCE;

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
  const { roleInfo } = useAuth();

  const pk_id_comercio = (roleInfo as any)?.id_comercio;

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
  const deactivateTotpWall = useCallback(() => setActiveModal(false), []);

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

  const [searchCommerceTotp] = useFetchDispatchDebounce({
    onSuccess: useCallback(
      (response) => setCommerceUseTotp(response?.obj?.use_totp ?? false),
      [setCommerceUseTotp]
    ),
    onError: useCallback((error) => console.error(error), []),
  });

  useEffect(() => {
    if (pk_id_comercio) {
      searchCommerceTotp(
        `${urlComercios}/comercios/consultar-unique?pk_comercio=${pk_id_comercio}`
      );
    } else {
      setCommerceUseTotp(false);
    }
  }, [searchCommerceTotp, pk_id_comercio, setCommerceUseTotp]);

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
