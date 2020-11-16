import { UuidGenerator } from "$models/UuidGenerator";
import { UUID_REGEX } from "$test/models";

describe("UuidGenerator", () => {
  it("generates an uuid", async () => {
    expect(UuidGenerator.generate()).toEqual(expect.stringMatching(UUID_REGEX));
  });
});
