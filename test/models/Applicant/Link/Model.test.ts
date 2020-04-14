import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLink } from "../../../../src/models/Applicant/Link";
import { internet, random } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

describe("ApplicantLink model", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await Database.setConnection();
    await UserRepository.truncate();
    await ApplicantLink.truncate({ cascade: true });
    const myApplicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150,
      userUuid: (await UserRepository.create({
        email: "sblanco@yahoo.com",
        password: "fdmgkfHGH4353"
      })).uuid
    });
    applicant = await myApplicant.save();
  });

  afterAll(async () => {
    await UserRepository.truncate();
    await ApplicantLink.truncate({ cascade: true });
    await Database.close();
  });

  it("creates a valid link with a name and a url", async () => {
    const params = {
      applicantUuid: applicant.uuid,
      name: random.word(),
      url: internet.url()
    };
    const applicantLink = new ApplicantLink(params);
    await applicantLink.save();

    expect(applicantLink).toBeDefined();
    expect(applicantLink).toHaveProperty("uuid");
    expect(applicantLink).toMatchObject({
      name: params.name,
      url: params.url
    });
  });

  it("should throw an error if no name is provided", async () => {
    const applicantLink = new ApplicantLink({ applicantUuid: applicant.uuid, url: internet.url() });

    await expect(applicantLink.save()).rejects.toThrow();
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
    const applicantLink = new ApplicantLink({ applicantUuid: applicant.uuid, name: random.word() });

    await expect(applicantLink.save()).rejects.toThrow();
  });

  it("should throw an error if no applicantUuid is provided", async () => {
    const applicantLink = new ApplicantLink({ name: random.word(), url: internet.url() });

    await expect(applicantLink.save()).rejects.toThrow();
  });
});
