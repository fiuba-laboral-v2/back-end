import { ApplicantRole, CompanyRole, AdminRole, CurrentUser } from "$models/CurrentUser";
import { UserPermissions } from "$models/Permissions";
import { UUID } from "$models/UUID";

describe("CurrentUser", () => {
  describe("when the current user is an applicant", () => {
    it("creates a currentUser with an ApplicantRole", async () => {
      const userUuid = UUID.generate();
      const applicantRole = new ApplicantRole(UUID.generate());
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [applicantRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.roles).toEqual([applicantRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new ApplicantRole(UUID.generate())]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no company role", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new ApplicantRole(UUID.generate())]
      });
      expect(currentUser.getCompanyRole()).toBeUndefined();
    });

    it("returns undefined if the current user has no admin role", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new ApplicantRole(UUID.generate())]
      });
      expect(currentUser.getAdminRole()).toBeUndefined();
    });
  });

  describe("when the current user is from a company", () => {
    it("creates a currentUser with a CompanyRole", async () => {
      const userUuid = UUID.generate();
      const companyRole = new CompanyRole(UUID.generate());
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [companyRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.roles).toEqual([companyRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new CompanyRole(UUID.generate())]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no applicant role", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new CompanyRole(UUID.generate())]
      });
      expect(currentUser.getApplicantRole()).toBeUndefined();
    });

    it("returns undefined if the current user has no admin role", async () => {
      const currentUser = new CurrentUser({
        uuid: UUID.generate(),
        roles: [new CompanyRole(UUID.generate())]
      });
      expect(currentUser.getAdminRole()).toBeUndefined();
    });
  });

  describe("when the current user is an admin", () => {
    it("creates a currentUser with an AdminRole", async () => {
      const userUuid = UUID.generate();
      const adminRole = new AdminRole(userUuid);
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [adminRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.roles).toEqual([adminRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const userUuid = UUID.generate();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no applicant role", async () => {
      const userUuid = UUID.generate();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getApplicantRole()).toBeUndefined();
    });

    it("returns undefined if the current user has no company role", async () => {
      const userUuid = UUID.generate();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getCompanyRole()).toBeUndefined();
    });
  });
});
