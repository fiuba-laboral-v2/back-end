import { CareerRepository, CareersNotFoundError } from "$models/Career";
import { CareerGenerator } from "$generators/Career";
import { UniqueConstraintError } from "sequelize";

describe("CareerRepository", () => {
  beforeAll(() => CareerRepository.truncate());

  describe("create", () => {
    it("creates a new career", async () => {
      const careerData = CareerGenerator.data();
      const career = await CareerRepository.create(careerData);
      expect(career.code).toEqual(careerData.code);
      expect(career.description).toEqual(careerData.description);
    });

    it("throws an error if the career with the same code already exists", async () => {
      const careerData = CareerGenerator.data();
      await CareerRepository.create(careerData);
      await expect(
        CareerRepository.create(careerData)
      ).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    });
  });

  describe("deleteByCode", () => {
    it("deletes career by code", async () => {
      await CareerRepository.truncate();
      const firstCareer = await CareerRepository.create(CareerGenerator.data());
      const secondCareer = await CareerRepository.create(CareerGenerator.data());

      await CareerRepository.deleteByCode(secondCareer.code);
      const expectedCareers = await CareerRepository.findAll();

      expect(expectedCareers).toHaveLength(1);
      expect(
        expectedCareers.map(c => c.code)
      ).toEqual(
        [firstCareer.code]
      );
    });
  });

  describe("findAll", () => {
    it("retrieve all Careers", async () => {
      await CareerRepository.truncate();
      const career = await CareerRepository.create(CareerGenerator.data());
      const expectedCareers = await CareerRepository.findAll();
      expect(expectedCareers).toHaveLength(1);
      expect(
        expectedCareers.map(c => c.code)
      ).toMatchObject(
        [career.code]
      );
    });

    it("retrieve no Careers", async () => {
      await CareerRepository.truncate();
      const expectedCareers = await CareerRepository.findAll();
      expect(expectedCareers).toEqual([]);
    });
  });

  it("retrieve all careers by code", async () => {
    const firstCareer = await CareerRepository.create(CareerGenerator.data());
    const secondCareer = await CareerRepository.create(CareerGenerator.data());
    await CareerRepository.create(CareerGenerator.data());

    const expectedCareers = await CareerRepository.findByCodes([
      firstCareer.code,
      secondCareer.code
    ]);

    expect(expectedCareers).toHaveLength(2);
    expect(
      expectedCareers.map(c => c.code)
    ).toEqual(expect.arrayContaining([
      firstCareer.code,
      secondCareer.code
    ]));
  });

  it("throws CareersNotFoundError if the career doesn't exists", async () => {
    await expect(
      CareerRepository.findByCode("undefinedCareerCode")
    ).rejects.toThrowErrorWithMessage(
      CareersNotFoundError,
      CareersNotFoundError.buildMessage(["undefinedCareerCode"])
    );
  });
});
