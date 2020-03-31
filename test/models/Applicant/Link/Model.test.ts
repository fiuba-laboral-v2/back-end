
import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLink } from "../../../../src/models/Applicant/Link";
import { random, internet } from "faker";

describe("ApplicantLink model", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await Database.setConnection();
    await Applicant.truncate({ cascade: true });
    await ApplicantLink.truncate({ cascade: true });
    const myApplicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150
    });
    applicant = await myApplicant.save();
  });

  afterAll(async () => {
    await Applicant.truncate({ cascade: true });
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

  it("raise an error if no name is provided", async () => {
    const applicantLink = new ApplicantLink({ applicantUuid: applicant.uuid, url: internet.url() });

    await expect(applicantLink.save()).rejects.toThrow();
  });

  it("raise an error if no url is provided", async () => {
    const applicantLink = new ApplicantLink({ applicantUuid: applicant.uuid, name: random.word() });

    await expect(applicantLink.save()).rejects.toThrow();
  });

  it("raise an error if no applicantUuid is provided", async () => {
    const applicantLink = new ApplicantLink({ name: random.word(), url: internet.url() });

    await expect(applicantLink.save()).rejects.toThrow();
  });
});
