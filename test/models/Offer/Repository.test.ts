import Database from "../../../src/config/Database";
import { OfferRepository } from "../../../src/models/Offer/Repository";
import { CompanyRepository } from "../../../src/models/Company/Repository";
import { CareerRepository } from "../../../src/models/Career";
import { OfferNotFound } from "../../../src/models/Offer/Errors";
import { OfferSection } from "../../../src/models/Offer/OfferSection";
import { OfferCareer } from "../../../src/models/Offer/OfferCareer";
import { Offer } from "../../../src/models/Offer";
import { companyMockData } from "../Company/mocks";
import { OfferMocks } from "./mocks";
import { careerMocks } from "../Career/mocks";
import { omit } from "lodash";

describe("OfferRepository", () => {
  beforeAll(async () => await Database.setConnection());

  beforeEach(async () => await CompanyRepository.truncate());

  afterAll(async () => await Database.close());

  describe("Create", () => {
    it("should create a new offer", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const offerProps = OfferMocks.withObligatoryData(company.id);
      const offer = await OfferRepository.create(offerProps);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should create a new offer with one section", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const attributes = OfferMocks.withOneSection(company.id);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(omit(attributes, [ "sections" ])));
      const sections = await offer.getSections();
      expect(sections).toHaveLength(1);
      expect(sections[0]).toEqual(expect.objectContaining(attributes.sections[0]));
    });

    it("should create a new offer with one career", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const attributes = OfferMocks.withOneCareer(company.id, code);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(omit(attributes, [ "careers" ])));
      const careers = await offer.getCareers();
      expect(careers).toHaveLength(1);
      expect(careers[0]).toEqual(expect.objectContaining(
        { code: attributes.careers[0].careerCode }
      ));
    });

    it("should create a new offer with one career and one section", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const attributes = OfferMocks.withOneCareerAndOneSection(company.id, code);
      const offer = await OfferRepository.create(attributes);
      expect(offer).toEqual(expect.objectContaining(
        omit(attributes, [ "sections", "careers" ])
      ));
      const careers = await offer.getCareers();
      const sections = await offer.getSections();
      expect(careers).toHaveLength(1);
      expect(sections).toHaveLength(1);
      expect(sections[0]).toEqual(expect.objectContaining(attributes.sections[0]));
      expect(careers[0]).toEqual(expect.objectContaining(
        { code: attributes.careers[0].careerCode }
      ));
    });

    describe("Rollback Transaction", () => {
      it("should throw error if offer is invalid and not create the section", async () => {
        const attributes = OfferMocks.withOneSectionButNullCompanyId();
        await expect(OfferRepository.create(attributes)).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
      });

      it("should throw error if section is invalid and not create the offer", async () => {
        const company = await CompanyRepository.create(companyMockData);
        await expect(
          OfferRepository.create(OfferMocks.withSectionWithNoTitle(company.id))
        ).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });

      it("should throw error if career is invalid and not create the offer", async () => {
        const company = await CompanyRepository.create(companyMockData);
        await expect(
          OfferRepository.create(OfferMocks.withOneCareerWithNullCareerCode(company.id))
        ).rejects.toThrow();
        expect(await OfferSection.findAll()).toHaveLength(0);
        expect(await OfferCareer.findAll()).toHaveLength(0);
        expect(await Offer.findAll()).toHaveLength(0);
      });
    });
  });

  describe("Get", () => {
    it("should get the only offer by uuid", async () => {
      const company = await CompanyRepository.create(companyMockData);
      const offerProps = OfferMocks.withObligatoryData(company.id);
      const { uuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(uuid);
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
      const company = await CompanyRepository.create(companyMockData);
      const offer = await OfferRepository.create(OfferMocks.withObligatoryData(company.id));
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFound);
    });
  });
});
