import { CareerRepository, CareersNotFoundError } from "$models/Career";
import { CareerGenerator } from "$generators/Career";
import { UniqueConstraintError } from "sequelize";
import { Career } from "$models";

describe("CareerRepository", () => {
  beforeAll(() => CareerRepository.truncate());

  describe("create", () => {
    it("creates a new career", async () => {
      const careerData = CareerGenerator.data();
      const career = await CareerRepository.create(careerData);
      expect(career.code).toEqual(careerData.code);
      expect(career.description).toEqual(careerData.description);
    });

    it("creates a new career with timestamps", async () => {
      const careerData = CareerGenerator.data();
      const career = await CareerRepository.create(careerData);
      expect(career.createdAt).toEqual(expect.any(Date));
      expect(career.updatedAt).toEqual(expect.any(Date));
    });

    it("timestamps are null until saved", async () => {
      const career = new Career({ code: "10", description: "Ingeniería Informática" });
      expect(career.createdAt).toBeUndefined();
      expect(career.updatedAt).toBeUndefined();
      career.save();
      expect(career.createdAt).toEqual(expect.any(Date));
      expect(career.updatedAt).toEqual(expect.any(Date));
    });

    it("throws an error if the career with the same code already exists", async () => {
      const careerData = CareerGenerator.data();
      await CareerRepository.create(careerData);
      await expect(CareerRepository.create(careerData)).rejects.toThrowErrorWithMessage(
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
      expect(expectedCareers.map(c => c.code)).toEqual([firstCareer.code]);
    });

    it("throws an error if the career does not exist", async () => {
      await CareerRepository.create(CareerGenerator.data());
      await CareerRepository.create(CareerGenerator.data());
      await expect(
        CareerRepository.deleteByCode("undefinedCareerCode")
      ).rejects.toThrowErrorWithMessage(
        CareersNotFoundError,
        CareersNotFoundError.buildMessage(["undefinedCareerCode"])
      );
    });
  });

  describe("findAll", () => {
    it("retrieve all Careers", async () => {
      await CareerRepository.truncate();
      const career = await CareerRepository.create(CareerGenerator.data());
      const expectedCareers = await CareerRepository.findAll();
      expect(expectedCareers).toHaveLength(1);
      expect(expectedCareers.map(c => c.code)).toMatchObject([career.code]);
    });

    it("retrieve no Careers", async () => {
      await CareerRepository.truncate();
      const expectedCareers = await CareerRepository.findAll();
      expect(expectedCareers).toEqual([]);
    });
  });

  describe("findByCodes", () => {
    it("throws an error if one of the careers does not exist", async () => {
      const firstCareer = await CareerRepository.create(CareerGenerator.data());
      const secondCareer = await CareerRepository.create(CareerGenerator.data());
      await CareerRepository.create(CareerGenerator.data());
      const undefinedCareerCode = "undefinedCareerCode";

      await expect(
        CareerRepository.findByCodes([firstCareer.code, secondCareer.code, undefinedCareerCode])
      ).rejects.toThrowErrorWithMessage(
        CareersNotFoundError,
        CareersNotFoundError.buildMessage([undefinedCareerCode])
      );
    });

    it("throws an error if all of the careers does not exist", async () => {
      await CareerRepository.create(CareerGenerator.data());
      await CareerRepository.create(CareerGenerator.data());
      await CareerRepository.create(CareerGenerator.data());
      const firstUndefinedCareerCode = "firstUndefinedCareerCode";
      const secondUndefinedCareerCode = "secondUndefinedCareerCode";
      const codes = [firstUndefinedCareerCode, secondUndefinedCareerCode];
      await expect(CareerRepository.findByCodes(codes)).rejects.toThrowErrorWithMessage(
        CareersNotFoundError,
        CareersNotFoundError.buildMessage(codes)
      );
    });

    it("retrieve all careers by code", async () => {
      const firstCareer = await CareerRepository.create(CareerGenerator.data());
      const secondCareer = await CareerRepository.create(CareerGenerator.data());
      await CareerRepository.create(CareerGenerator.data());

      const codes = [firstCareer.code, secondCareer.code];
      const expectedCareers = await CareerRepository.findByCodes(codes);

      expect(expectedCareers).toHaveLength(2);
      expect(expectedCareers.map(c => c.code)).toEqual(expect.arrayContaining(codes));
    });
  });

  describe("findByCode", () => {
    it("returns a career by code", async () => {
      const { code } = await CareerRepository.create(CareerGenerator.data());
      const career = await CareerRepository.findByCode(code);
      expect(career.code).toEqual(code);
    });

    it("throws CareersNotFoundError if the career doesn't exist", async () => {
      await expect(
        CareerRepository.findByCode("undefinedCareerCode")
      ).rejects.toThrowErrorWithMessage(
        CareersNotFoundError,
        CareersNotFoundError.buildMessage(["undefinedCareerCode"])
      );
    });
  });
});
