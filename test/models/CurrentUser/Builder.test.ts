import { CurrentUserBuilder, AdminRole, ApplicantRole, CompanyRole } from "$models/CurrentUser";
import { UUID } from "$models/UUID";

describe("CurrentUserBuilder", () => {
  it("returns a new current user with an applicant role", () => {
    const currentUserTokenData = {
      uuid: UUID.generate(),
      email: "applicant@mail.com",
      applicant: { uuid: UUID.generate() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const applicantRole = currentUser.getApplicantRole();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(currentUserTokenData.applicant.uuid);
    expect(currentUser.getAdminRole()).toBeUndefined();
    expect(currentUser.getCompanyRole()).toBeUndefined();
  });

  it("returns a new current user with a company role", () => {
    const currentUserTokenData = {
      uuid: UUID.generate(),
      email: "company@mail.com",
      company: { uuid: UUID.generate() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const companyRole = currentUser.getCompanyRole();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(currentUser.getApplicantRole()).toBeUndefined();
    expect(currentUser.getAdminRole()).toBeUndefined();
    expect(companyRole).toBeInstanceOf(CompanyRole);
    expect(companyRole.companyUuid).toEqual(currentUserTokenData.company.uuid);
  });

  it("returns a new current user with an admin role", () => {
    const currentUserTokenData = {
      uuid: UUID.generate(),
      email: "admin@mail.com",
      admin: { userUuid: UUID.generate() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const adminRole = currentUser.getAdminRole();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(currentUser.getApplicantRole()).toBeUndefined();
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(currentUserTokenData.admin.userUuid);
    expect(currentUser.getCompanyRole()).toBeUndefined();
  });

  it("returns a new current user with an admin and an applicant role", () => {
    const currentUserTokenData = {
      uuid: UUID.generate(),
      email: "adminAndApplicant@mail.com",
      admin: { userUuid: UUID.generate() },
      applicant: { uuid: UUID.generate() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const applicantRole = currentUser.getApplicantRole();
    const adminRole = currentUser.getAdminRole();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(currentUserTokenData.applicant.uuid);
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(currentUserTokenData.admin.userUuid);
    expect(currentUser.getCompanyRole()).toBeUndefined();
  });
});
