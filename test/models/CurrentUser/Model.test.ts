import { ApplicantRole, CompanyRole, AdminRole, CurrentUser } from "$models/CurrentUser";
import { UserPermissions } from "$models/Permissions";
import { v4 as generateUuid } from "uuid";

describe("CurrentUser", () => {
  describe("when the current user is an applicant", () => {
    it("creates a currentUser with an ApplicantRole", async () => {
      const userUuid = generateUuid();
      const email = "applicant@mail.com";
      const applicantRole = new ApplicantRole(generateUuid());
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email,
        roles: [applicantRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toEqual([applicantRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "applicant@mail.com",
        roles: [new ApplicantRole(generateUuid())]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no company role", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "applicant@mail.com",
        roles: [new ApplicantRole(generateUuid())]
      });
      expect(currentUser.getCompany()).toBeUndefined();
    });

    it("returns undefined if the current user has no admin role", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "applicant@mail.com",
        roles: [new ApplicantRole(generateUuid())]
      });
      expect(currentUser.getAdmin()).toBeUndefined();
    });
  });

  describe("when the current user is from a company", () => {
    it("creates a currentUser with a CompanyRole", async () => {
      const userUuid = generateUuid();
      const email = "company@mail.com";
      const companyRole = new CompanyRole(generateUuid());
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email,
        roles: [companyRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toEqual([companyRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "company@mail.com",
        roles: [new CompanyRole(generateUuid())]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no applicant role", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "company@mail.com",
        roles: [new CompanyRole(generateUuid())]
      });
      expect(currentUser.getApplicant()).toBeUndefined();
    });

    it("returns undefined if the current user has no admin role", async () => {
      const currentUser = new CurrentUser({
        uuid: generateUuid(),
        email: "company@mail.com",
        roles: [new CompanyRole(generateUuid())]
      });
      expect(currentUser.getAdmin()).toBeUndefined();
    });
  });

  describe("when the current user is an admin", () => {
    it("creates a currentUser with an AdminRole", async () => {
      const userUuid = generateUuid();
      const email = "admin@mail.com";
      const adminRole = new AdminRole(userUuid);
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email,
        roles: [adminRole]
      });
      expect(currentUser.uuid).toEqual(userUuid);
      expect(currentUser.email).toEqual(email);
      expect(currentUser.roles).toEqual([adminRole]);
    });

    it("returns an instance of UserPermissions", async () => {
      const userUuid = generateUuid();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email: "admin@mail.com",
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getPermissions()).toBeInstanceOf(UserPermissions);
    });

    it("returns undefined if the current user has no applicant role", async () => {
      const userUuid = generateUuid();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email: "admin@mail.com",
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getApplicant()).toBeUndefined();
    });

    it("returns undefined if the current user has no company role", async () => {
      const userUuid = generateUuid();
      const currentUser = new CurrentUser({
        uuid: userUuid,
        email: "admin@mail.com",
        roles: [new AdminRole(userUuid)]
      });
      expect(currentUser.getCompany()).toBeUndefined();
    });
  });
});
