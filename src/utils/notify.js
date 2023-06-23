import { toast } from "react-toastify";

const notify = (msg = "Info", otherOptions = {}) => {
  toast.info(msg, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...otherOptions,
  });
};

const notifyError = (msg = "Error", autoClose = 5000, otherOptions = {}) => {
  toast.warning(msg, {
    position: "top-center",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...otherOptions,
    autoClose: autoClose,
  });
};

const notifyPending = (
  promise,
  onPending = { render: () => "Pending ..." },
  onSuccess = { render: ({ data }) => `Success ${JSON.stringify(data)}` },
  onError = { render: ({ data }) => `Error ${data.message}` },
  options
) => {
  toast.promise(
    promise,
    {
      pending: {
        type: "info",
        ...onPending,
      },
      error: {
        type: "warning",
        closeOnClick: false,
        ...onError,
      },
      success: {
        type: "info",
        ...onSuccess,
      },
    },
    options
  );
};

export { notify, notifyError, notifyPending };
