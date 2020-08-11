import { IFiubaUsersApiErrorResponse } from "../Interfaces";

export class AuthenticateFaultError extends Error {
  public static buildMessage(response: IFiubaUsersApiErrorResponse) {
    try {
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"].faultstring;
    } catch (error) {
      return JSON.stringify(response);
    }
  }

  constructor(response: IFiubaUsersApiErrorResponse) {
    super(AuthenticateFaultError.buildMessage(response));
  }
}
