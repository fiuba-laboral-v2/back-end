import { UniqueConstraintError, DatabaseError } from "sequelize";
import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { ApplicantLinkRepository, ApplicantLink } from "../../../../src/models/Applicant/Link";
import { random, internet, name } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

const createApplicant = async () => {
  const { uuid: userUuid } = await UserRepository.create({
    email: internet.email(),
    password: "SavePassword123",
    name: name.firstName(),
    surname: name.lastName()
  });
  return Applicant.create({
    userUuid: userUuid,
    padron: 1,
    description: random.words()
  });
};

describe("ApplicantLinkRepository", () => {
  let applicant: Applicant;

  beforeAll(async () => Database.setConnection());

  beforeEach(async () => {
    await UserRepository.truncate();
    applicant = await createApplicant();
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

    expect(link).toHaveProperty("applicantUuid");
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

    const newParams = {
      name: "LinkedIn",
      url: "www.linkedin.com"
    };

    await ApplicantLinkRepository.update([newParams], applicant);
    const [link] = await applicant.getLinks();

    expect(link).toHaveProperty("applicantUuid");
    expect(link).toMatchObject(newParams);
  });

  it("should allow 2 different applicants to have the same url", async () => {
    const secondApplicant = await createApplicant();
    const params = {
      name: "Google",
      url: "www.google.com"
    };

    await ApplicantLinkRepository.update([params], applicant);
    await ApplicantLinkRepository.update([params], secondApplicant);

    const [link] = await applicant.getLinks();
    const [secondlink] = await secondApplicant.getLinks();

    expect({ name: link.name, url: link.url })
      .toMatchObject({ name: secondlink.name, url: secondlink.url });
  });

  it("thows an error if an applicantUuid has duplicated links name", async () => {
    const oneName = random.word();

    const matcher = expect(
      ApplicantLinkRepository.update(
        [{ name: oneName, url: "some.url" }, { name: oneName, url: "other.url" }],
        applicant
      ));

    await matcher.rejects.toThrow(DatabaseError);
    await matcher.rejects.toThrow("ON CONFLICT DO UPDATE command cannot affect row a second time");
  });

  it("thows an error if an applicantUuid has duplicated links url", async () => {
    const url = internet.url();

    const matcher = expect(
      ApplicantLinkRepository.update(
        [{ name: "name", url }, { name: "other", url }],
        applicant
      )
    );

    await matcher.rejects.toThrow(UniqueConstraintError);
    await matcher.rejects.toThrow("Validation error");
  });

  it("throws an error if the url is longer than 256 characters", async () => {
    const url = "a".repeat(300);

    try {
      await ApplicantLinkRepository.update(
        [{ name: "name", url }],
        applicant
      );
    } catch (e) {
      expect(e.message).toEqual("aggregate error");
      expect(e[0].message).toEqual("Validation error: La URL es inválida");
    }
  });
});
