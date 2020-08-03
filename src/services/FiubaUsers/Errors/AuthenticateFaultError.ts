import { IFiubaUsersApiErrorResponse } from "../Interfaces";

export class AuthenticateFaultError extends Error {
  public static buildMessage(response: IFiubaUsersApiErrorResponse) {
    return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"].faultstring;
  }

  constructor(response: IFiubaUsersApiErrorResponse) {
    super(AuthenticateFaultError.buildMessage(response));
  }
}
