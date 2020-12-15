import { template } from "lodash";

const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title><%= title %></title>
    <style>
      body {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body><%= body %></body>
</html>
`.trim();

export const HTMLBodyBuilder = {
  build: (title: string, bodyText: string) => template(htmlTemplate)({ title, body: bodyText })
};
