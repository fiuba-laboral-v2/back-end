import { CareerRepository, Errors } from "$models/Career";
import { CareerGenerator } from "$generators/Career";
import { Career } from "$models";

describe("CareerRepository", () => {
  beforeAll(async () => {
    await CareerRepository.truncate();
  });

  beforeEach(async () => await Career.truncate({ cascade: true }));

  it("deletes all asked Careers", async () => {
    const career = await CareerRepository.create(CareerGenerator.data());
    const secondaryCareer = await CareerRepository.create(CareerGenerator.data());

    await CareerRepository.deleteByCode(secondaryCareer.code);
    const expectedCareers = await CareerRepository.findAll();

    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("create a new career", async () => {
    const careerData = CareerGenerator.data();
    const career = await CareerRepository.create(careerData);
    expect(career.code).toEqual(careerData.code);
    expect(career.description).toEqual(careerData.description);
    expect(career.credits).toEqual(careerData.credits);
  });

  it("retrieve all Careers", async () => {
    const career = await CareerRepository.create(CareerGenerator.data());

    const expectedCareers = await CareerRepository.findAll();
    expect(expectedCareers).not.toBeNull();
    expect(expectedCareers).not.toBeUndefined();
    expect(expectedCareers?.length).toEqual(1);
    expect(expectedCareers[0].code).toEqual(career.code);
  });

  it("retrieve all asked Careers", async () => {
    const careerData = CareerGenerator.data();
    const secondCareerData = CareerGenerator.data();
    const thirdCareerData = CareerGenerator.data();
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
    const careerData = CareerGenerator.data();
    await expect(
      CareerRepository.findByCode(careerData.code)
    ).rejects.toThrow(Errors.CareersNotFound);
  });
});
