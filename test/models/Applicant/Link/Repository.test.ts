import { DatabaseError, UniqueConstraintError, ValidationError } from "sequelize";
import { Applicant, ApplicantLink } from "$models";
import { ApplicantLinkRepository } from "$models/Applicant/Link";
import { internet, random } from "faker";
import { UserRepository } from "$models/User";

const createApplicant = async () => {
  const { uuid: userUuid } = await UserRepository.create({
    email: internet.email(),
    password: "SavePassword123",
    name: "Bruno",
    surname: "Diaz"
  });
  return Applicant.create({
    userUuid: userUuid,
    padron: 1,
    description: random.words()
  });
};

describe("ApplicantLinkRepository", () => {
  let applicant: Applicant;

  beforeEach(async () => {
    await UserRepository.truncate();
    applicant = await createApplicant();
  });

  beforeEach(() => ApplicantLink.truncate({ cascade: true }));

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

    await expect(
      ApplicantLinkRepository.update(
        [{ name: oneName, url: "some.url" }, { name: oneName, url: "other.url" }],
        applicant
      )
    ).rejects.toThrowErrorWithMessage(
      DatabaseError,
      "ON CONFLICT DO UPDATE command cannot affect row a second time"
    );
  });

  it("thows an error if an applicantUuid has duplicated links url", async () => {
    const url = internet.url();

    await expect(
      ApplicantLinkRepository.update(
        [{ name: "name", url }, { name: "other", url }],
        applicant
      )
    ).rejects.toThrowErrorWithMessage(
      UniqueConstraintError,
      "Validation error"
    );
  });

  it("throws an error if the url is longer than 256 characters", async () => {
    await expect(
      ApplicantLinkRepository.update(
        [{ name: "name", url: "a".repeat(300) }],
        applicant
      )
    ).rejects.toThrowBulkRecordErrorIncluding(
      [{ errorClass: ValidationError, message: "Validation error: La URL es inválida" }]
    );
  });
});
