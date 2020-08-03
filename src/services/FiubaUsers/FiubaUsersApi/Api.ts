import { IFiubaUsersApiSuccessResponse, ICredentials } from "../Interfaces";
import { FiubaUsersServiceConfig } from "../../../config/services";
import { RequestBodyBuilder } from "./RequestBodyBuilder";
import { AuthenticateUnknownError, AuthenticateFaultError } from "../Errors";
import "isomorphic-fetch";

export const FiubaUsersApi = {
  headers: () => ({
    "Content-Type": "text/xml,",
    "charset": "UTF-8"
  }),
  authenticate: async ({ username, password }: ICredentials) => {
    const httpResponse = await fetch(FiubaUsersServiceConfig.url, {
      method: "POST",
      headers: FiubaUsersApi.headers(),
      body: RequestBodyBuilder.buildAuthenticate({ username, password })
    });
    if (httpResponse.status === 200) {
      const response: IFiubaUsersApiSuccessResponse = await httpResponse.json();
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:AutenticarResponse"].return;
    } else if (httpResponse.status === 500) {
      throw new AuthenticateFaultError(await httpResponse.json());
    }
    throw new AuthenticateUnknownError(await httpResponse.json());
  }
};
