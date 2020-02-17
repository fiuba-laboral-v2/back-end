import { Career, CareerRepository } from "../../../src/models/Career";
import Database from "../../../src/config/Database";
import { careerMocks } from "./mocks";
import { map } from "lodash";

describe("CareerRepository", () => {
  const careerData = careerMocks.careerData();
  const secondCareerData = careerMocks.careerData();
  const thirdCareerData = careerMocks.careerData();

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CareerRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a new career", async () => {
    const career: Career = await CareerRepository.create(careerData);
    expect(career.code).toEqual(careerData.code);
    expect(career.description).toEqual(careerData.description);
    expect(career.credits).toEqual(careerData.credits);
  });

  it("retrieve all Careers", async () => {
    const career: Career = await CareerRepository.create(careerData);

    const expectedCareers = await CareerRepository.findAll();
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers!.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("retrieve all asked Careers", async () => {
    const career: Career = await CareerRepository.create(careerData);
    const secondaryCareer: Career = await CareerRepository.create(secondCareerData);
    const thirdCareer: Career = await CareerRepository.create(thirdCareerData);

    const expectedCareers = await CareerRepository.findByCode(
      [careerData.code, secondaryCareer.code]
    );
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers!.length).toEqual(2);
    expect(map(expectedCareers, "code")).toEqual(
      expect.arrayContaining([careerData.code, secondaryCareer.code])
    );
  });

  it("deletes all asked Careers", async () => {
    const career: Career = await CareerRepository.create(careerData);
    const secondaryCareer: Career = await CareerRepository.create(secondCareerData);

    await CareerRepository.deleteByCode(secondaryCareer.code);
    const expectedCareers = await CareerRepository.findAll();
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers!.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });
});
