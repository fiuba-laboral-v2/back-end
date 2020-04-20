import Database from "../../../../src/config/Database";
import { Offer } from "../../../../src/models/Offer";
import { Company } from "../../../../src/models/Company";
import { OfferCareer } from "../../../../src/models/Offer/OfferCareer";
import { CareerRepository } from "../../../../src/models/Career";
import { OfferMocks } from "../mocks";
import { companyMockData } from "../../Company/mocks";
import { careerMocks } from "../../Career/mocks";
import { OfferCareerMocks } from "./mocks";

describe("OfferCareer", () => {

  beforeAll(() => Database.setConnection());

  beforeEach(() => Company.truncate({ cascade: true }));

  afterAll(() => Database.close());

  const createOffer = async () => {
    const company = await new Company(companyMockData).save();
    return new Offer(OfferMocks.withObligatoryData(company.id)).save();
  };

  const createOfferCareer = async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const offer = await createOffer();
    const attributes = OfferCareerMocks.completeData(offer.uuid, career.code);
    const offerCareer = await OfferCareer.create(attributes);
    return { offerCareer, attributes, offer, career };
  };

  describe("Valid create", () => {
    it("should create a valid offer career", async () => {
      const { offerCareer, attributes } = await createOfferCareer();
      expect(offerCareer).toMatchObject(attributes);
    });

    describe("Associations", () => {
      it("should get all offer careers", async () => {
        const { offer, attributes } = await createOfferCareer();
        const careers = await offer.getCareers();
        expect(careers).toHaveLength(1);
        expect(careers[0]).toMatchObject({ code: attributes.careerCode });
      });
    });
  });

  describe("Errors", () => {
    it("should throw an error if no careerCode is provided", async () => {
      const { uuid } = await createOffer();
      const offerCareer = new OfferCareer(OfferCareerMocks.withNoCareerCode(uuid));
      await expect(offerCareer.save()).rejects.toThrow();
    });

    it("should throw an error if no offerUuid is provided", async () => {
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const offerCareer = new OfferCareer(OfferCareerMocks.withNoOfferUuid(code));
      await expect(offerCareer.save()).rejects.toThrow();
    });

    it("should throw an error if adding and existing career to one offer", async () => {
      const { uuid } = await createOffer();
      const { code } = await CareerRepository.create(careerMocks.careerData());
      await OfferCareer.create(OfferCareerMocks.completeData(uuid, code));
      const offerCareer = new OfferCareer(OfferCareerMocks.completeData(uuid, code));
      await expect(offerCareer.save()).rejects.toThrow();
    });
  });

  describe("Delete cascade", () => {
    it("should delete all offersCareers if all offers are deleted", async () => {
      await createOfferCareer();
      expect(await OfferCareer.findAll()).toHaveLength(1);
      expect(await Offer.findAll()).toHaveLength(1);
      await Offer.truncate({ cascade: true });
      expect(await OfferCareer.findAll()).toHaveLength(0);
      expect(await Offer.findAll()).toHaveLength(0);
    });

    it("should delete all offersCareers and offer if all companies are deleted", async () => {
      await createOfferCareer();
      expect(await Company.findAll()).toHaveLength(1);
      expect(await OfferCareer.findAll()).toHaveLength(1);
      expect(await Offer.findAll()).toHaveLength(1);
      await Company.truncate({ cascade: true });
      expect(await Company.findAll()).toHaveLength(0);
      expect(await OfferCareer.findAll()).toHaveLength(0);
      expect(await Offer.findAll()).toHaveLength(0);
    });
  });
});
