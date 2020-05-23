import Database from "../../../src/config/Database";
import { Career } from "../../../src/models/Career";
import { careerMocks } from "./mocks";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { UserRepository } from "../../../src/models/User/Repository";

describe("Career model", () => {
  const careerData = careerMocks.careerData();

  beforeAll(() => Database.setConnection());
  beforeEach(() => UserRepository.truncate());
  afterAll(async () => {
    await Database.close();
  });

  it("create a valid applicant", async () => {
    const career: Career = new Career({
      code: careerData.code,
      description: careerData.description,
      credits: careerData.credits
    });

    await career.save();

    expect(career).not.toBeNull();
    expect(career).not.toBeUndefined();
  });

  it("should throw an error if credits is 0", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: 0
    });

    await expect(career.save()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw an error if credits is negative", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: -54
    });

    await expect(career.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("should throw an error if code is null", async () => {
    const career: Career = new Career({
      description: "Ingeniería Informática",
      credits: 250
    });

    await expect(career.validate()).rejects.toThrow();
  });

  it("should throw an error if description is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: null,
      credits: 250
    });

    await expect(career.save()).rejects.toThrow();
  });

  it("should throw an error if credits is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática"
    });

    await expect(career.save()).rejects.toThrow();
  });
});
