import { UniqueConstraintError } from "sequelize";
import { CareerRepository } from "../../../src/models/Career";
import { OfferRepository } from "../../../src/models/Offer";
import { CompanyRepository } from "../../../src/models/Company";
import { OfferNotFound } from "../../../src/models/Offer/Errors";
import { OfferSection } from "../../../src/models";
import { OfferCareer } from "../../../src/models";
import { Offer } from "../../../src/models";
import { CompanyGenerator, TCompanyGenerator } from "../../generators/Company";
import { OfferGenerator, TOfferDataGenerator } from "../../generators/Offer";
import { CareerGenerator, TCareerGenerator } from "../../generators/Career";
import { omit } from "lodash";
import { UserRepository } from "../../../src/models/User";

describe("OfferRepository", () => {
  let companies: TCompanyGenerator;
  let careersGenerator: TCareerGenerator;
  let offersData: TOfferDataGenerator;

  beforeAll(async () => {
    await CareerRepository.truncate();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    companies = CompanyGenerator.instance.withMinimumData();
    careersGenerator = CareerGenerator.instance();
    offersData = OfferGenerator.data.withObligatoryData();
  });

  const sectionData = {
    title: "title",
    text: "text",
    displayOrder: 1
  };

  describe("Create", () => {
    it("creates a new offer", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offerProps = offersData.next({ companyUuid }).value;
      const offer = await OfferRepository.create(offerProps);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("creates a new offer with one section", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const attributes = offersData.next({ companyUuid }).value;
      const offer = await OfferRepository.create({ ...attributes, sections: [sectionData] });
      expect(offer).toEqual(expect.objectContaining(attributes));
      const sections = await offer.getSections();
      expect(sections).toEqual([expect.objectContaining(sectionData)]);
    });

    it("creates a new offer with one career", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const { code: careerCode } = await careersGenerator.next().value;
      const attributes = offersData.next({ companyUuid, careers: [{ careerCode }] }).value;
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(omit(attributes, ["careers"])));
      const careers = await offer.getCareers();
      expect(careers).toEqual([
        expect.objectContaining({ code: attributes.careers![0].careerCode })
      ]);
    });

    it("creates a new offer with one career and one section", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const { code: careerCode } = await careersGenerator.next().value;
      const careerData = { careerCode };
      const attributes = offersData.next({ companyUuid, careers: [careerData] }).value;
      const offer = await OfferRepository.create({ ...attributes, sections: [sectionData] });
      expect(offer).toEqual(expect.objectContaining(
        omit(attributes, ["sections", "careers"])
      ));
      const careers = await offer.getCareers();
      const sections = await offer.getSections();
      expect(sections).toEqual([
        expect.objectContaining(sectionData)
      ]);
      expect(careers.map(c => c.code)).toEqual([careerData.careerCode]);
    });

    describe("Rollback Transaction", () => {
      it("throws error if offer has invalid companyUuid and not create the section", async () => {
        const attributes = offersData.next({
          companyUuid: null as any,
          sections: [sectionData]
        }).value;
        await expect(
          OfferRepository.create(attributes)
        ).rejects.toThrow("notNull Violation: Offer.companyUuid cannot be null");
      });

      it("throws error if section has no title and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await companies.next().value;
        const attributes = offersData.next({
          companyUuid,
          sections: [{
            ...sectionData,
            title: null as any
          }]
        }).value;
        await expect(OfferRepository.create(attributes)).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("throws error if career is invalid and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await companies.next().value;
        const careerCode = null as any;
        const attributes = offersData.next({ companyUuid, careers: [{ careerCode }] }).value;
        await expect(OfferRepository.create(attributes)).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await OfferCareer.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("throws an error if adding and existing career to one offer", async () => {
        const { uuid: companyUuid } = await companies.next().value;
        const { code } = await careersGenerator.next().value;
        const offerCareersData = [{ careerCode: code }, { careerCode: code }];
        const attributes = offersData.next({ companyUuid, careers: offerCareersData }).value;
        await expect(
          OfferRepository.create(attributes)
        ).rejects.toThrowErrorWithMessage(
          UniqueConstraintError,
          "Validation error"
        );
      });

      it("throws an error if two sections have the same display order", async () => {
        const { uuid: companyUuid } = await companies.next().value;
        const attributes = offersData.next({ companyUuid, sections: [sectionData] }).value;
        const { uuid: offerUuid } = await OfferRepository.create(attributes);
        await expect(
          OfferSection.create({ offerUuid, ...sectionData })
        ).rejects.toThrowErrorWithMessage(
          UniqueConstraintError,
          "Validation error"
        );
      });
    });
  });

  describe("Update", () => {
    it("updates successfully", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const attributes = offersData.next({ companyUuid }).value;
      const { uuid } = await OfferRepository.create(attributes);
      const newSalary = attributes.maximumSalary + 100;
      const newAttributes = {
        ...attributes,
        minimumSalary: newSalary,
        maximumSalary: 2 * newSalary
      };
      await OfferRepository.update({ ...newAttributes, uuid });
      expect((await OfferRepository.findByUuid(uuid)).minimumSalary).toEqual(newSalary);
    });

    it("throws an error if the offer does not exist", async () => {
      const companyUuid = "bda5f82a-d839-4af3-ae04-1b669d590a85";
      const unknownOfferUuid = "1dd69a27-0f6c-4859-be9e-4de5adf22826";
      await expect(OfferRepository.update({
        ...offersData.next({ companyUuid }).value,
        uuid: unknownOfferUuid
      })).rejects.toThrow(OfferNotFound);
    });
  });

  describe("Get", () => {
    it("should get the only offer by uuid", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offerProps = offersData.next({ companyUuid }).value;
      const { uuid: offerUuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(offerUuid);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should get the only offer by companyUuid", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offerProps = offersData.next({ companyUuid }).value;
      await OfferRepository.create(offerProps);
      const [offer] = await OfferRepository.findByCompanyUuid(companyUuid);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should throw an error if offer does not exists", async () => {
      await expect(
        OfferRepository.findByUuid("4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da")
      ).rejects.toThrow(OfferNotFound);
    });
  });

  describe("Delete", () => {
    it("deletes all offers if all companies are deleted", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offer = await OfferRepository.create(offersData.next({ companyUuid }).value);
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFound);
    });

    it("deletes all offersCareers if all offers are deleted", async () => {
      await OfferRepository.truncate();
      const { uuid: companyUuid } = await companies.next().value;
      const { code: careerCode } = await careersGenerator.next().value;
      await OfferRepository.create(offersData.next({
        companyUuid,
        careers: [{ careerCode }]
      }).value);
      expect(await OfferCareer.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await OfferCareer.findAll()).toHaveLength(0);
    });

    it("deletes all offersCareers and offer if all companies are deleted", async () => {
      await CareerRepository.truncate();
      await CompanyRepository.truncate();
      const { uuid: companyUuid } = await companies.next().value;
      const { code: careerCode } = await careersGenerator.next().value;
      await OfferRepository.create(offersData.next({
        companyUuid,
        careers: [{ careerCode }]
      }).value);

      expect(await OfferCareer.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await OfferCareer.findAll()).toHaveLength(0);
    });

    describe("OfferSections", () => {
      it("deletes all sections if all offers are deleted", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await companies.next().value;
        await OfferRepository.create(offersData.next({
          companyUuid,
          sections: [sectionData]
        }).value);

        expect(await OfferSection.findAll()).toHaveLength(1);
        await OfferRepository.truncate();
        expect(await OfferSection.findAll()).toHaveLength(0);
      });

      it("deletes all sections and offer if all companies are deleted", async () => {
        await CompanyRepository.truncate();
        const { uuid: companyUuid } = await companies.next().value;
        await OfferRepository.create(offersData.next({
          companyUuid,
          sections: [sectionData]
        }).value);

        expect(await OfferSection.findAll()).toHaveLength(1);
        await OfferRepository.truncate();
        expect(await OfferSection.findAll()).toHaveLength(0);
      });
    });
  });
});
