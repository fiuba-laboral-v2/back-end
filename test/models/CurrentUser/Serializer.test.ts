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
    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeInstanceOf(ApplicantRole);
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
    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(currentUser.getAdmin()).toBeUndefined();
    expect(currentUser.getCompany()).toBeInstanceOf(CompanyRole);
  });

  it("returns a new current user with an admin role", () => {
    const serializedCurrentUser = {
      uuid: generateUuid(),
      email: "admin@mail.com",
      admin: { userUuid: generateUuid() }
    };
    const currentUser = CurrentUserSerializer.deserialize(serializedCurrentUser);
    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeUndefined();
    expect(currentUser.getAdmin()).toBeInstanceOf(AdminRole);
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
    expect(currentUser.uuid).toEqual(serializedCurrentUser.uuid);
    expect(currentUser.email).toEqual(serializedCurrentUser.email);
    expect(currentUser.getApplicant()).toBeInstanceOf(ApplicantRole);
    expect(currentUser.getAdmin()).toBeInstanceOf(AdminRole);
    expect(currentUser.getCompany()).toBeUndefined();
  });
});
