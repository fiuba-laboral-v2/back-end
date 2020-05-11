import { UniqueConstraintError, ValidationError } from "sequelize";
import { PhoneNumberWithLettersError } from "validations-fiuba-laboral-v2";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { companyMocks } from "./mocks";
import Database from "../../../src/config/Database";
import { UserMocks } from "../User/mocks";
import { UserRepository } from "../../../src/models/User";

const companyCompleteData = companyMocks.completeData();

const companyDataWithMinimumData = {
  cuit: "30711819017",
  companyName: "devartis",
  user: UserMocks.userAttributes
};

describe("CompanyRepository", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

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
      companyCompleteData.phoneNumbers!.length
    );
    expect((await company.getPhotos())).toHaveLength(
      companyCompleteData.photos!.length
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
        description: "word".repeat(300),
        user: UserMocks.userAttributes
      })
    ).resolves.not.toThrow();
  });

  it("throws an error if new company has an already existing cuit", async () => {
    const cuit = "30711819017";
    await CompanyRepository.create({
      cuit: cuit, companyName: "Devartis SA",
      user: UserMocks.userAttributes
    });
    await expect(
      CompanyRepository.create({
        cuit: cuit, companyName: "Devartis Clone SA",
        user: { ...UserMocks.userAttributes, email: "qwe@qwe.qwe" }
      })
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("should throw an error if cuit is null", async () => {
    await expect(
      CompanyRepository.create({
        cuit: null as any,
        companyName: "devartis",
        user: UserMocks.userAttributes
      })
    ).rejects.toThrow(ValidationError);
  });

  it("should throw an error if companyName is null", async () => {
    await expect(
      CompanyRepository.create({
        cuit: "30711819017",
        companyName: null as any,
        user: UserMocks.userAttributes
      })
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

  it("throws an error if phoneNumbers are invalid", async () => {
    await expect(
      CompanyRepository.create(
        {
          ...companyDataWithMinimumData,
          phoneNumbers: ["InvalidPhoneNumber1", "InvalidPhoneNumber2"]
        }
      )
    ).rejects.toThrowBulkRecordErrorIncluding([
      { errorClass: ValidationError, message: PhoneNumberWithLettersError.buildMessage() },
      { errorClass: ValidationError, message: PhoneNumberWithLettersError.buildMessage() }
    ]);
  });

  it("throws an error if phoneNumbers are duplicated", async () => {
    await expect(
      CompanyRepository.create(
        { ...companyDataWithMinimumData,
          phoneNumbers: ["1159821066", "1159821066"]
        }
      )
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("deletes a company", async () => {
    const { uuid } = await CompanyRepository.create(companyCompleteData);
    expect(await CompanyRepository.findByUuid(uuid)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrow();
  });
});
