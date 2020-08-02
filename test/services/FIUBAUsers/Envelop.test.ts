import { Envelop } from "../../../src/services/FIUBAUsers/Envelop";

describe("Envelop", () => {
  it("returns an xml envelop with the required credentials", async () => {
    const username = "username";
    const password = "password";
    const envelop = Envelop.buildAuthenticate({ username, password });
    expect(envelop).toEqualIgnoringSpacing(`
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
