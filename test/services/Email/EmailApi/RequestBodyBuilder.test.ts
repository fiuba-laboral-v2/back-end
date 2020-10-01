import { validate } from "fast-xml-parser";
import { RequestBodyBuilder } from "$services/Email/EmailApi";

describe("RequestBodyBuilder", () => {
  const firstReceiverEmail = "goodbye@world.com";
  const secondReceiverEmail = "goodbye@world.com";
  const bodyAttributes = {
    sender: {
      name: "The Other Sender",
      email: "othersender@mail.com"
    },
    receiverEmails: [firstReceiverEmail, secondReceiverEmail],
    subject: "Goodbye world",
    body: "Goodbye world!"
  };

  it("returns a valid format request body for the api", async () => {
    const requestBody = RequestBodyBuilder.build(bodyAttributes);
    expect(validate(requestBody)).toBe(true);
  });
});
