import { ApplicantTargetAdminPermission } from "$models/Permissions/AdminPermissions/ApplicantTargetAdminPermission";
import { ApplicantType } from "$models/Applicant";
import { Admin } from "$models";
import { UUID } from "$models/UUID";
import { Secretary } from "$models/Admin";

describe("ApplicantTargetAdminPermission", () => {
  describe("Extension admin", () => {
    let admin: Admin;

    beforeAll(() => {
      admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    });

    it("returns true if the applicantType is student", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.student);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the applicantType is both", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.both);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the applicantType is graduate", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.graduate);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("Graduados admin", () => {
    let admin: Admin;

    beforeAll(() => {
      admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
    });

    it("returns true if the applicantType is both", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.both);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the applicantType is graduate", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.graduate);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the applicantType is student", () => {
      const permission = new ApplicantTargetAdminPermission(admin, ApplicantType.student);
      expect(permission.apply()).toBe(false);
    });
  });
});
