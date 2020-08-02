import { Envelop } from "./Envelop";
import { FIUBAUsersConfig } from "../../config";
import "isomorphic-fetch";
import { IAuthenticateResponse, IResponseError, ICredentials } from "./Interfaces";

export const FIUBAUsers = {
  headers: () => ({
    "Content-Type": "text/xml,",
    "charset": "UTF-8"
  }),
  authenticate: async ({ username, password }: ICredentials) => {
    const httpResponse = await fetch(FIUBAUsersConfig.url, {
      method: "POST",
      headers: FIUBAUsers.headers(),
      body: Envelop.buildAuthenticate(username, password)
    });
    if (httpResponse.status === 200) {
      const response: IAuthenticateResponse = await httpResponse.json();
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:AutenticarResponse"].return;
    } else if (httpResponse.status === 500) {
      const response: IResponseError = await httpResponse.json();
      throw new Error(response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"].faultstring);
    } else {
      const response = await httpResponse.json();
      throw new Error(`Unknown error: ${response}`);
    }
  }
};
