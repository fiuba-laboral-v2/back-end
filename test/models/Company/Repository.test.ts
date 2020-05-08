import { ValidationError, UniqueConstraintError } from "sequelize";
import { PhoneNumberWithLettersError, InvalidPhoneNumberError } from "validations-fiuba-laboral-v2";
import BulkRecordError from "sequelize/lib/errors/bulk-record-error";
import { AggregateError } from "bluebird";
import faker from "faker";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { companyMocks } from "./mocks";
import Database from "../../../src/config/Database";

describe("CompanyRepository", () => {
  const companyCompleteData = companyMocks.completeData();

  const companyDataWithMinimumData = {
    cuit: "30711819017",
    companyName: "devartis"
  };

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a new company", async () => {
    const company: Company = await CompanyRepository.create(companyCompleteData);
    expect(company).toEqual(expect.objectContaining({
      cuit: companyCompleteData.cuit,
      companyName: companyCompleteData.companyName,
      slogan: companyCompleteData.slogan,
      description: companyCompleteData.description,
      logo: companyCompleteData.logo,
      website: companyCompleteData.website,
      email: companyCompleteData.email
    }));
    expect((await company.getPhoneNumbers())).toHaveLength(
      companyCompleteData.phoneNumbers.length
    );
    expect((await company.getPhotos())).toHaveLength(
      companyCompleteData.photos.length
    );
  });

  it("creates a valid company with a logo with more than 255 characters", async () => {
    const company = await CompanyRepository.create(
      companyMocks.completeDataWithLogoWithMoreThan255Characters()
    );
    expect(company.logo).not.toBeUndefined();
  });

  it("should create a valid company with a large description", async () => {
    await expect(
      CompanyRepository.create({
        cuit: "30711819017",
        companyName: "devartis",
        description: faker.lorem.paragraph(7)
      })
    ).resolves.not.toThrow();
  });

  it("throws an error if new company has an already existing cuit", async () => {
    const cuit = "30711819017";
    await CompanyRepository.create({ cuit: cuit, companyName: "Devartis SA" });
    await expect(
      CompanyRepository.create({ cuit: cuit, companyName: "Devartis Clone SA" })
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("should throw an error if cuit is null", async () => {
    await expect(
      CompanyRepository.create({ cuit: null, companyName: "devartis" })
    ).rejects.toThrow(ValidationError);
  });

  it("should throw an error if companyName is null", async () => {
    await expect(
      CompanyRepository.create({ cuit: "30711819017", companyName: null })
    ).rejects.toThrow(ValidationError);
  });

  it("retrieve by uuid", async () => {
    const company = await CompanyRepository.create(companyCompleteData);
    const expectedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(expectedCompany).not.toBeNull();
    expect(expectedCompany).not.toBeUndefined();
    expect(expectedCompany.uuid).toEqual(company.uuid);
    expect(
      (await expectedCompany.getPhotos())
    ).toHaveLength(
      (await company.getPhotos()).length
    );
    expect(
      (await expectedCompany.getPhoneNumbers())
    ).toHaveLength(
      (await company.getPhoneNumbers()).length
    );
  });

  it("retrieve all Companies", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    const expectedCompanies = await CompanyRepository.findAll();
    expect(expectedCompanies).not.toBeNull();
    expect(expectedCompanies).not.toBeUndefined();
    expect(expectedCompanies!.length).toEqual(1);
    expect(expectedCompanies[0].uuid).toEqual(company.uuid);
  });

  it("should rollback transaction and throw error if photos is null", async () => {
    try {
      await CompanyRepository.create({ ...companyDataWithMinimumData, photos: [null] });
    } catch (aggregateError) {
      expect(aggregateError).toBeInstanceOf(AggregateError);
      expect(aggregateError).toHaveLength(1);
      const bulkError = aggregateError[0];
      expect(bulkError).toBeInstanceOf(BulkRecordError);
      const validationError = bulkError.errors;
      expect(validationError).toBeInstanceOf(ValidationError);
      expect(
        validationError.message
      ).toEqual("notNull Violation: CompanyPhoto.photo cannot be null");
    }
  });

  it("throws an error if phoneNumbers are invalid", async () => {
    try {
      await CompanyRepository.create(
        {
          ...companyDataWithMinimumData,
          phoneNumbers: ["InvalidPhoneNumber1", "InvalidPhoneNumber2"]
        }
      );
    } catch (aggregateError) {
      expect(aggregateError).toBeInstanceOf(AggregateError);
      expect(aggregateError).toHaveLength(2);
      aggregateError.map(bulkError => expect(bulkError).toBeInstanceOf(BulkRecordError));
      aggregateError.map(({ errors: validationError }) =>
        expect(validationError).toBeInstanceOf(ValidationError)
      );
      aggregateError.map(({ errors: validationError }) =>
        expect(validationError.message).toContain(PhoneNumberWithLettersError.buildMessage())
      );
    }
  });

  it("throws an error if phoneNumbers are duplicated", async () => {
    await expect(
      CompanyRepository.create(
        { ...companyDataWithMinimumData,
          phoneNumbers: ["1159821066", "1159821066"]
        }
      )
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("deletes a company", async () => {
    const { uuid } = await CompanyRepository.create(companyCompleteData);
    expect(await CompanyRepository.findByUuid(uuid)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrow();
  });
});
