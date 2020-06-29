import { Database } from "../../../src/config/Database";
import { Admin } from "../../../src/models/Admin";
import { ValidationError } from "sequelize";

describe("Admin", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("creates a valid admin", async () => {
    const userUuid = "fb047680-e2c0-4127-886b-170d0b474a98";
    const admin = new Admin({ userUuid });
    await expect(admin.validate()).resolves.not.toThrow();
    expect(admin).toEqual(expect.objectContaining({
      userUuid,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }));
  });

  it("throws an error if no userUuid is provided", async () => {
    const admin = new Admin({});
    await expect(
      admin.validate()
    ).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Admin.userUuid cannot be null"
    );
  });
});
