import { EmailServiceConfig, Environment } from "$config";
import { parse } from "fast-xml-parser";
import { ISendEmail } from "../interface";

const requestBody = ({ sender, receiverEmails, subject, body }: ISendEmail) => {
  const base64Body = Buffer.from(body).toString("base64");
  return `
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
          <aplic_id xsi:type="xsd:string">${Environment.emailApiApplicationID()}</aplic_id>
          <password xsi:type="xsd:string">${Environment.emailApiPassword()}</password>
          <from xsi:type="misc:InfoRemitente">
            <nombre xsi:type="xsd:string">${sender.name}</nombre>
            <email xsi:type="xsd:string">${sender.email}</email>
          </from>
          <to xsi:type="misc:ArrayOfString" soapenc:arrayType="xsd:string[]">
            ${receiverEmails.map(email => `<item>${email}</item>`).join("\n")}
          </to>
          <subject xsi:type="xsd:string">${subject}</subject>
          <htmlbody xsi:type="xsd:string">${base64Body}</htmlbody>
          <altbody xsi:type="xsd:string">${base64Body}</altbody>
        </misc:SendMail_safe>
      </soapenv:Body>
    </soapenv:Envelope>
  `.trim();
};

const sendEmail = (params: ISendEmail) =>
  fetch(EmailServiceConfig.url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml,",
      charset: "UTF-8"
    },
    body: requestBody(params)
  });

const throwError = (params: ISendEmail, response: string) => {
  throw new Error(`
    Error sending email: ${JSON.stringify(params)}.
    Response: ${response}
  `);
};

export const EmailApi = {
  send: async (params: ISendEmail) => {
    const httpResponse = await sendEmail(params);
    const responseText = await httpResponse.text();
    if (httpResponse.ok) {
      const response = parse(responseText);
      const emailWasSent =
        response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:SendMail_safeResponse"].return;
      if (emailWasSent) return;
    }
    throwError(params, responseText);
  }
};
