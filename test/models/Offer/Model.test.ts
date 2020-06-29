import { NumberIsTooSmallError, SalaryRangeError } from "validations-fiuba-laboral-v2";
import { Database } from "../../../src/config/Database";
import { Offer } from "../../../src/models/Offer";

describe("Offer", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  const offerAttributes = {
    companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
    title: "title",
    description: "description",
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000
  };

  const offerWithoutProperty = async (property: string) => {
    const offerAttributesWithoutProperty = offerAttributes;
    delete offerAttributesWithoutProperty[property];
    return offerAttributesWithoutProperty;
  };

  it("should create a valid offer", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("should throw error if offer does not belong to any company", async () => {
    const offer = new Offer({ ...offerAttributes, companyUuid: null });
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer does not has a title", async () => {
    const offer = new Offer(offerWithoutProperty("title"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer does not has a description", async () => {
    const offer = new Offer(offerWithoutProperty("description"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer does not has a hoursPerDay", async () => {
    const offer = new Offer(offerWithoutProperty("hoursPerDay"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer has negative hoursPerDay", async () => {
    const offer = new Offer({ ...offerAttributes, hoursPerDay: -23 });
    await expect(
      offer.validate()
    ).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if offer does not has a minimumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("minimumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer has negative minimumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, minimumSalary: -23 });
    await expect(
      offer.validate()
    ).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if offer does not has a maximumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("maximumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("should throw error if offer has negative maximumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, maximumSalary: -23 });
    await expect(
      offer.validate()
    ).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw error if minimumSalary if bigger than maximumSalary", async () => {
    const offer = new Offer({
      ...offerAttributes,
      minimumSalary: 100,
      maximumSalary: 50
    });
    await expect(offer.validate()).rejects.toThrow(SalaryRangeError.buildMessage());
  });
});
