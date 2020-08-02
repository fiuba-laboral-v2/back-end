import { IAuthenticateRequest, ICredentials } from "./Interfaces";
import { j2xParser, parse } from "fast-xml-parser";
import { readFileSync } from "fs";

export const Envelop = {
  buildAuthenticate: ({ username, password }: ICredentials) => {
    const operation: IAuthenticateRequest = parse(
      readFileSync(`${__dirname}/Operations/Authenticate.xml`, "utf8")
    );
    operation["SOAP-ENV:Envelope"]["SOAP-ENV:Body"].Autenticar.userid = username;
    operation["SOAP-ENV:Envelope"]["SOAP-ENV:Body"].Autenticar.password = password;
    return (new j2xParser({})).parse(operation);
  }
};
