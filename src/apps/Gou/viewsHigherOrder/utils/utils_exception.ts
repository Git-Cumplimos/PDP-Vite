import { ErrorCustomFetch } from "../../../../utils/fetchCustomPdp";
import { TypingOutputErrorPrePayBase } from "./utils_typing";

export class ErrorCustomPeticionPrePayBase extends ErrorCustomFetch {
  error_origin: ErrorCustomFetch;
  outputPrePayBase: TypingOutputErrorPrePayBase;

  constructor(
    error_msg: string,
    error_origin: ErrorCustomFetch,
    outputPrePayBase: TypingOutputErrorPrePayBase
  ) {
    super(
      error_origin.error_name,
      error_msg,
      error_origin.error_msg_console,
      error_origin.error_msg_sequence,
      undefined,
      true,
      false,
      error_origin.res
    );
    this.error_origin = error_origin;
    this.outputPrePayBase = outputPrePayBase;
  }
}
