import { ICredentials, IFiubaUsersApiSuccessResponse } from "../Interfaces";
import { Environment } from "$config";
import { RequestBodyBuilder } from "./RequestBodyBuilder";
import {
  AuthenticateFaultError,
  AuthenticateUnknownError,
  FiubaUsersServiceFetchError
} from "../Errors";
import { parse } from "fast-xml-parser";
import "isomorphic-fetch";
import { FetchError } from "node-fetch";

export const FiubaUsersApi = {
  headers: () => ({
    "Content-Type": "text/xml,",
    charset: "UTF-8"
  }),
  authenticate: async ({ dni, password }: ICredentials) => {
    try {
      const httpResponse = await fetch(Environment.FiubaUsersApi.url(), {
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
    } catch (error) {
      if (error instanceof FetchError) throw new FiubaUsersServiceFetchError(error);
      throw error;
    }
  }
};
