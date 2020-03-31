
import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLink, ApplicantLinkRepository } from "../../../../src/models/Applicant/Link";
import { random, internet } from "faker";

describe("ApplicantLinkRepository", () => {
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
      name: random.word(),
      url: internet.url()
    };
    await ApplicantLinkRepository.updateOrCreate(applicant, params);

    const [link] = await applicant.getLinks();

    expect(link).toBeDefined();
    expect(link).toHaveProperty("uuid");
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject({
      name: params.name,
      url: params.url
    });
  });
});
