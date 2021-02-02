import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { OfferCareerRepository } from "$models/Offer/OfferCareer";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Career, Company, Offer } from "$models";

import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { CareerGenerator } from "$generators/Career";

describe("OfferCareerRepository", () => {
  let company: Company;
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    company = await CompanyGenerator.instance.withMinimumData();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  const createOffer = () =>
    OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });

  describe("bulkCreate", () => {
    it("creates several careers for an offer", async () => {
      const offer = await createOffer();
      const careersData = [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }];
      await OfferCareerRepository.bulkCreate({ careers: careersData, offer });
      const careers = await offer.getCareers();
      expect(careers.map(({ code }) => code)).toEqual(
        expect.arrayContaining([firstCareer.code, secondCareer.code])
      );
    });

    it("throws an error if the careerCodes do not belong to any career", async () => {
      const offer = await createOffer();
      const careersData = [{ careerCode: "AAA" }, { careerCode: "BBB" }];
      await expect(
        OfferCareerRepository.bulkCreate({ careers: careersData, offer })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "OffersCareers" violates foreign key ' +
          'constraint "OffersCareers_careerCode_fkey"'
      );
    });

    it("throws an error the career already exists", async () => {
      const offer = await createOffer();
      const careersData = [{ careerCode: firstCareer.code }, { careerCode: firstCareer.code }];
      await expect(
        OfferCareerRepository.bulkCreate({ careers: careersData, offer })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("update", () => {
    it("update offer career by first deleting all previous", async () => {
      const offer = await createOffer();

      await OfferCareerRepository.update({
        careers: [{ careerCode: firstCareer.code }],
        offer
      });
      const initialCareers = await offer.getCareers();
      expect(initialCareers.map(({ code }) => code)).toEqual([firstCareer.code]);

      await OfferCareerRepository.update({
        careers: [{ careerCode: secondCareer.code }],
        offer
      });
      const finalCareers = await offer.getCareers();
      expect(finalCareers.map(({ code }) => code)).toEqual([secondCareer.code]);
    });

    it("deletes all offer careers if no career is provided", async () => {
      const offer = await createOffer();

      await OfferCareerRepository.update({
        careers: [{ careerCode: firstCareer.code }],
        offer
      });
      expect(await offer.getCareers()).toHaveLength(1);
      await OfferCareerRepository.update({ careers: [], offer });
      expect(await offer.getCareers()).toHaveLength(0);
    });

    it("throws error if the career is repeated", async () => {
      const offer = await createOffer();
      await expect(
        OfferCareerRepository.update({
          careers: [{ careerCode: firstCareer.code }, { careerCode: firstCareer.code }],
          offer
        })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws error if the career does not exist", async () => {
      const offer = await createOffer();
      await expect(
        OfferCareerRepository.update({
          careers: [{ careerCode: "100" }, { careerCode: firstCareer.code }],
          offer
        })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "OffersCareers" violates foreign key ' +
          'constraint "OffersCareers_careerCode_fkey"'
      );
    });

    it("throws error if the offer does not exist", async () => {
      const offer = await new Offer();
      await expect(
        OfferCareerRepository.update({
          careers: [{ careerCode: "100" }, { careerCode: firstCareer.code }],
          offer
        })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "OffersCareers" violates foreign key ' +
          'constraint "OffersCareers_careerCode_fkey"'
      );
    });
  });
});
