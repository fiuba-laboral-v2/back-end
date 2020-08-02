import { parse } from "fast-xml-parser";

export const MockEnvelop = {
  AuthenticateSuccessResponse: (isValid: boolean) => parse(`
      <SOAP-ENV:Envelope
        xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:ns1="https://services.fi.uba.ar/usuarios.php"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
        SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
      >
        <SOAP-ENV:Body>
          <ns1:AutenticarResponse>
              <return xsi:type="xsd:boolean">${isValid}</return>
          </ns1:AutenticarResponse>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `),
  AuthenticateErrorResponse: (message: string) => parse(`
    <SOAP-ENV:Envelope>
      <SOAP-ENV:Body>
        <SOAP-ENV:Fault>
          <faultcode xsi:type="xsd:string">SOAP-ENV:Client</faultcode>
          <faultactor xsi:type="xsd:string"></faultactor>
          <faultstring xsi:type="xsd:string">${message}</faultstring>
          <detail xsi:type="xsd:string"></detail>
        </SOAP-ENV:Fault>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
  `),
  AuthenticateInvalidFormatRequest: (username: string, password: string) => parse(`
    <?xml version="1.0" encoding="utf-8"?>
    <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
      <SOAP-ENV:Header/>
      <SOAP-ENV:Body>
        <Autenticar>
          <userid>${username}</userid>
          <password>${password}</password>
        </Autenticar>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
  `),
  AuthenticateUndefinedOperationRequest: (username: string, password: string) => parse(`
    <?xml version="1.0" encoding="utf-8"?>
    <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
      <SOAP-ENV:Header/>
      <SOAP-ENV:Body>
        <UNDEFINED_OPERATION>
          <userid>${username}</userid>
          <password>${password}</password>
        </UNDEFINED_OPERATION>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>
  `)
};
