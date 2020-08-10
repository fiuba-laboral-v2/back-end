import { CompanyUserCredentials } from "$models/User/Credentials/CompanyUserCredentials";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";

describe("CompanyUserCredentials", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  describe("validate", () => {
    it("does not throw an error if the companyUser has valid credentials", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [user] = await company.getUsers();
      const credentials = new CompanyUserCredentials();
      expect(() => credentials.validate(user)).not.toThrow();
    });

    it("throws an error if the user is an applicant", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const user = await applicant.getUser();
      const credentials = new CompanyUserCredentials();
      expect(() => credentials.validate(user)).toThrow();
    });
  });
});
