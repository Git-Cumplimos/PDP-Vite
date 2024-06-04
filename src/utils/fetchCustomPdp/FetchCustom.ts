import { FuctionEvaluateResponseConsultTrx } from ".";
import fetchData from "../fetchData";
import { defaultParamsError } from "./ConstCustom";

import {
  ErrorCustomApiGateway,
  ErrorCustomApiGatewayTimeout,
  ErrorCustomBackendPending,
  ErrorCustomFetch,
  ErrorCustomFetchCode,
  ErrorCustomFetchTimeout,
} from "./ExceptionCustom";
import { FuctionEvaluateResponse } from "./FuctionEvaluateCustom";
import { TempErrorFrontService } from "./TempCustom";
import { ParamsError } from "./TypingCustom";
import { sleep } from "./UtilsCustom";

export const fetchCustomPdp = async (
  url_: string,
  metodo_: "POST" | "PUT" | "GET",
  name_: string,
  params_: { [key: string]: any } = {},
  body_: { [key: string]: any } = {},
  timeout_: number = 60,
  error_: ParamsError = defaultParamsError,
  functionEvaluateResponse_: Function = FuctionEvaluateResponse
) => {
  const function_name = fetchCustomPdp.name;
  let urlCompleto = url_;

  //armar error_
  try {
    const defaultParamsError_: any = { ...defaultParamsError };
    let assemble_error: any = { ...error_ };
    for (let key in defaultParamsError_) {
      if (assemble_error?.[key] === undefined)
        assemble_error[key] = defaultParamsError_[key];
    }
    error_ = { ...assemble_error };
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - armar error_`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //armar parametros
  try {
    if (metodo_ === "GET" || metodo_ === "PUT") {
      if (Object.keys(params_).length > 0) {
        let paramsVector = Object.keys(params_);

        paramsVector = paramsVector.map((valueKey) => {
          return `${valueKey}=${params_[valueKey]}`;
        });
        urlCompleto += `?${paramsVector.join("&")}`;
      }
    }
  } catch (error: any) {
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - armar parametros`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //Realizar Petición
  let Peticion;
  try {
    const timeout = timeout_ * 1000;
    if (metodo_ === "GET") {
      Peticion = await fetchData(urlCompleto, "GET", {}, {}, {}, true, timeout);
    } else if (metodo_ === "PUT") {
      Peticion = await fetchData(
        urlCompleto,
        "PUT",
        {},
        body_,
        {},
        true,
        timeout
      );
    } else if (metodo_ === "POST") {
      Peticion = await fetchData(
        urlCompleto,
        "POST",
        {},
        body_,
        {},
        true,
        timeout
      );
    }
  } catch (error: any) {
    if (error.message === "The user aborted a request.") {
      throw new ErrorCustomFetchTimeout(
        TempErrorFrontService.replace("%s", name_),
        error.message,
        `${function_name} - Realizar Petición`,
        error_.errorCustomFetchTimeout?.typeNotify,
        error_.errorCustomFetchTimeout?.ignoring,
        error_.errorCustomFetchTimeout?.console_error
      );
    }
    throw new ErrorCustomFetch(
      "ErrorCustomFetch",
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - Realizar Petición`,
      error_.errorCustomFetch?.typeNotify,
      error_.errorCustomFetch?.ignoring ?? true,
      error_.errorCustomFetch?.console_error ?? true
    );
  }
  //Evaluar si la respuesta es json
  try {
    if (typeof Peticion !== "object") {
      throw new ErrorCustomFetchCode(
        TempErrorFrontService.replace("%s", name_),
        "404 not found",
        `${function_name} - Evaluar si la respuesta es json`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
  } catch (error) {
    throw error;
  }

  //evaluar respuesta de api gateway
  try {
    if (Peticion?.hasOwnProperty("status") === false) {
      //No es una respuesta directamente del servicio sino del api gateway
      if (Peticion?.hasOwnProperty("message") === true) {
        if (Peticion.message === "Endpoint request timed out") {
          throw new ErrorCustomApiGatewayTimeout(
            TempErrorFrontService.replace("%s", name_),
            Peticion.message,
            `${function_name} - evaluar respuesta de api gateway`,
            error_.errorCustomApiGatewayTimeout?.typeNotify,
            error_.errorCustomApiGatewayTimeout?.ignoring,
            error_.errorCustomApiGatewayTimeout?.console_error
          );
        } else {
          throw new ErrorCustomApiGateway(
            TempErrorFrontService.replace("%s", name_),
            Peticion.message,
            `${function_name} - evaluar respuesta de api gateway`,
            error_.errorCustomApiGateway?.typeNotify,
            error_.errorCustomApiGateway?.ignoring,
            error_.errorCustomApiGateway?.console_error
          );
        }
      }
    }
  } catch (error: any) {
    if (
      error instanceof ErrorCustomApiGateway ||
      error instanceof ErrorCustomApiGatewayTimeout
    ) {
      throw error;
    }
    throw new ErrorCustomFetchCode(
      TempErrorFrontService.replace("%s", name_),
      error.message,
      `${function_name} - evaluar respuesta de api gateway`,
      error_.errorCustomFetchCode?.typeNotify,
      error_.errorCustomFetchCode?.ignoring,
      error_.errorCustomFetchCode?.console_error
    );
  }

  //evaluar la respuesta que llega del backend
  try {
    return functionEvaluateResponse_(Peticion, name_, error_);
  } catch (error) {
    throw error;
  }
};

export const fetchCustomPdpCycle = async (
  url_: string,
  metodo_: "POST" | "PUT" | "GET",
  name_: string,
  params_: { [key: string]: any } = {},
  body_: { [key: string]: any } = {},
  retries_: number = 1,
  delayseconds_: number = 5,
  error_: ParamsError = defaultParamsError,
  functionEvaluateResponse_: Function = FuctionEvaluateResponseConsultTrx
) => {
  const function_name = fetchCustomPdpCycle.name;
  try {
    for (let i = 1; i <= retries_; i++) {
      await sleep(delayseconds_);
      try {
        return await fetchCustomPdp(
          url_,
          metodo_,
          name_,
          params_,
          body_,
          60,
          error_,
          functionEvaluateResponse_
        );
      } catch (error: any) {
        if (
          !(error instanceof ErrorCustomBackendPending) &&
          !(error instanceof ErrorCustomApiGatewayTimeout) &&
          !(error instanceof ErrorCustomFetchTimeout)
        ) {
          throw error;
        }
        if (i === retries_) {
          throw error;
        }
      }
    }
  } catch (error: any) {
    if (
      !(error instanceof ErrorCustomFetch) &&
      !(error instanceof ErrorCustomFetchCode)
    ) {
      throw new ErrorCustomFetchCode(
        TempErrorFrontService.replace("%s", name_),
        error.message,
        `${function_name} - fetch de ciclos`,
        error_.errorCustomFetchCode?.typeNotify,
        error_.errorCustomFetchCode?.ignoring,
        error_.errorCustomFetchCode?.console_error
      );
    }
    throw error;
  }
};
