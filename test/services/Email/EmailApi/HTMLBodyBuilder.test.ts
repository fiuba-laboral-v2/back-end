import { HTMLBodyBuilder } from "$services/Email/EmailApi/HTMLBodyBuilder";

describe("HTMLBodyBuilder", () => {
  it("replaces newlines with breaks", async () => {
    expect(HTMLBodyBuilder.build("hi\n\nbye")).toEqual("hi<br><br>bye");
  });
});
