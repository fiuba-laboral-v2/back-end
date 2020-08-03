import { AdminRepository } from "../../../src/models/Admin";
import { UserRepository } from "../../../src/models/User";
import { UniqueConstraintError } from "sequelize";
import {
  ExtensionAdminGenerator,
  GraduadosAdminGenerator,
  TAdminDataGenerator
} from "../../generators/Admin";
import { AdminNotFoundError } from "../../../src/models/Admin/Errors";

describe("AdminRepository", () => {
  let adminsExtensionData: TAdminDataGenerator;
  let adminsGraduadosData: TAdminDataGenerator;

  beforeAll(async () => {
    await UserRepository.truncate();
    adminsExtensionData = ExtensionAdminGenerator.data();
    adminsGraduadosData = GraduadosAdminGenerator.data();
  });

  describe("create", () => {
    it("creates a valid Admin of extension", async () => {
      const adminAttributes = adminsExtensionData.next().value;
      const admin = await AdminRepository.create(adminAttributes);
      expect(await admin.getUser()).toEqual(expect.objectContaining({
        ...adminAttributes.user,
        password: expect.any(String)
      }));
      expect(admin).toEqual(expect.objectContaining({
        secretary: adminAttributes.secretary
      }));
    });

    it("creates a valid Admin of graduados", async () => {
      const adminAttributes = adminsGraduadosData.next().value;
      const admin = await AdminRepository.create(adminAttributes);
      expect(await admin.getUser()).toEqual(expect.objectContaining({
        ...adminAttributes.user,
        password: expect.any(String)
      }));
      expect(admin).toEqual(expect.objectContaining({
        secretary: adminAttributes.secretary
      }));
    });

    it("throws error if admin already exists and rollback transaction", async () => {
      const adminAttributes = adminsExtensionData.next().value;
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
    it("returns an admin of extension by userUuid", async () => {
      const adminExtensionAttributes = adminsExtensionData.next().value;
      const { userUuid: userExtensionUuid } = await AdminRepository.create(
        adminExtensionAttributes
      );

      const adminExtension = await AdminRepository.findByUserUuid(userExtensionUuid);
      expect(adminExtension.userUuid).toEqual(userExtensionUuid);
    });

    it("returns an admin of graduados by userUuid", async () => {
      const adminGraduadosAttributes = adminsGraduadosData.next().value;
      const { userUuid: userGraduadosUuid } = await AdminRepository.create(
        adminGraduadosAttributes
      );
      const adminGraduados = await AdminRepository.findByUserUuid(userGraduadosUuid);
      expect(adminGraduados.userUuid).toEqual(userGraduadosUuid);
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
      await AdminRepository.create(adminsExtensionData.next().value);
      await AdminRepository.create(adminsExtensionData.next().value);
      await AdminRepository.create(adminsExtensionData.next().value);
      expect((await AdminRepository.findAll()).length).toBeGreaterThan(0);
      await UserRepository.truncate();
      expect(await AdminRepository.findAll()).toHaveLength(0);
    });
  });
});
