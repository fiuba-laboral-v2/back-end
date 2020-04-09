import { random, lorem } from "faker";
import Database from "../../../../src/config/Database";
import { Offer } from "../../../../src/models/Offer";
import { Company } from "../../../../src/models/Company";
import { OfferSection } from "../../../../src/models/Offer/OfferSection";
import { OfferMocks } from "../mocks";
import { companyMockData } from "../../Company/mocks";

describe("OfferSection", () => {

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Company.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  const createOffer = async () => {
    const company = await new Company(companyMockData).save();
    return new Offer(OfferMocks.withObligatoryData(company.id)).save();
  };

  const sectionAttributes = (offerUuid: string) => (
    {
      offerUuid: offerUuid,
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    }
  );

  describe("Valid create", () => {
    it("should create a valid section", async () => {
      const offer = await createOffer();
      const attributes = sectionAttributes(offer.uuid);
      const section = new OfferSection(attributes);
      expect(section).toHaveProperty("uuid");
      expect(section).toMatchObject(attributes);
    });

    describe("Associations", () => {
      it("should get all offer sections", async () => {
        const offer = await createOffer();
        const attributes = sectionAttributes(offer.uuid);
        await new OfferSection(attributes).save();
        expect(await offer.getSections()).toMatchObject([ attributes ]);
      });
    });
  });

  describe("Errors", () => {
    it("should raise an error if no title is provided", async () => {
      const offer = await createOffer();
      const section = new OfferSection({ offerUuid: offer.uuid, text: lorem.paragraphs() });

      await expect(section.save()).rejects.toThrow();
    });

    it("should raise an error if no text is provided", async () => {
      const offer = await createOffer();
      const section = new OfferSection({ offerUuid: offer.uuid, title: random.words() });

      await expect(section.save()).rejects.toThrow();
    });

    it("should raise an error if no offerUuid is provided", async () => {
      const section = new OfferSection({ title: random.words(), description: lorem.paragraphs() });

      await expect(section.save()).rejects.toThrow();
    });

    it(
      "should raise an error if two sections have the same display order for the same offer",
      async () => {
        const offer = await createOffer();
        await new OfferSection(sectionAttributes(offer.uuid)).save();
        const section = new OfferSection(sectionAttributes(offer.uuid));
        await expect(section.save()).rejects.toThrow();
      });
  });

  describe("Delete cascade", () => {
    it("should delete all offersSections if all offers are deleted", async () => {
      const offer = await createOffer();
      await new OfferSection(sectionAttributes(offer.uuid)).save();

      expect(await OfferSection.findAll()).toHaveLength(1);
      expect(await Offer.findAll()).toHaveLength(1);
      await Offer.truncate({ cascade: true });
      expect(await OfferSection.findAll()).toHaveLength(0);
      expect(await Offer.findAll()).toHaveLength(0);
    });

    it("should delete all offersSections and offer if all companies are deleted", async () => {
      const offer = await createOffer();
      await new OfferSection(sectionAttributes(offer.uuid)).save();

      expect(await Company.findAll()).toHaveLength(1);
      expect(await OfferSection.findAll()).toHaveLength(1);
      expect(await Offer.findAll()).toHaveLength(1);
      await Company.truncate({ cascade: true });
      expect(await Company.findAll()).toHaveLength(0);
      expect(await OfferSection.findAll()).toHaveLength(0);
      expect(await Offer.findAll()).toHaveLength(0);
    });
  });
});
