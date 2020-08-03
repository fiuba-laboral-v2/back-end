import { IResponseError } from "../Interfaces";

export class AuthenticateFaultError extends Error {
  public static buildMessage(response: IResponseError) {
    return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"].faultstring;
  }

  constructor(response: IResponseError) {
    super(AuthenticateFaultError.buildMessage(response));
  }
}
