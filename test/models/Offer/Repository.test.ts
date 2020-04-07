import Database from "../../../src/config/Database";
import { OfferRepository, Offer } from "../../../src/models/Offer";
import { OfferNotFound } from "../../../src/models/Offer/Errors";
import { OfferMocks } from "./mocks";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { companyMockData } from "../Company/mocks";

describe("OfferRepository", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  describe("Create", () => {
    it("should create a new offer", async () => {
      const company = await new Company(companyMockData).save();
      const offerProps = OfferMocks.completeData(company.id);
      const offer = await OfferRepository.create(offerProps);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });
  });

  describe("Get", () => {
    it("should get the only offer by uuid", async () => {
      const company = await new Company(companyMockData).save();
      const offerProps = OfferMocks.completeData(company.id);
      const { uuid } = await OfferRepository.create(offerProps);
      const offer = await OfferRepository.findByUuid(uuid);
      expect(offer).toEqual(expect.objectContaining(offerProps));
    });

    it("should raise an error if offer does not exists", async () => {
      await expect(
        OfferRepository.findByUuid("4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da")
      ).rejects.toThrow(OfferNotFound);
    });
  });

  describe("Delete", () => {
    it("should delete all offers if all companies are deleted", async () => {
      const company = await new Company(companyMockData).save();
      const offer = await OfferRepository.create(OfferMocks.completeData(company.id));
      await CompanyRepository.truncate();
      await expect(OfferRepository.findByUuid(offer.uuid)).rejects.toThrow(OfferNotFound);
    });
  });
});
