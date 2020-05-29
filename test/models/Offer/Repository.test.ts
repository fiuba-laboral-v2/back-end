import Database from "../../../src/config/Database";
import { OfferRepository } from "../../../src/models/Offer/Repository";
import { CompanyRepository } from "../../../src/models/Company/Repository";
import { CareerRepository } from "../../../src/models/Career";
import { OfferNotFound } from "../../../src/models/Offer/Errors";
import { OfferSection } from "../../../src/models/Offer/OfferSection";
import { OfferCareer } from "../../../src/models/Offer/OfferCareer";
import { Offer } from "../../../src/models/Offer";
import { CompanyGenerator, TCompanyGenerator } from "../../generators/Company";
import { OfferMocks } from "./mocks";
import { careerMocks } from "../Career/mocks";
import { omit } from "lodash";
import { UserRepository } from "../../../src/models/User";

describe("OfferRepository", () => {
  let companies: TCompanyGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    companies = CompanyGenerator.withMinimumData();
  });

  afterAll(() => Database.close());

  describe("Create", () => {
    it("should create a new offer", async () => {
      const { uuid } = await companies.next().value;
      const offerProps = OfferMocks.withObligatoryData(uuid);
      const offer = await OfferRepository.create(offerProps);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should create a new offer with one section", async () => {
      const { uuid } = await companies.next().value;
      const attributes = OfferMocks.withOneSection(uuid);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(omit(attributes, ["sections"])));
      const sections = await offer.getSections();
      expect(sections).toHaveLength(1);
      expect(sections[0]).toEqual(expect.objectContaining(attributes.sections![0]));
    });

    it("should create a new offer with one career", async () => {
      const { uuid } = await companies.next().value;
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const attributes = OfferMocks.withOneCareer(uuid, code);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(omit(attributes, ["careers"])));
      const careers = await offer.getCareers();
      expect(careers).toHaveLength(1);
      expect(careers[0]).toEqual(expect.objectContaining(
        { code: attributes.careers![0].careerCode }
      ));
    });

    it("should create a new offer with one career and one section", async () => {
      const { uuid } = await companies.next().value;
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const attributes = OfferMocks.withOneCareerAndOneSection(uuid, code);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(
        omit(attributes, ["sections", "careers"])
      ));
      const careers = await offer.getCareers();
      const sections = await offer.getSections();
      expect(careers).toHaveLength(1);
      expect(sections).toHaveLength(1);
      expect(sections[0]).toEqual(expect.objectContaining(attributes.sections![0]));
      expect(careers[0]).toEqual(expect.objectContaining(
        { code: attributes.careers![0].careerCode }
      ));
    });

    describe("Rollback Transaction", () => {
      it("should throw error if offer is invalid and not create the section", async () => {
        const attributes = OfferMocks.withOneSectionButNullCompanyId();
        await expect(
          OfferRepository.create(attributes)
        ).rejects.toThrow("notNull Violation: Offer.companyUuid cannot be null");
      });

      it("should throw error if section is invalid and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid } = await companies.next().value;
        await expect(
          OfferRepository.create(OfferMocks.withSectionWithNoTitle(uuid))
        ).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("should throw error if career is invalid and not create the offer", async () => {
        await CompanyRepository.truncate();
        const { uuid } = await companies.next().value;
        await expect(
          OfferRepository.create(OfferMocks.withOneCareerWithNullCareerCode(uuid))
        ).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await OfferCareer.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });
    });
  });

  describe("Update", () => {
    it("updates successfully", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const attributes = OfferMocks.withObligatoryData(companyUuid);
      const { uuid } = await OfferRepository.create(attributes);
      const newSalary = attributes.minimumSalary + 100;
      await OfferRepository.update({ ...attributes, minimumSalary: newSalary, uuid });
      expect((await OfferRepository.findByUuid(uuid)).minimumSalary).toEqual(newSalary);
    });

    it("throws an error if the offer does not exist", async () => {
      const attributes = OfferMocks.withObligatoryData("bda5f82a-d839-4af3-ae04-1b669d590a85");
      await expect(OfferRepository.update({
        ...attributes,
        uuid: "1dd69a27-0f6c-4859-be9e-4de5adf22826"
      })).rejects.toThrow(OfferNotFound);
    });
  });

  describe("Get", () => {
    it("should get the only offer by uuid", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offerProps = OfferMocks.withObligatoryData(companyUuid);
      const { uuid: offerUuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(offerUuid);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should get the only offer by companyUuid", async () => {
      const { uuid: companyUuid } = await companies.next().value;
      const offerProps = OfferMocks.withObligatoryData(companyUuid);
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
    it("should delete all offers if all companies are deleted", async () => {
      const { uuid } = await companies.next().value;
      const offer = await OfferRepository.create(OfferMocks.withObligatoryData(uuid));
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFound);
    });
  });
});
