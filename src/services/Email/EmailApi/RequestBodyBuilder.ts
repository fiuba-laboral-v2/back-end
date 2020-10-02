import { ISendEmail } from "$services/Email/interface";
import { Environment } from "$config";

export const RequestBodyBuilder = {
  build: ({ sender, receiverEmails, subject, body }: ISendEmail) => {
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
            <aplic_id xsi:type="xsd:string">${Environment.emailApi.applicationID()}</aplic_id>
            <password xsi:type="xsd:string">${Environment.emailApi.password()}</password>
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
  }
};
