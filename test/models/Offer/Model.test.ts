import { NumberIsTooSmallError, SalaryRangeError } from "validations-fiuba-laboral-v2";
import Database from "../../../src/config/Database";
import { Offer } from "../../../src/models/Offer";
import { Company } from "../../../src/models/Company";
import { companyMockData } from "../Company/mocks";
import { OfferMocks, TOfferNumbersProperties } from "./mocks";

describe("Offer", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Company.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  const offerWithoutProperty = async (property: string) => {
    const company = await new Company(companyMockData).save();
    return new Offer(OfferMocks.offerWithoutProperty(company.id, property));
  };

  const offerWithNegativeNumberProperty = async (
    property: TOfferNumbersProperties,
    value: number
  ) => {
    const company = await new Company(companyMockData).save();
    return new Offer(OfferMocks.offerWithNegativeNumberProperty(company.id, property, value));
  };

  it("should create a valid offer", async () => {
    const company = await new Company(companyMockData).save();
    const offerAttributes = OfferMocks.withObligatoryData(company.id);
    const offer = new Offer(offerAttributes);
    await offer.save();
    expect(offer.uuid).not.toBeUndefined();
    expect(offer).toEqual(expect.objectContaining(offerAttributes));
    expect(await offer.getCompany()).toEqual(expect.objectContaining(companyMockData));
    expect(await company.getOffers()).toMatchObject([offerAttributes]);
  });

  it("should throw error if offer does not belong to any company", async () => {
    const offer = new Offer(OfferMocks.withNoCompanyId());
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer does not has a title", async () => {
    const offer = await offerWithoutProperty("title");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer does not has a description", async () => {
    const offer = await offerWithoutProperty("description");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer does not has a hoursPerDay", async () => {
    const offer = await offerWithoutProperty("hoursPerDay");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer has negative hoursPerDay", async () => {
    const offer = await offerWithNegativeNumberProperty("hoursPerDay", -23);
    await expect(offer.save()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if offer does not has a minimumSalary", async () => {
    const offer = await offerWithoutProperty("minimumSalary");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer has negative minimumSalary", async () => {
    const offer = await offerWithNegativeNumberProperty("minimumSalary", -23);
    await expect(offer.save()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if offer does not has a maximumSalary", async () => {
    const offer = await offerWithoutProperty("maximumSalary");
    await expect(offer.save()).rejects.toThrow();
  });

  it("should throw error if offer has negative maximumSalary", async () => {
    const offer = await offerWithNegativeNumberProperty("maximumSalary", -23);
    await expect(offer.save()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if minimumSalary if bigger than maximumSalary", async () => {
    const company = await new Company(companyMockData).save();
    const offer = new Offer(
      await OfferMocks.offerWithSpecificSalaryRange(company.id, 100, 50)
    );
    await expect(offer.save()).rejects.toThrow(SalaryRangeError.buildMessage());
  });
});
