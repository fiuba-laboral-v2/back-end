
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
    await ApplicantLinkRepository.update([params], applicant);

    const [link] = await applicant.getLinks();

    expect(link).toBeDefined();
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject({
      name: params.name,
      url: params.url
    });
  });

  it("updates a valid link", async () => {
    const params = {
      name: random.word(),
      url: "some.url"
    };

    await ApplicantLinkRepository.update([params], applicant);

    const newParams = {
      name: params.name,
      url: "other.url"
    };

    await ApplicantLinkRepository.update([newParams], applicant);
    const [link] = await applicant.getLinks();

    expect(link).toBeDefined();
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject({
      name: params.name,
      url: "other.url"
    });
  });

  it("thows an error if an applicantUuid has duplicated links name", async () => {
    const params = {
      name: random.word(),
      url: "some.url"
    };

    await expect(
      ApplicantLinkRepository.update([params, { ...params, url: "other.url" }], applicant)
    ).rejects.toThrow();
  });

  it("thows an error if an applicantUuid has duplicated links url", async () => {
    const params = {
      name: "name",
      url: internet.url()
    };

    await expect(
      ApplicantLinkRepository.update([params, { ...params, url: "otherName" }], applicant)
    ).rejects.toThrow();
  });
});
