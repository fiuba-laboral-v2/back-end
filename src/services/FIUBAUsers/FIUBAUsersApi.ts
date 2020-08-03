import { IAuthenticateResponse, ICredentials } from "./Interfaces";
import { FiubaUsersServiceConfig } from "../../config/services";
import { Envelope } from "./Envelope";
import { AuthenticateUnknownError, AuthenticateFaultError } from "./Errors";
import "isomorphic-fetch";

export const FIUBAUsersApi = {
  headers: () => ({
    "Content-Type": "text/xml,",
    "charset": "UTF-8"
  }),
  authenticate: async ({ username, password }: ICredentials) => {
    const httpResponse = await fetch(FiubaUsersServiceConfig.url, {
      method: "POST",
      headers: FIUBAUsersApi.headers(),
      body: Envelope.buildAuthenticate({ username, password })
    });
    if (httpResponse.status === 200) {
      const response: IAuthenticateResponse = await httpResponse.json();
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:AutenticarResponse"].return;
    } else if (httpResponse.status === 500) {
      throw new AuthenticateFaultError(await httpResponse.json());
    }
    throw new AuthenticateUnknownError(await httpResponse.json());
  }
};
