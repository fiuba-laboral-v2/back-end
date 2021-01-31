import { DatabaseError, UniqueConstraintError, ValidationError } from "sequelize";
import { Applicant } from "$models";
import { ApplicantLinkRepository } from "$models/Applicant/Link";
import { UserRepository } from "$models/User";
import { ApplicantGenerator } from "$generators/Applicant";

describe("ApplicantLinkRepository", () => {
  let applicant: Applicant;

  beforeEach(async () => {
    await UserRepository.truncate();
    applicant = await ApplicantGenerator.instance.withMinimumData();
  });

  describe("update", () => {
    it("creates a valid link with a name and a url", async () => {
      const attributes = { name: "Google", url: "https://www.google.com/" };
      await ApplicantLinkRepository.update([attributes], applicant);
      const [link] = await applicant.getLinks();
      expect(link).toBeObjectContaining({
        applicantUuid: applicant.uuid,
        ...attributes
      });
    });

    it("updates a valid link", async () => {
      const attributes = { name: "Google", url: "www.google.com" };
      await ApplicantLinkRepository.update([attributes], applicant);
      const newAttributes = { name: "LinkedIn", url: "www.linkedin.com" };
      await ApplicantLinkRepository.update([newAttributes], applicant);
      const [link] = await applicant.getLinks();
      expect(link).toBeObjectContaining(newAttributes);
    });

    it("deletes all links and insert the new ones", async () => {
      const links = [
        { name: "Google", url: "www.google.com" },
        { name: "LinkedIn", url: "www.LinkedIn.com" }
      ];

      await ApplicantLinkRepository.update(links, applicant);

      const newLinks = [
        { name: "Yahoo", url: "www.Yahoo.com" },
        { name: "Makro", url: "www.Makro.com" }
      ];

      await ApplicantLinkRepository.update(newLinks, applicant);
      const updatedLinks = await applicant.getLinks();
      expect(updatedLinks.map(link => ({ name: link.name, url: link.url }))).toEqual(
        expect.arrayContaining(newLinks)
      );
    });

    it("allows 2 different applicants to have the same url", async () => {
      const secondApplicant = await ApplicantGenerator.instance.withMinimumData();
      const params = {
        name: "Google",
        url: "www.google.com"
      };

      await ApplicantLinkRepository.update([params], applicant);
      await ApplicantLinkRepository.update([params], secondApplicant);

      const [link] = await applicant.getLinks();
      const [secondlink] = await secondApplicant.getLinks();

      expect({ name: link.name, url: link.url }).toMatchObject({
        name: secondlink.name,
        url: secondlink.url
      });
    });

    it("throws an error if an applicantUuid has duplicated links name", async () => {
      const oneName = "LinkedIn";

      await expect(
        ApplicantLinkRepository.update(
          [
            { name: oneName, url: "some.url" },
            { name: oneName, url: "other.url" }
          ],
          applicant
        )
      ).rejects.toThrowErrorWithMessage(
        DatabaseError,
        "ON CONFLICT DO UPDATE command cannot affect row a second time"
      );
    });

    it("throws an error if an applicantUuid has duplicated links url", async () => {
      const url = "https://www.linkedin.com/in/dylan-alvarez-89430b88/";

      await expect(
        ApplicantLinkRepository.update(
          [
            { name: "name", url },
            { name: "other", url }
          ],
          applicant
        )
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error if the url is longer than 256 characters", async () => {
      await expect(
        ApplicantLinkRepository.update([{ name: "name", url: "a".repeat(300) }], applicant)
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: "Validation error: La URL es inválida"
        }
      ]);
    });
  });
});
