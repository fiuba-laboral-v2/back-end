import Database from "../../../src/config/Database";
import { AdminRepository } from "../../../src/models/Admin";
import { UserRepository } from "../../../src/models/User";
import { UniqueConstraintError } from "sequelize";
import { AdminGenerator, TAdminDataGenerator } from "../../generators/Admin";
import { AdminNotFoundError } from "../../../src/models/Admin/Errors";

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

  describe("findByUserUuid", () => {
    it("returns an admin by userUuid", async () => {
      const adminAttributes = adminsData.next().value;
      const { userUuid } = await AdminRepository.create(adminAttributes);
      const admin = await AdminRepository.findByUserUuid(userUuid);
      expect(admin.userUuid).toEqual(userUuid);
    });

    it("throws an error if the admin does not exist", async () => {
      const nonExistentUserUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        AdminRepository.findByUserUuid(nonExistentUserUuid)
      ).rejects.toThrowErrorWithMessage(
        AdminNotFoundError,
        AdminNotFoundError.buildMessage(nonExistentUserUuid)
      );
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
