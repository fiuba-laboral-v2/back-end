import Database from "../../../src/config/Database";
import { Offer } from "../../../src/models/Offer";
import { OfferMocks } from "./mocks";
import { Company } from "../../../src/models/Company";
import { companyMockData } from "../Company/mocks";


describe("Offer", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Offer.truncate({ cascade: true });
    await Company.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  const createCompany = async () => {
    const company = new Company(companyMockData);
    return company.save();
  };

  const offerWithoutProperty = async (property: string) => {
    const company = await createCompany();
    return new Offer(OfferMocks.offerWithoutProperty(company.id, property));
  };

  it("should create a valid offer", async () => {
    const company = await createCompany();
    const offer = new Offer(OfferMocks.completeData(company.id));
    await offer.save();
    expect(offer.uuid).not.toBeUndefined();
    expect(await offer.getCompany()).toEqual(expect.objectContaining(companyMockData));
  });

  it("should raise error if offer does not belong to any company", async () => {
    const offer = new Offer(OfferMocks.completeData());
    await expect(offer.save()).rejects.toThrow();
  });

  it("should raise error if offer does not has a title", async () => {
    const offer = await offerWithoutProperty("title");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should raise error if offer does not has a description", async () => {
    const offer = await offerWithoutProperty("description");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should raise error if offer does not has a hoursPerDay", async () => {
    const offer = await offerWithoutProperty("hoursPerDay");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should raise error if offer does not has a minimumSalary", async () => {
    const offer = await offerWithoutProperty("minimumSalary");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should raise error if offer does not has a maximumSalary", async () => {
    const offer = await offerWithoutProperty("maximumSalary");
    await expect(offer.save()).rejects.toThrow();
  });
});
