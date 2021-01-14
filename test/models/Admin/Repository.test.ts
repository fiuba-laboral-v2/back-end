import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { AdminNotFoundError } from "$models/Admin/Errors";

import { UserRepository } from "$models/User";
import { AdminRepository, Secretary } from "$models/Admin";
import { Admin } from "$models";
import { UUID } from "$models/UUID";

import { UserGenerator } from "$generators/User";
import { AdminGenerator } from "$generators/Admin";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

describe("AdminRepository", () => {
  beforeAll(async () => UserRepository.truncate());

  describe("save", () => {
    it("persists an extension Admin", async () => {
      const user = await UserGenerator.instance();
      const attributes = { userUuid: user.uuid!, secretary: Secretary.extension };
      const admin = new Admin(attributes);
      await AdminRepository.save(admin);
      expect(admin).toBeObjectContaining(attributes);
    });

    it("persists a graduados Admin", async () => {
      const user = await UserGenerator.instance();
      const attributes = { userUuid: user.uuid!, secretary: Secretary.graduados };
      const admin = new Admin(attributes);
      await AdminRepository.save(admin);
      expect(admin).toBeObjectContaining(attributes);
    });

    it("persists an Admin with timestamps", async () => {
      const user = await UserGenerator.instance();
      const admin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados });
      await AdminRepository.save(admin);
      expect(admin.createdAt).toEqual(expect.any(Date));
      expect(admin.updatedAt).toEqual(expect.any(Date));
    });

    it("persists an Admin with deletedAt in null", async () => {
      const user = await UserGenerator.instance();
      const admin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados });
      await AdminRepository.save(admin);
      expect(admin.deletedAt).toBeNull();
    });

    it("persist a date in deletedAt", async () => {
      const deletedAt = new Date();
      const user = await UserGenerator.instance();
      const admin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados, deletedAt });
      await AdminRepository.save(admin);
      expect(admin.deletedAt).toEqual(deletedAt);
    });

    it("throws error if userUuid does not belong to a persisted user", async () => {
      const admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
      await expect(AdminRepository.save(admin)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "Admins" violates foreign key constraint "Admins_userUuid_fkey"'
      );
    });

    it("throws error if admin already exists", async () => {
      const user = await UserGenerator.instance();
      const admin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados });
      const anotherAdmin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados });
      await AdminRepository.save(admin);
      await expect(AdminRepository.save(anotherAdmin)).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    });
  });

  describe("findLatest", () => {
    let admin1;
    let admin2;
    let admin3;

    const generateAdmins = async () => {
      return [
        await AdminGenerator.extension(),
        await AdminGenerator.graduados(),
        await AdminGenerator.extension()
      ];
    };

    beforeAll(async () => {
      [admin1, admin2, admin3] = await generateAdmins();
    });

    it("returns the latest admin first", async () => {
      const admins = await AdminRepository.findLatest();
      const firstAdminInList = [admins.results[0], admins.results[1], admins.results[2]];

      expect(admins.shouldFetchMore).toEqual(false);
      expect(firstAdminInList).toEqual([
        expect.objectContaining({
          userUuid: admin3.userUuid,
          secretary: admin3.secretary
        }),
        expect.objectContaining({
          userUuid: admin2.userUuid,
          secretary: admin2.secretary
        }),
        expect.objectContaining({
          userUuid: admin1.userUuid,
          secretary: admin1.secretary
        })
      ]);
    });

    describe("fetchMore", () => {
      let admin4;
      let admin5;
      let admin6;
      let admin7;

      beforeAll(async () => {
        [admin4, admin5, admin6] = await generateAdmins();
        [admin7, ,] = await generateAdmins();
      });

      it("gets the next 3 admins", async () => {
        const itemsPerPage = 3;
        mockItemsPerPage(itemsPerPage);

        const updatedBeforeThan = {
          dateTime: admin7.updatedAt,
          uuid: admin7.userUuid
        };

        const admins = await AdminRepository.findLatest(updatedBeforeThan);
        expect(admins.results).toEqual([
          expect.objectContaining({
            userUuid: admin6.userUuid,
            secretary: admin6.secretary
          }),
          expect.objectContaining({
            userUuid: admin5.userUuid,
            secretary: admin5.secretary
          }),
          expect.objectContaining({
            userUuid: admin4.userUuid,
            secretary: admin4.secretary
          })
        ]);
        expect(admins.shouldFetchMore).toBe(true);
      });
    });
  });

  describe("findFirstBySecretary", () => {
    beforeEach(() => AdminRepository.truncate());

    it("returns the first admin from graduados secretary", async () => {
      await AdminGenerator.extension();
      await AdminGenerator.extension();
      const firstGraduadosAdmin = await AdminGenerator.graduados();
      await AdminGenerator.graduados();
      const admin = await AdminRepository.findFirstBySecretary(Secretary.graduados);
      expect(admin.userUuid).toEqual(firstGraduadosAdmin.userUuid);
    });

    it("returns the first admin from extension secretary", async () => {
      const firstExtensionAdmin = await AdminGenerator.extension();
      await AdminGenerator.extension();
      await AdminGenerator.graduados();
      await AdminGenerator.graduados();
      const admin = await AdminRepository.findFirstBySecretary(Secretary.extension);
      expect(admin.userUuid).toEqual(firstExtensionAdmin.userUuid);
    });

    it("throws an error if no extension admin is persisted", async () => {
      await AdminGenerator.graduados();
      await AdminGenerator.graduados();
      await expect(
        AdminRepository.findFirstBySecretary(Secretary.extension)
      ).rejects.toThrowErrorWithMessage(AdminNotFoundError, AdminNotFoundError.buildMessage());
    });

    it("throws an error if no graduados admin is persisted", async () => {
      await AdminGenerator.extension();
      await AdminGenerator.extension();
      await expect(
        AdminRepository.findFirstBySecretary(Secretary.graduados)
      ).rejects.toThrowErrorWithMessage(AdminNotFoundError, AdminNotFoundError.buildMessage());
    });
  });

  describe("findByUserUuid", () => {
    it("returns an admin of extension by userUuid", async () => {
      const extensionAdmin = await AdminGenerator.extension();
      const admin = await AdminRepository.findByUserUuid(extensionAdmin.userUuid);
      expect(admin.userUuid).toEqual(extensionAdmin.userUuid);
      expect(admin.secretary).toEqual(Secretary.extension);
    });

    it("returns an admin of graduados by userUuid", async () => {
      const extensionAdmin = await AdminGenerator.graduados();
      const admin = await AdminRepository.findByUserUuid(extensionAdmin.userUuid);
      expect(admin.userUuid).toEqual(extensionAdmin.userUuid);
      expect(admin.secretary).toEqual(Secretary.graduados);
    });

    it("throws an error if the admin does not exist", async () => {
      const nonExistentUserUuid = UUID.generate();
      await expect(
        AdminRepository.findByUserUuid(nonExistentUserUuid)
      ).rejects.toThrowErrorWithMessage(
        AdminNotFoundError,
        AdminNotFoundError.buildMessage(nonExistentUserUuid)
      );
    });

    it("throws error if userUuid belongs to a persisted user with a deletedAt date", async () => {
      const deletedAt = new Date();
      const user = await UserGenerator.instance();
      const admin = new Admin({ userUuid: user.uuid!, secretary: Secretary.graduados, deletedAt });
      await AdminRepository.save(admin);
      await expect(AdminRepository.findByUserUuid(admin.userUuid)).rejects.toThrowErrorWithMessage(
        AdminNotFoundError,
        AdminNotFoundError.buildMessage(admin.userUuid)
      );
    });
  });

  describe("cascade", () => {
    it("deletes all admins if users tables is truncated", async () => {
      await AdminGenerator.extension();
      await AdminGenerator.graduados();
      await AdminGenerator.extension();
      expect((await AdminRepository.findLatest()).results.length).toBeGreaterThan(0);
      await UserRepository.truncate();
      expect((await AdminRepository.findLatest()).results).toHaveLength(0);
    });

    it("deletes all admins if admins tables is truncated", async () => {
      await AdminGenerator.extension();
      await AdminGenerator.graduados();
      await AdminGenerator.extension();
      expect((await AdminRepository.findLatest()).results.length).toBeGreaterThan(0);
      await AdminRepository.truncate();
      expect((await AdminRepository.findLatest()).results).toHaveLength(0);
    });
  });
});
