import { UserRepository } from "../../../../src/models/User";

describe("Testing", () => {
  it("1", async () => {
    await UserRepository.truncate();
  });
});
