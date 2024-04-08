import { notify, notifyError } from "../notify";

export class ErrorCustomFetch extends Error {
  error_name: string;
  error_msg_front: string;
  error_msg_console: string;
  error_msg_sequence: string;
  typeNotify: string | undefined;
  ignoring: boolean;
  console_error: boolean;
  res: { [key: string]: any } | undefined;

  constructor(
    error_name: string,
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string | undefined,
    ignoring: boolean,
    console_error: boolean,
    res?: { [key: string]: any }
  ) {
    super(error_msg_front);
    this.error_name = error_name;
    this.error_msg_front = error_msg_front;
    this.error_msg_console = error_msg_console;
    this.error_msg_sequence = error_msg_sequence;
    this.typeNotify = typeNotify;
    this.ignoring = ignoring;
    this.console_error = console_error;
    this.res = res;
    if (this.ignoring === false && this.typeNotify !== undefined) {
      if (this.typeNotify === "notifyError") {
        notifyError(this.error_msg_front, 5000, { toastId: "notify-lot" });
      } else if (this.typeNotify === "notify") {
        notify(this.error_msg_front);
      }
    }
    if (console_error === true) {
      const name_console_error = this.error_msg_front.split(":");
      console.error(name_console_error[0], {
        "Error Name": error_name,
        "Error Conred": this.error_msg_front,
        "Error Sequence": this.error_msg_sequence,
        "Error Console": `${this.error_msg_console}`,
      });
    }
  }
}

export class ErrorCustomFetchCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomFetchCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomTimeout extends ErrorCustomFetch {
  constructor(
    error_name: string,
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      error_name,
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomFetchTimeout extends ErrorCustomTimeout {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomFetchTimeout",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomApiGateway extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomApiGateway",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomApiGatewayTimeout extends ErrorCustomTimeout {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomApiGatewayTimeout",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomBackend extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackend",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomBackendUser extends ErrorCustomFetch {
  constructor(
    error_msg_front: string = "desconocido",
    error_msg_console: string = "desconocido",
    error_msg_sequence: string = "desconocido",
    typeNotify: string | undefined = "notify",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackendUser",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomBackendPending extends ErrorCustomTimeout {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackendPending",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomBackendRehazada extends ErrorCustomTimeout {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true,
    res?: { [key: string]: any }
  ) {
    super(
      "ErrorCustomBackendRehazada",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error,
      res
    );
  }
}

export class ErrorCustomUseHookCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomUseHookCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}

export class ErrorCustomComponentCode extends ErrorCustomFetch {
  constructor(
    error_msg_front: string,
    error_msg_console: string,
    error_msg_sequence: string,
    typeNotify: string = "notifyError",
    ignoring: boolean = false,
    console_error: boolean = true
  ) {
    super(
      "ErrorCustomComponenteCode",
      error_msg_front,
      error_msg_console,
      error_msg_sequence,
      typeNotify,
      ignoring,
      console_error
    );
  }
}
