import { ValidationError } from "sequelize";
import { Applicant, ApplicantLink } from "$models";
import { UserRepository, User } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { FiubaCredentials } from "$models/User/Credentials";
import { DniGenerator } from "$generators/DNI";

describe("ApplicantLink", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await UserRepository.truncate();
    await ApplicantLink.truncate({ cascade: true });
    const credentials = new FiubaCredentials(DniGenerator.generate());
    const user = new User({
      email: "sblanco@yahoo.com",
      name: "Bruno",
      surname: "Diaz",
      credentials
    });
    await UserRepository.save(user);

    applicant = new Applicant({ padron: 1, description: "Batman", userUuid: user.uuid });
    await ApplicantRepository.save(applicant);
  });

  it("should create a valid link with a name and a url", async () => {
    const params = {
      applicantUuid: applicant.uuid,
      name: "Google",
      url: "www.google.com"
    };
    const applicantLink = await ApplicantLink.create(params);

    expect(applicantLink).toMatchObject({
      name: params.name,
      url: params.url
    });
  });

  it("should throw an error if no name is provided", async () => {
    const applicantLink = new ApplicantLink({
      applicantUuid: applicant.uuid,
      url: "www.google.com"
    });
    await expect(applicantLink.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if invalid url is provided", async () => {
    const applicantLink = new ApplicantLink({
      applicantUuid: applicant.uuid,
      name: "Google",
      url: "http://google"
    });
    await expect(applicantLink.validate()).rejects.toThrow("La URL es inválida");
  });

  it("should throw an error if no url is provided", async () => {
    const applicantLink = new ApplicantLink({
      applicantUuid: applicant.uuid,
      name: "Google"
    });
    await expect(applicantLink.validate()).rejects.toThrow();
  });

  it("should throw an error if no applicantUuid is provided", async () => {
    const applicantLink = new ApplicantLink({
      name: "Google",
      url: "www.google.com"
    });
    await expect(applicantLink.validate()).rejects.toThrow();
  });
});
