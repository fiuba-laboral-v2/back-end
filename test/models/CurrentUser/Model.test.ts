import { ApplicantRole, CompanyRole, AdminRole, CurrentUser } from "$models/CurrentUser";
import { CurrentUserHasNoApplicantRoleError } from "$models/CurrentUser/Errors";
import { UserPermissions } from "$models/Permissions";
import generateUuid from "uuid/v4";

describe("CurrentUser", () => {
  describe("when the current user is an applicant", () => {
    it("creates a currentUser with an ApplicantRole", async () => {
      const userUuid = generateUuid();
      const applicantUuid = generateUuid();
      const email = "applicant@mail.com";
      const currentUser = new CurrentUser(userUuid, email, [new ApplicantRole(applicantUuid)]);
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toHaveLength(1);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser(generateUuid(), "applicant@mail.com", [
        new ApplicantRole(generateUuid())
      ]);
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns an applicant role", async () => {
      const applicantRole = new ApplicantRole(generateUuid());
      const currentUser = new CurrentUser(generateUuid(), "applicant@mail.com", [applicantRole]);
      expect(currentUser.getApplicant()).toEqual(applicantRole);
    });
  });

  describe("when the current user is from a company", () => {
    it("creates a currentUser with a CompanyRole", async () => {
      const userUuid = generateUuid();
      const companyUuid = generateUuid();
      const email = "company@mail.com";
      const currentUser = new CurrentUser(userUuid, email, [new CompanyRole(companyUuid)]);
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toHaveLength(1);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser(generateUuid(), "company@mail.com", [
        new CompanyRole(generateUuid())
      ]);
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("throws an error if the current user has no applicant role", async () => {
      const currentUser = new CurrentUser(generateUuid(), "company@mail.com", [
        new CompanyRole(generateUuid())
      ]);
      expect(() => currentUser.getApplicant()).toThrow(CurrentUserHasNoApplicantRoleError);
    });
  });

  describe("when the current user is an admin", () => {
    it("creates a currentUser with an AdminRole", async () => {
      const userUuid = generateUuid();
      const adminUserUuid = generateUuid();
      const email = "admin@mail.com";
      const currentUser = new CurrentUser(userUuid, email, [new AdminRole(adminUserUuid)]);
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toHaveLength(1);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser(generateUuid(), "admin@mail.com", [
        new AdminRole(generateUuid())
      ]);
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("throws an error if the current user has no applicant role", async () => {
      const currentUser = new CurrentUser(generateUuid(), "admin@mail.com", [
        new AdminRole(generateUuid())
      ]);
      expect(() => currentUser.getApplicant()).toThrow(CurrentUserHasNoApplicantRoleError);
    });
  });
});
