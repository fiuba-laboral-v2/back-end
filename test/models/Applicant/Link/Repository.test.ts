import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLinkRepository, ApplicantLink } from "../../../../src/models/Applicant/Link";
import { random, internet } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

describe("ApplicantLinkRepository", () => {
  let applicant: Applicant;

  beforeAll(async () => Database.setConnection());

  beforeEach(async () => {
    await UserRepository.truncate();
    const { uuid: userUuid } = await UserRepository.create({
      email: "sblanco@yahoo.com",
      password: "fdmgkfHGH4353",
      name: "Bruno",
      surname: "Diaz"
    });
    applicant = await Applicant.create({
      userUuid: userUuid,
      padron: 1,
      description: "Batman"
    });
  });

  beforeEach(() => ApplicantLink.truncate({ cascade: true }));

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

    expect(link).toHaveProperty("uuid");
    expect(link).toMatchObject({
      applicantUuid: applicant.uuid,
      name: params.name,
      url: params.url
    });
  });

  it("should update a valid link", async () => {
    const params = {
      name: "Google",
      url: "www.google.com"
    };

    await ApplicantLinkRepository.update([params], applicant);
    const [firstLink] = await applicant.getLinks();

    const newParams = {
      uuid: firstLink.uuid,
      name: "LinkedIn",
      url: "www.linkedin.com"
    };

    await ApplicantLinkRepository.update([newParams], applicant);
    const [link] = await applicant.getLinks();

    expect(link).toHaveProperty("uuid");
    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject(newParams);
  });
});
