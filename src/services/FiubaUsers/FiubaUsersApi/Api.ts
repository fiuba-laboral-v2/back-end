import { IFiubaUsersApiSuccessResponse, ICredentials } from "../Interfaces";
import { FiubaUsersServiceConfig } from "../../../config/services";
import { RequestBodyBuilder } from "./RequestBodyBuilder";
import { AuthenticateUnknownError, AuthenticateFaultError } from "../Errors";
import { parse } from "fast-xml-parser";
import "isomorphic-fetch";

export const FiubaUsersApi = {
  headers: () => ({
    "Content-Type": "text/xml,",
    "charset": "UTF-8"
  }),
  authenticate: async ({ dni, password }: ICredentials) => {
    const httpResponse = await fetch(FiubaUsersServiceConfig.url, {
      method: "POST",
      headers: FiubaUsersApi.headers(),
      body: RequestBodyBuilder.buildAuthenticate({ dni, password })
    });
    if (httpResponse.status === 200) {
      const response: IFiubaUsersApiSuccessResponse = parse(await httpResponse.text());
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:AutenticarResponse"].return;
    } else if (httpResponse.status === 500) {
      throw new AuthenticateFaultError(parse(await httpResponse.text()));
    }
    throw new AuthenticateUnknownError(parse(await httpResponse.text()));
  }
};
