import { template } from "lodash";

const htmlTemplate = `<div style="white-space: pre-wrap"><%= body %></div>`;

export const HTMLBodyBuilder = {
  build: (title: string, bodyText: string) => template(htmlTemplate)({ title, body: bodyText })
};
