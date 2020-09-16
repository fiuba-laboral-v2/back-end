import { CurrentUser } from "$models/CurrentUser";
import { ApplicantPermissions, CompanyPermissions, AdminPermissions } from "$models/Permissions";
import generateUuid from "uuid/v4";

describe("CurrentUser", () => {
  describe("getPermissions", () => {
    it("returns an ApplicantPermissions instance", async () => {
      const currentApplicant = new CurrentUser({
        uuid: generateUuid(),
        email: "applicant@mail.com",
        applicant: {
          uuid: generateUuid()
        }
      });
      expect(currentApplicant.getPermissions()).toBeInstanceOf(ApplicantPermissions);
    });

    it("returns a CompanyPermissions instance", async () => {
      const currentCompany = new CurrentUser({
        uuid: generateUuid(),
        email: "company@mail.com",
        company: {
          uuid: generateUuid()
        }
      });
      expect(currentCompany.getPermissions()).toBeInstanceOf(CompanyPermissions);
    });

    it("returns an AdminPermissions instance", async () => {
      const currentAdmin = new CurrentUser({
        uuid: generateUuid(),
        email: "admin@mail.com",
        admin: {
          userUuid: generateUuid()
        }
      });
      expect(currentAdmin.getPermissions()).toBeInstanceOf(AdminPermissions);
    });

    it("throws an error if the user is not an applicant, company or admin", async () => {
      const currentAdmin = new CurrentUser({
        uuid: generateUuid(),
        email: "admin@mail.com"
      });
      expect(() => currentAdmin.getPermissions()).toThrow(
        "the user should be an applicant, admin or from a company"
      );
    });
  });
});
