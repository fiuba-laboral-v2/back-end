import { UniqueConstraintError, ValidationError } from "sequelize";
import { PhoneNumberWithLettersError, InvalidCuitError } from "validations-fiuba-laboral-v2";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { companyMocks } from "./mocks";
import Database from "../../../src/config/Database";
import { UserMocks } from "../User/mocks";
import { UserRepository } from "../../../src/models/User";
import arrayContaining = jasmine.arrayContaining;

const companyCompleteData = companyMocks.completeData();

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
          ...companyMocks.minimumData(),
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
        {
          ...companyMocks.minimumData(),
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

  describe("Update", () => {
    const userAttributes = {
      email: "sblanco@devartis.com",
      password: "verySecurePassword101",
      name: "Sebastian",
      surname: "Blanco"
    };

    beforeEach(() => 0);

    it("updates only company attributes", async () => {
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          slogan: "initial slogan",
          description: "initial description",
          logo: "https://miro.medium.com/max/11520/1*Om-snCmpOoI5vehnF6FBlw.jpeg",
          website: "http://www.old-site-com",
          email: "old@devartis.com"
        }
      );
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
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis"
        }
      );
      const company = await CompanyRepository.update({ uuid, phoneNumbers: ["1159821066"] });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toEqual(["1159821066"]);
    });

    it("updates company phone numbers by adding new ones and deleting missing ones", async () => {
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
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
      const initialPhoneNumbers = ["1159871234", "1160393692"];
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          phoneNumbers: initialPhoneNumbers
        }
      );
      const newPhoneNumbers = [...initialPhoneNumbers, "1143075222"];
      const company = await CompanyRepository.update({ uuid, phoneNumbers: newPhoneNumbers });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toHaveLength(3);
      expect(phoneNumbers).toEqual(arrayContaining(newPhoneNumbers));
    });

    it("does not updatea any company phone number", async () => {
      const initialPhoneNumbers = ["1159871234", "1160393692"];
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          phoneNumbers: initialPhoneNumbers
        }
      );
      const company = await CompanyRepository.update({ uuid });
      const phoneNumbers = (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber);
      expect(phoneNumbers).toHaveLength(2);
      expect(phoneNumbers).toEqual(arrayContaining(initialPhoneNumbers));
    });

    it("updates company photos by adding a new one", async () => {
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          photos: initialPhotos
        }
      );
      const newPhotos = [...initialPhotos, "data:image/jpeg;base64,/9j/4AAQSABA AgICICAgICAgIA=="];
      const company = await CompanyRepository.update({ uuid, photos: newPhotos });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(3);
      expect(photos).toEqual(arrayContaining(newPhotos));
    });

    it("updates company photos by adding a new one and removing the missing ones", async () => {
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          photos: initialPhotos
        }
      );
      const newPhotos = ["data:image/jpeg;base64,/9j/4AAQSABA AgICICAgICAgIA=="];
      const company = await CompanyRepository.update({ uuid, photos: newPhotos });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(1);
      expect(photos).toEqual(arrayContaining(newPhotos));
    });

    it("does not update any company photo", async () => {
      const initialPhotos = [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AgICAgICAgICAgICAgIA==",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABA AICAgICAgIA=="
      ];
      const { uuid } = await CompanyRepository.create(
        {
          user: userAttributes,
          cuit: "30711819017",
          companyName: "Devartis",
          photos: initialPhotos
        }
      );
      const company = await CompanyRepository.update({ uuid });
      const photos = (await company.getPhotos()).map(({ photo }) => photo);
      expect(photos).toHaveLength(2);
      expect(photos).toEqual(arrayContaining(initialPhotos));
    });

    it("throws an error if cuit is invalid", async () => {
      const { uuid } = await CompanyRepository.create(companyMocks.companyData());
      await expect(
        CompanyRepository.update({ uuid, cuit: "invalidCuit" })
      ).rejects.toThrowErrorWithMessage(ValidationError, InvalidCuitError.buildMessage());
    });
  });
});
