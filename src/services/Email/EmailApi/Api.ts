import { Environment } from "$config";
import { parse } from "fast-xml-parser";
import { ISendEmail } from "../interface";
import { RequestBodyBuilder } from "./RequestBodyBuilder";
import "isomorphic-fetch";

const sendEmail = (params: ISendEmail) =>
  fetch(Environment.emailApi.url(), {
    method: "POST",
    headers: {
      "Content-Type": "text/xml,",
      charset: "UTF-8"
    },
    body: RequestBodyBuilder.build(params)
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
