import { useState, useEffect, Fragment } from "react";
import { toast } from "react-toastify";

import * as serviceWorkerRegistration from "../../../serviceWorkerRegistration";

const ServiceWorkerWrapper = () => {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const onSWUpdate = (registration) => {
    setShowReload(true);
    setWaitingWorker(registration.waiting);
  };

  useEffect(() => {
    serviceWorkerRegistration.register({ onUpdate: onSWUpdate });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowReload(false);
    window.location.reload(true);
  };

  if (showReload) {
    toast.info(
      <div className="grid grid-flow-col items-center">
        <h1>Nueva version de la pagina disponible</h1>
        <div>
          <button
            className="px-2 py-1 bg-primary text-white rounded text-sm"
            color="inherit"
            size="small"
            onClick={reloadPage}
          >
            Recargar
          </button>
        </div>
      </div>,
      {
        toastId: "toast-id-service-worker-159",
        autoClose: false,
        closeOnClick: false,
      }
    );
  }

  return <Fragment></Fragment>;
};

export default ServiceWorkerWrapper;
