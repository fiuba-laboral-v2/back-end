import { CurrentUserBuilder, AdminRole, ApplicantRole, CompanyRole } from "$models/CurrentUser";
import { v4 as generateUuid } from "uuid";

describe("CurrentUserBuilder", () => {
  it("returns a new current user with an applicant role", () => {
    const currentUserTokenData = {
      uuid: generateUuid(),
      email: "applicant@mail.com",
      applicant: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const applicantRole = currentUser.getApplicant();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(currentUserTokenData.applicant.uuid);
    expect(currentUser.getAdmin()).toBeUndefined();
    expect(currentUser.getCompany()).toBeUndefined();
  });

  it("returns a new current user with a company role", () => {
    const currentUserTokenData = {
      uuid: generateUuid(),
      email: "company@mail.com",
      company: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const companyRole = currentUser.getCompany();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(currentUser.getAdmin()).toBeUndefined();
    expect(companyRole).toBeInstanceOf(CompanyRole);
    expect(companyRole.companyUuid).toEqual(currentUserTokenData.company.uuid);
  });

  it("returns a new current user with an admin role", () => {
    const currentUserTokenData = {
      uuid: generateUuid(),
      email: "admin@mail.com",
      admin: { userUuid: generateUuid() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const adminRole = currentUser.getAdmin();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(currentUserTokenData.admin.userUuid);
    expect(currentUser.getCompany()).toBeUndefined();
  });

  it("returns a new current user with an admin and an applicant role", () => {
    const currentUserTokenData = {
      uuid: generateUuid(),
      email: "adminAndApplicant@mail.com",
      admin: { userUuid: generateUuid() },
      applicant: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserBuilder.build(currentUserTokenData);
    const applicantRole = currentUser.getApplicant();
    const adminRole = currentUser.getAdmin();

    expect(currentUser.uuid).toEqual(currentUserTokenData.uuid);
    expect(currentUser.email).toEqual(currentUserTokenData.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(currentUserTokenData.applicant.uuid);
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(currentUserTokenData.admin.userUuid);
    expect(currentUser.getCompany()).toBeUndefined();
  });
});
