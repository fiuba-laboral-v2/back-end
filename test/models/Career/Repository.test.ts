import { Career, CareerRepository } from "../../../src/models/Career";
import Database from "../../../src/config/Database";
import { careerMocks } from "./mocks";
import map from "lodash/map";

describe("CareerRepository", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => await Career.truncate({ cascade: true }));

  afterAll(async () => {
    await Career.truncate({ cascade: true });
    await Database.close();
  });

  it("deletes all asked Careers", async () => {
    const career: Career = await CareerRepository.create(careerMocks.careerData());
    const secondaryCareer: Career = await CareerRepository.create(careerMocks.careerData());

    await CareerRepository.deleteByCode(secondaryCareer.code);
    const expectedCareers = await CareerRepository.findAll();

    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("create a new career", async () => {
    const careerData = careerMocks.careerData();
    const career: Career = await CareerRepository.create(careerData);
    expect(career.code).toEqual(careerData.code);
    expect(career.description).toEqual(careerData.description);
    expect(career.credits).toEqual(careerData.credits);
  });

  it("retrieve all Careers", async () => {
    const career: Career = await CareerRepository.create(careerMocks.careerData());

    const expectedCareers = await CareerRepository.findAll();
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("retrieve all asked Careers", async () => {
    const careerData = careerMocks.careerData();
    const secondCareerData = careerMocks.careerData();
    const thirdCareerData = careerMocks.careerData();
    const career: Career = await CareerRepository.create(careerData);
    const secondaryCareer: Career = await CareerRepository.create(secondCareerData);
    await CareerRepository.create(thirdCareerData);

    const expectedCareers = await CareerRepository.findByCode(
      [careerData.code, secondaryCareer.code]
    );
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(2);
    expect(map(expectedCareers, "code")).toEqual(
      expect.arrayContaining([career.code, secondaryCareer.code])
    );
  });
});
