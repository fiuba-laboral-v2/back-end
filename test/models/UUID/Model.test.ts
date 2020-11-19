import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";

describe("UUID", () => {
  it("generates an uuid", async () => {
    expect(UUID.generate()).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("generates a valid uuid", async () => {
    expect(UUID.validate(UUID.generate())).toBe(true);
  });

  it("returns false if the uuid has invalid format", async () => {
    expect(UUID.validate("invalidFormat")).toBe(false);
  });
});
