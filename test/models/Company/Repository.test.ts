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
    beforeEach(() => 0);

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

    it("updates company phone numbers by adding new", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[10];
      const { uuid } = await CompanyRepository.create(companyCompleteData);
      const company = await CompanyRepository.update({ uuid, phoneNumbers: ["1159821066"] });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toEqual(["1159821066"]);
    });

    it("updates company phone numbers by adding new ones and deleting missing ones", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[11];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          phoneNumbers: ["1159871234", "1160393692"]
        }
      );
      const newPhoneNumbers = ["1143075222"];
      const company = await CompanyRepository.update({ uuid, phoneNumbers: newPhoneNumbers });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toHaveLength(1);
      expect(phoneNumbers).toEqual(newPhoneNumbers);
    });

    it("updates company phone numbers by adding a new one", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[12];
      const initialPhoneNumbers = ["1159871234", "1160393692"];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          phoneNumbers: initialPhoneNumbers
        }
      );
      const newPhoneNumbers = [...initialPhoneNumbers, "1143075222"];
      const company = await CompanyRepository.update({ uuid, phoneNumbers: newPhoneNumbers });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toHaveLength(3);
      expect(phoneNumbers).toEqual(expect.arrayContaining(newPhoneNumbers));
    });

    it("does not updatea any company phone number", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[13];
      const initialPhoneNumbers = ["1159871234", "1160393692"];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          phoneNumbers: initialPhoneNumbers
        }
      );
      const company = await CompanyRepository.update({ uuid });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toHaveLength(2);
      expect(phoneNumbers).toEqual(expect.arrayContaining(initialPhoneNumbers));
    });

    it("updates company photos by adding a new one", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[14];
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          photos: initialPhotos
        }
      );
      const newPhotos = [...initialPhotos, "data:image/jpeg;base64,/9j/4AAQSABA AgICICAgICAgIA=="];
      const company = await CompanyRepository.update({ uuid, photos: newPhotos });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(3);
      expect(photos).toEqual(expect.arrayContaining(newPhotos));
    });

    it("updates company photos by adding a new one and removing the missing ones", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[15];
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          photos: initialPhotos
        }
      );
      const newPhotos = ["data:image/jpeg;base64,/9j/4AAQSABA AgICICAgICAgIA=="];
      const company = await CompanyRepository.update({ uuid, photos: newPhotos });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(1);
      expect(photos).toEqual(expect.arrayContaining(newPhotos));
    });

    it("does not update any company photo", async () => {
      const companyCompleteData = companyMocks.nineteenCompaniesWithCompleteData()[16];
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          ...companyCompleteData,
          photos: initialPhotos
        }
      );
      const company = await CompanyRepository.update({ uuid });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(2);
      expect(photos).toEqual(expect.arrayContaining(initialPhotos));
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
