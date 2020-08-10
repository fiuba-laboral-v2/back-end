import { CredentialsFactory } from "$models/User/Credentials/CredentialsFactory";
import { FiubaUserCredentials } from "$models/User/Credentials/FiubaUserCredentials";
import { CompanyUserCredentials } from "$models/User/Credentials/CompanyUserCredentials";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { UserGenerator } from "$generators/User";

describe("CredentialsFactory", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  describe("create", () => {
    it("returns the Fiuba User generator", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const user = await applicant.getUser();
      expect(CredentialsFactory.create(user)).toBeInstanceOf(FiubaUserCredentials);
    });

    it("returns the CompanyUser User generator", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [user] = await company.getUsers();
      expect(CredentialsFactory.create(user)).toBeInstanceOf(CompanyUserCredentials);
    });

    it("throws an error for a user that is not from Fiuba or a company", async () => {
      const user = await UserGenerator.instance();
      jest.spyOn(CompanyUserCredentials, "accept").mockReturnValueOnce(false);
      jest.spyOn(FiubaUserCredentials, "accept").mockReturnValueOnce(false);
      expect(
        () => CredentialsFactory.create(user)
      ).toThrow("No validator for user credentials was found");
    });
  });
});
