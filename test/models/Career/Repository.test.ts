import Database from "../../../src/config/Database";
import { Career, CareerRepository, Errors } from "../../../src/models/Career";
import { CareerGenerator, TCareerDataGenerator } from "../../generators/Career";

describe("CareerRepository", () => {
  let careersData: TCareerDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CareerRepository.truncate();
    careersData = CareerGenerator.data();
  });

  beforeEach(async () => await Career.truncate({ cascade: true }));

  afterAll(async () => Database.close());

  it("deletes all asked Careers", async () => {
    const career = await CareerRepository.create(careersData.next().value);
    const secondaryCareer = await CareerRepository.create(careersData.next().value);

    await CareerRepository.deleteByCode(secondaryCareer.code);
    const expectedCareers = await CareerRepository.findAll();

    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("create a new career", async () => {
    const careerData = careersData.next().value;
    const career = await CareerRepository.create(careerData);
    expect(career.code).toEqual(careerData.code);
    expect(career.description).toEqual(careerData.description);
    expect(career.credits).toEqual(careerData.credits);
  });

  it("retrieve all Careers", async () => {
    const career = await CareerRepository.create(careersData.next().value);

    const expectedCareers = await CareerRepository.findAll();
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("retrieve all asked Careers", async () => {
    const careerData = careersData.next().value;
    const secondCareerData = careersData.next().value;
    const thirdCareerData = careersData.next().value;
    const career = await CareerRepository.create(careerData);
    const secondaryCareer = await CareerRepository.create(secondCareerData);
    await CareerRepository.create(thirdCareerData);

    const expectedCareers = await CareerRepository.findByCodes(
      [careerData.code, secondaryCareer.code]
    );
    expect(expectedCareers.length).toEqual(2);
    expect(expectedCareers.map(({ code }) => code)).toEqual(
      expect.arrayContaining([career.code, secondaryCareer.code])
    );
  });

  it("throws CareersNotFound if the career doesn't exists", async () => {
    const careerData = careersData.next().value;
    await expect(
      CareerRepository.findByCode(careerData.code)
    ).rejects.toThrow(Errors.CareersNotFound);
  });
});
