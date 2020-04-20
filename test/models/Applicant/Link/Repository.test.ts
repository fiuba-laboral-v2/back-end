
import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLinkRepository } from "../../../../src/models/Applicant/Link";
import { random, internet } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

describe("ApplicantLinkRepository", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await UserRepository.truncate();
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
    await Database.close();
  });

  it("creates a valid link with a name and a url", async () => {
    const params = {
      name: random.word(),
      url: internet.url()
    };
    await ApplicantLinkRepository.updateOrCreate(applicant, params);

    const [ link ] = await applicant.getLinks();

    expect(link).toBeDefined();
    expect(link).toHaveProperty("uuid");
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject({
      name: params.name,
      url: params.url
    });
  });

  it("updates a valid link", async () => {
    const params = {
      name: random.word(),
      url: internet.url()
    };

    await ApplicantLinkRepository.updateOrCreate(applicant, params);
    const [ firstLink ] = await applicant.getLinks();

    const newParams = {
      uuid: firstLink.uuid,
      name: "cachito",
      url: internet.url()
    };

    await ApplicantLinkRepository.updateOrCreate(applicant, newParams);
    const [ link ] = await applicant.getLinks();

    expect(link).toBeDefined();
    expect(link).toHaveProperty("uuid");
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject({
      name: "cachito",
      url: newParams.url
    });
  });
});
