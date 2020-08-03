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
  authenticate: async ({ username, password }: ICredentials) => {
    const httpResponse = await fetch(FiubaUsersServiceConfig.url, {
      method: "POST",
      headers: FiubaUsersApi.headers(),
      body: RequestBodyBuilder.buildAuthenticate({ username, password })
    });
    if (httpResponse.status === 200) {
      const text0 = await httpResponse.text();
      // tslint:disable-next-line:no-console
      const response: IFiubaUsersApiSuccessResponse = parse(text0);
      return response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:AutenticarResponse"].return;
    } else if (httpResponse.status === 500) {
      const text1 = await httpResponse.text();
      // tslint:disable-next-line:no-console
      console.log(JSON.stringify(text1));
      throw new AuthenticateFaultError(parse(text1));
    }
    const text2 = await httpResponse.text();
    // tslint:disable-next-line:no-console
    console.log(JSON.stringify(text2));
    throw new AuthenticateUnknownError(parse(text2));
  }
};
