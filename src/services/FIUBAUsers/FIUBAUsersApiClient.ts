import { IAuthenticateResponse, ICredentials } from "./Interfaces";
import { FIUBAUsersConfig } from "../../config/services";
import { Envelope } from "./Envelope";
import { AuthenticateUnknownError, AuthenticateFaultError } from "./Errors";
import "isomorphic-fetch";

export const FIUBAUsersApiClient = {
  headers: () => ({
    "Content-Type": "text/xml,",
    "charset": "UTF-8"
  }),
  authenticate: async ({ username, password }: ICredentials) => {
    const httpResponse = await fetch(FIUBAUsersConfig.url, {
      method: "POST",
      headers: FIUBAUsersApiClient.headers(),
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
