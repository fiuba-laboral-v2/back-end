import { Envelop } from "../../../src/services/FIUBAUsers/Envelop";

describe("Envelop", () => {
  it("returns an xml envelop with the required credentials", async () => {
    const envelop = Envelop.buildAuthenticate("username", "password");
    expect(envelop).toEqualIgnoringSpacing(`
      <SOAP-ENV:Envelope>
        <SOAP-ENV:Header></SOAP-ENV:Header>
        <SOAP-ENV:Body>
          <Autenticar>
            <userid>username</userid>
            <password>password</password>
          </Autenticar>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `);
  });
});
