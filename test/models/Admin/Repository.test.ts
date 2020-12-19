import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import { AdminNotFoundError } from "$models/Admin/Errors";

import { UserRepository, BadCredentialsError } from "$models/User";
import { AdminRepository, Secretary } from "$models/Admin";
import { Admin } from "$models";
import { UUID } from "$models/UUID";
import { FiubaUsersService } from "$services";

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

  describe("create", () => {
    it("throws an error if the fiuba service rejects authentication attempt", async () => {
      jest.spyOn(FiubaUsersService, "authenticate").mockImplementation(async () => false);
      const adminAttributes = AdminGenerator.data(Secretary.graduados);
      await expect(AdminRepository.create(adminAttributes)).rejects.toThrowErrorWithMessage(
        BadCredentialsError,
        BadCredentialsError.buildMessage()
      );
    });

    it("throws error if admin already exists and rollback transaction", async () => {
      const adminAttributes = AdminGenerator.data(Secretary.extension);
      await AdminRepository.create(adminAttributes);
      const numberOfAdmins = (await AdminRepository.findLatest()).results;
      await expect(AdminRepository.create(adminAttributes)).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
      expect((await AdminRepository.findLatest()).results).toEqual(numberOfAdmins);
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

  describe("findByUserUuid", () => {
    it("returns an admin of extension by userUuid", async () => {
      const extensionAdminAttributes = AdminGenerator.data(Secretary.extension);
      const { userUuid: userExtensionUuid } = await AdminRepository.create(
        extensionAdminAttributes
      );

      const extensionAdmin = await AdminRepository.findByUserUuid(userExtensionUuid);
      expect(extensionAdmin.userUuid).toEqual(userExtensionUuid);
    });

    it("returns an admin of graduados by userUuid", async () => {
      const graduadosAdminAttributes = AdminGenerator.data(Secretary.graduados);
      const { userUuid: userGraduadosUuid } = await AdminRepository.create(
        graduadosAdminAttributes
      );
      const graduadosAdmin = await AdminRepository.findByUserUuid(userGraduadosUuid);
      expect(graduadosAdmin.userUuid).toEqual(userGraduadosUuid);
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
      await AdminRepository.create(AdminGenerator.data(Secretary.extension));
      await AdminRepository.create(AdminGenerator.data(Secretary.extension));
      await AdminRepository.create(AdminGenerator.data(Secretary.extension));
      expect((await AdminRepository.findLatest()).results.length).toBeGreaterThan(0);
      await UserRepository.truncate();
      expect((await AdminRepository.findLatest()).results).toHaveLength(0);
    });
  });
});
