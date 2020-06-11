import Database from "../../../src/config/Database";
import { AdminRepository } from "../../../src/models/Admin";
import { UserRepository } from "../../../src/models/User";
import { UniqueConstraintError } from "sequelize";
import { AdminGenerator, TAdminDataGenerator } from "../../generators/Admin";
import { UUID_REGEX } from "../index";

describe("AdminRepository", () => {
  let adminsData: TAdminDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    adminsData = AdminGenerator.data();
  });
  afterAll(() => Database.close());

  describe("create", () => {
    it("creates a valid Admin", async () => {
      const adminAttributes = adminsData.next().value;
      const admin = await AdminRepository.create(adminAttributes);
      expect(admin.uuid).toEqual(expect.stringMatching(UUID_REGEX));
      expect(await admin.getUser()).toEqual(expect.objectContaining({
        ...adminAttributes.user,
        password: expect.any(String)
      }));
    });

    it("throws error if admin already exists and rollback transaction", async () => {
      const adminAttributes = adminsData.next().value;
      await AdminRepository.create(adminAttributes);
      const numberOfAdmins = await AdminRepository.findAll();
      await expect(
        AdminRepository.create(adminAttributes)
      ).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
      expect(await AdminRepository.findAll()).toEqual(numberOfAdmins);
    });
  });

  describe("cascade", () => {
    it("deletes all admins if users tables is truncated", async () => {
      await AdminRepository.create(adminsData.next().value);
      await AdminRepository.create(adminsData.next().value);
      await AdminRepository.create(adminsData.next().value);
      expect((await AdminRepository.findAll()).length).toBeGreaterThan(0);
      await UserRepository.truncate();
      expect(await AdminRepository.findAll()).toHaveLength(0);
    });
  });
});
