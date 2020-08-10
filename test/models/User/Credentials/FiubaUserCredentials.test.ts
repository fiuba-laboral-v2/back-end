import { FiubaUserCredentials } from "$models/User/Credentials/FiubaUserCredentials";
import { MissingDniError, UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";

describe("FiubaUserCredentials", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  describe("accept", () => {
    it("returns true if the applicant user has no password", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const user = await applicant.getUser();
      expect(FiubaUserCredentials.accept(user)).toBe(true);
    });

    it("returns false if the user is from a company", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [user] = await company.getUsers();
      expect(FiubaUserCredentials.accept(user)).toBe(false);
    });
  });

  describe("validate", () => {
    it("does not throw an error if the applicant has valid credentials", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const user = await applicant.getUser();
      const credentials = new FiubaUserCredentials();
      expect(() => credentials.validate(user)).not.toThrow();
    });

    it("throws an error if the applicant has no dni", async () => {
      const password = "verySecurePassword101";
      const applicant = await ApplicantGenerator.instance.withMinimumData({ password });
      const user = await applicant.getUser();
      user.dni = undefined as any;
      const credentials = new FiubaUserCredentials();
      expect(() => credentials.validate(user)).toThrow(MissingDniError);
    });

    it("throws an error if user is from a company", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [user] = await company.getUsers();
      const credentials = new FiubaUserCredentials();
      expect(() => credentials.validate(user)).toThrow(MissingDniError);
    });
  });
});
