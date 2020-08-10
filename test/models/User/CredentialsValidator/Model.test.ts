import { CredentialsValidator } from "$models/User/CredentialsValidator";
import {
  CompanyUserCredentialsValidator
} from "$models/User/CredentialsValidator/CompanyUserCredentialsValidator";
import {
  FiubaUserCredentialsValidator
} from "$models/User/CredentialsValidator/FiubaUserCredentialsValidator";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { UserGenerator } from "$generators/User";

describe("CredentialsValidator", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
  });

  it("returns the Fiuba User generator", async () => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const user = await applicant.getUser();
    expect(CredentialsValidator.getValidator(user)).toBe(FiubaUserCredentialsValidator);
  });

  it("returns the CompanyUSer User generator", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const [user] = await company.getUsers();
    expect(CredentialsValidator.getValidator(user)).toBe(CompanyUserCredentialsValidator);
  });

  it("throws an error for a user that is not from Fiuba or a company", async () => {
    const user = await UserGenerator.instance();
    jest.spyOn(CompanyUserCredentialsValidator, "accept").mockReturnValueOnce(false);
    jest.spyOn(FiubaUserCredentialsValidator, "accept").mockReturnValueOnce(false);
    expect(() => CredentialsValidator.getValidator(user)).toThrow();
  });
});
