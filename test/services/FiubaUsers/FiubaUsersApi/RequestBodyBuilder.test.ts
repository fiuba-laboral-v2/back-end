import { RequestBodyBuilder } from "../../../../src/services/FiubaUsers";

describe("RequestBodyBuilder", () => {
  it("builds the request body for the api", async () => {
    const username = "username";
    const password = "password";
    const requestBody = RequestBodyBuilder.buildAuthenticate({ username, password });
    expect(requestBody).toEqualIgnoringSpacing(`
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
    `);
  });
});
