import { CurrentUserSerializer } from "$models/CurrentUser/Serializer";
import { AdminRole, ApplicantRole, CompanyRole } from "$models/CurrentUser";
import generateUuid from "uuid/v4";

describe("CurrentUserSerializer", () => {
  it("returns a new current user with an applicant role", () => {
    const serializedCurrentUser = {
      uuid: generateUuid(),
      email: "applicant@mail.com",
      applicant: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserSerializer.deserialize(serializedCurrentUser);
    const applicantRole = currentUser.getApplicant();

    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(serializedCurrentUser.applicant.uuid);
    expect(currentUser.getAdmin()).toBeUndefined();
    expect(currentUser.getCompany()).toBeUndefined();
  });

  it("returns a new current user with a company role", () => {
    const serializedCurrentUser = {
      uuid: generateUuid(),
      email: "company@mail.com",
      company: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserSerializer.deserialize(serializedCurrentUser);
    const companyRole = currentUser.getCompany();

    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(currentUser.getAdmin()).toBeUndefined();
    expect(companyRole).toBeInstanceOf(CompanyRole);
    expect(companyRole.companyUuid).toEqual(serializedCurrentUser.company.uuid);
  });

  it("returns a new current user with an admin role", () => {
    const serializedCurrentUser = {
      uuid: generateUuid(),
      email: "admin@mail.com",
      admin: { userUuid: generateUuid() }
    };
    const currentUser = CurrentUserSerializer.deserialize(serializedCurrentUser);
    const adminRole = currentUser.getAdmin();

    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(serializedCurrentUser.admin.userUuid);
    expect(currentUser.getCompany()).toBeUndefined();
  });

  it("returns a new current user with an admin and an applicant role", () => {
    const serializedCurrentUser = {
      uuid: generateUuid(),
      email: "adminAndApplicant@mail.com",
      admin: { userUuid: generateUuid() },
      applicant: { uuid: generateUuid() }
    };
    const currentUser = CurrentUserSerializer.deserialize(serializedCurrentUser);
    const applicantRole = currentUser.getApplicant();
    const adminRole = currentUser.getAdmin();

    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(applicantRole).toBeInstanceOf(ApplicantRole);
    expect(applicantRole.applicantUuid).toEqual(serializedCurrentUser.applicant.uuid);
    expect(adminRole).toBeInstanceOf(AdminRole);
    expect(adminRole.adminUserUuid).toEqual(serializedCurrentUser.admin.userUuid);
    expect(currentUser.getCompany()).toBeUndefined();
  });
});
