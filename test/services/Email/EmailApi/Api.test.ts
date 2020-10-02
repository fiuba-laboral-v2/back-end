import fetchMock, { MockResponseObject } from "fetch-mock";
import { FetchError } from "node-fetch";
import { Environment } from "$config";
import { EmailApi } from "$services/Email";

const responseBody = ({ success }: { success: boolean }) => `
  <SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:ns1="https://services.fi.uba.ar/misc.php"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
    SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
  >
    <SOAP-ENV:Body>
      <ns1:SendMail_safeResponse>
        <return xsi:type="xsd:boolean">${success ? "true" : "false"}</return>
      </ns1:SendMail_safeResponse>
    </SOAP-ENV:Body>
  </SOAP-ENV:Envelope>
`;

const emailApiParams = {
  sender: {
    name: "The Sender",
    email: "sender@mail.com"
  },
  receiverEmails: ["hello@world.com", "world@hello.com"],
  subject: "Hello world",
  body: "Hello world!"
};

const mockFetch = ({ request, response }: { request?: string; response: MockResponseObject }) =>
  fetchMock.mock(
    {
      url: Environment.emailService.url(),
      method: "POST",
      headers: {
        "Content-Type": "text/xml,",
        charset: "UTF-8"
      },
      functionMatcher: (_, { body }) => {
        if (!request) return true;
        return body?.toString().replace(/\s/g, "") === request.replace(/\s/g, "");
      }
    },
    response
  );

describe("EmailApi", () => {
  beforeEach(() =>
    jest.spyOn(Environment.emailService, "url").mockImplementation(() => "https://email-api.com")
  );
  afterEach(() => fetchMock.restore());

  it("sends an email successfully", async () => {
    jest
      .spyOn(Environment.emailService, "applicationID")
      .mockImplementation(() => "application_id");
    jest
      .spyOn(Environment.emailService, "password")
      .mockImplementation(() => "myVerySecretPassword");
    const params = {
      sender: {
        name: "The Other Sender",
        email: "othersender@mail.com"
      },
      receiverEmails: ["goodbye@world.com", "world@goodbye.com"],
      subject: "Goodbye world",
      body: "Goodbye world!"
    };
    mockFetch({
      request: `
        <soapenv:Envelope
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:misc="https://services.fi.uba.ar/misc.php"
          xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"
        >
          <soapenv:Header/>
          <soapenv:Body>
            <misc:SendMail_safe
              soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
            >
              <aplic_id xsi:type="xsd:string">application_id</aplic_id>
              <password xsi:type="xsd:string">myVerySecretPassword</password>
              <from xsi:type="misc:InfoRemitente">
                <nombre xsi:type="xsd:string">${params.sender.name}</nombre>
                <email xsi:type="xsd:string">${params.sender.email}</email>
              </from>
              <to xsi:type="misc:ArrayOfString" soapenc:arrayType="xsd:string[]">
                ${params.receiverEmails.map(email => `<item>${email}</item>`).join("\n")}
              </to>
              <subject xsi:type="xsd:string">${params.subject}</subject>
              <htmlbody xsi:type="xsd:string">R29vZGJ5ZSB3b3JsZCE=</htmlbody>
              <altbody xsi:type="xsd:string">R29vZGJ5ZSB3b3JsZCE=</altbody>
            </misc:SendMail_safe>
          </soapenv:Body>
        </soapenv:Envelope>
      `.trim(),
      response: { status: 200, body: responseBody({ success: true }) }
    });
    await expect(EmailApi.send(params)).resolves.not.toThrow();
  });

  it(`throws error when the API returns false,
      indicating that it could not connect to the SMTP server`, async () => {
    mockFetch({
      response: { status: 200, body: responseBody({ success: false }) }
    });
    await expect(EmailApi.send(emailApiParams)).rejects.toThrow("Error sending email");
  });

  it("throws error when the API is unavailable", async () => {
    mockFetch({ response: { status: 500, body: "unavailable" } });
    await expect(EmailApi.send(emailApiParams)).rejects.toThrow("Error sending email");
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    mockFetch({ response: { status: 401, body: "" } });
    await expect(EmailApi.send(emailApiParams)).rejects.toThrow("Error sending email");
  });

  it("throws an error if the API has a connection error", async () => {
    mockFetch({ response: { throws: new FetchError("message", "type") } });
    await expect(EmailApi.send(emailApiParams)).rejects.toThrowErrorWithMessage(
      FetchError,
      "message"
    );
  });
});
