import {
  UserPermissions,
  AdminPermissions,
  ApplicantPermissions,
  IPermissions
} from "$models/Permissions";
import { AdminRole, ApplicantRole, CurrentUser } from "$models/CurrentUser";
import { Offer } from "$models";
import { OfferGenerator } from "$generators/Offer";
import { UUID } from "$models/UUID";

describe("UserPermissions", () => {
  let adminRole: AdminRole;
  let applicantRole: ApplicantRole;
  let applicantPermissions: ApplicantPermissions;
  let adminPermissions: AdminPermissions;
  let offer: Offer;
  type Method = "canSeeOffer" | "canModerateOffer";

  const mockPermissions = (permissions: IPermissions, method: Method, result: boolean) => {
    jest.spyOn(permissions, method).mockImplementation(async () => result);
  };

  beforeAll(async () => {
    const adminUserUuid = UUID.generate();
    const applicantUuid = UUID.generate();
    applicantPermissions = new ApplicantPermissions(applicantUuid);
    adminPermissions = new AdminPermissions(adminUserUuid);
    adminRole = new AdminRole(adminUserUuid);
    applicantRole = new ApplicantRole(applicantUuid);
    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: UUID.generate() }));
  });

  beforeEach(async () => {
    jest.spyOn(adminRole, "getPermissions").mockImplementation(() => adminPermissions);
    jest.spyOn(applicantRole, "getPermissions").mockImplementation(() => applicantPermissions);
  });

  describe("Applicant and admin current user", () => {
    let currentUser: CurrentUser;

    beforeAll(() => {
      currentUser = new CurrentUser({
        uuid: UUID.generate(),
        email: "email@email.com",
        roles: [adminRole, applicantRole]
      });
    });

    describe("canSeeOffer", () => {
      it("returns true if admin roles permissions succeeds and applicant's fails", async () => {
        mockPermissions(adminPermissions, "canSeeOffer", true);
        mockPermissions(applicantPermissions, "canSeeOffer", false);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if admin roles permissions fails and applicant's succeeds", async () => {
        mockPermissions(adminPermissions, "canSeeOffer", false);
        mockPermissions(applicantPermissions, "canSeeOffer", true);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns false if both roles permissions fail", async () => {
        mockPermissions(adminPermissions, "canSeeOffer", false);
        mockPermissions(applicantPermissions, "canSeeOffer", false);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });
    });

    describe("canModerateOffer", () => {
      it("returns true if admin roles permissions succeeds and applicant's fails", async () => {
        mockPermissions(adminPermissions, "canModerateOffer", true);
        mockPermissions(applicantPermissions, "canModerateOffer", false);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canModerateOffer(offer)).toBe(true);
      });

      it("returns true if admin roles permissions fails and applicant's succeeds", async () => {
        mockPermissions(adminPermissions, "canModerateOffer", false);
        mockPermissions(applicantPermissions, "canModerateOffer", true);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canModerateOffer(offer)).toBe(true);
      });

      it("returns false if both roles permissions fail", async () => {
        mockPermissions(adminPermissions, "canModerateOffer", false);
        mockPermissions(applicantPermissions, "canModerateOffer", false);
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canModerateOffer(offer)).toBe(false);
      });
    });
  });
});
