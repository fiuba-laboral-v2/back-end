import { ICredentials } from "./Interfaces";

export const Envelop = {
  buildAuthenticate: ({ username, password }: ICredentials) => {
    return `
      <?xml version="1.0" encoding="utf-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Header/>
        <SOAP-ENV:Body>
          <Autenticar>
            <userid>${username}</userid>
            <password>${password}</password>
          </Autenticar>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `;
  }
};
