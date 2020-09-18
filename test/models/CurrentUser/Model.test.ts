import { ApplicantRole, CompanyRole, AdminRole, CurrentUser } from "$models/CurrentUser";
import generateUuid from "uuid/v4";

describe("CurrentUser", () => {
  it("creates a currentUser with an ApplicantRole", async () => {
    const userUuid = generateUuid();
    const applicantUuid = generateUuid();
    const email = "applicant@mail.com";
    const currentApplicant = new CurrentUser(userUuid, email, [new ApplicantRole(applicantUuid)]);
    expect(currentApplicant.uuid).toEqual(userUuid);
    expect(currentApplicant.email).toEqual(email);
    expect(currentApplicant.roles).toHaveLength(1);
  });

  it("creates a currentUser with a CompanyRole", async () => {
    const userUuid = generateUuid();
    const companyUuid = generateUuid();
    const email = "company@mail.com";
    const currentApplicant = new CurrentUser(userUuid, email, [new CompanyRole(companyUuid)]);
    expect(currentApplicant.uuid).toEqual(userUuid);
    expect(currentApplicant.email).toEqual(email);
    expect(currentApplicant.roles).toHaveLength(1);
  });

  it("creates a currentUser with an AdminRole", async () => {
    const userUuid = generateUuid();
    const adminUserUuid = generateUuid();
    const email = "admin@mail.com";
    const currentApplicant = new CurrentUser(userUuid, email, [new AdminRole(adminUserUuid)]);
    expect(currentApplicant.uuid).toEqual(userUuid);
    expect(currentApplicant.email).toEqual(email);
    expect(currentApplicant.roles).toHaveLength(1);
  });
});
