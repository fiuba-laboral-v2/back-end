import Database from "../../../src/config/Database";
import { Career, CareerRepository, Errors } from "../../../src/models/Career";
import { careerMocks } from "./mocks";

describe("CareerRepository", () => {
  beforeAll(async () => Database.setConnection());

  beforeEach(async () => await Career.truncate({ cascade: true }));

  afterAll(async () => Database.close());

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

    const expectedCareers = await CareerRepository.findByCodes(
      [ careerData.code, secondaryCareer.code ]
    );
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(2);
    expect(expectedCareers.map(({ code }) => code)).toEqual(
      expect.arrayContaining([ career.code, secondaryCareer.code ])
    );
  });

  it("should throw CareersNotFound if the career doesn't exists", async () => {
    const careerData = careerMocks.careerData();

    await expect(CareerRepository.findByCode(careerData.code))
      .rejects.toThrow(Errors.CareersNotFound);
  });
});
