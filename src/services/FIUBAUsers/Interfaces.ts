export interface IAuthenticateResponse {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body": {
      "ns1:AutenticarResponse": {
        return: boolean;
      };
    };
  };
}

export interface IAuthenticateRequest {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Header": {};
    "SOAP-ENV:Body": {
      "Autenticar": {
        userid: string;
        password: string;
      };
    };
  };
}

export interface IResponseError {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body": {
      "SOAP-ENV:Fault": {
        faultcode: string;
        faultactor: string;
        faultstring: string;
        detail: string;
      };
    };
  };
}

export interface ICredentials {
  username: string;
  password: string;
}
