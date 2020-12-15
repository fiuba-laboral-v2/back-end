import { HTMLBodyBuilder } from "$services/Email/EmailApi/HTMLBodyBuilder";

const expectedResult = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>hey!</title>
    <style>
      body {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>hi

bye</body>
</html>`;

describe("HTMLBodyBuilder", () => {
  it("wraps given text in a template html", async () => {
    const text = HTMLBodyBuilder.build("hey!", "hi\n\nbye");
    expect(text).toEqual(expectedResult);
  });
});
