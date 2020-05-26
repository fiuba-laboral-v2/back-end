import { UniqueConstraintError, ValidationError } from "sequelize";
import Database from "../../../src/config/Database";
import { PhoneNumberWithLettersError, InvalidCuitError } from "validations-fiuba-laboral-v2";
import { CompanyRepository } from "../../../src/models/Company";
import { UserRepository } from "../../../src/models/User";
import { companyMocks } from "./mocks";
import { UserMocks } from "../User/mocks";

describe("CompanyRepository", () => {
  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await Database.close();
  });

  it("creates a new company", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[0];
    const company = await CompanyRepository.create(companyCompleteData);
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
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[1];
    const company = await CompanyRepository.create(
      {
        ...companyCompleteData,
        logo: companyMocks.completeDataWithLogoWithMoreThan255Characters().logo
      }
    );
    expect(company.logo).not.toBeUndefined();
  });

  it("should create a valid company with a large description", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[2];
    await expect(
      CompanyRepository.create({ ...companyCompleteData, description: "word".repeat(300) })
    ).resolves.not.toThrow();
  });

  it("throws an error if new company has an already existing cuit", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[3];
    const cuit = companyCompleteData.cuit;
    await CompanyRepository.create(companyCompleteData);
    await expect(
      CompanyRepository.create({
        cuit: cuit,
        companyName: "Devartis Clone SA",
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
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[4];
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
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[5];
    const company = await CompanyRepository.create(companyCompleteData);
    const expectedCompanies = await CompanyRepository.findAll();
    expect(expectedCompanies).not.toBeNull();
    expect(expectedCompanies).not.toBeUndefined();
    expect(expectedCompanies!.length).toEqual(1);
    const uuids = expectedCompanies.map(({ uuid }) => uuid);
    expect(uuids).toContain(company.uuid);
  });

  it("throws an error if phoneNumbers are invalid", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[6];
    await expect(
      CompanyRepository.create(
        {
          ...companyCompleteData,
          phoneNumbers: ["InvalidPhoneNumber1", "InvalidPhoneNumber2"]
        }
      )
    ).rejects.toThrowBulkRecordErrorIncluding([
      { errorClass: ValidationError, message: PhoneNumberWithLettersError.buildMessage() },
      { errorClass: ValidationError, message: PhoneNumberWithLettersError.buildMessage() }
    ]);
  });

  it("throws an error if phoneNumbers are duplicated", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[7];
    await expect(
      CompanyRepository.create(
        {
          ...companyCompleteData,
          phoneNumbers: ["1159821066", "1159821066"]
        }
      )
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("deletes a company", async () => {
    const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[8];
    const { uuid } = await CompanyRepository.create(companyCompleteData);
    expect(await CompanyRepository.findByUuid(uuid)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrow();
  });

  describe("Update", () => {
    it("updates only company attributes", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[9];
      const { uuid } = await CompanyRepository.create(companyCompleteData);
      const dataToUpdate = {
        cuit: "30711311773",
        companyName: "Devartis SA",
        slogan: "new slogan",
        description: "new description",
        logo: "",
        website: "http://www.new-site-com",
        email: "old@devartis.com"
      };
      const company = await CompanyRepository.update({ uuid, ...dataToUpdate });
      expect(company).toMatchObject(dataToUpdate);
    });

    it("throws an error if cuit is invalid", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[17];
      const { uuid } = await CompanyRepository.create(companyCompleteData);
      await expect(
        CompanyRepository.update({ uuid, cuit: "invalidCuit" })
      ).rejects.toThrowErrorWithMessage(ValidationError, InvalidCuitError.buildMessage());
    });
  });
});
