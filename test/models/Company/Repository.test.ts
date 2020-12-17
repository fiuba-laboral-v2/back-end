import { UniqueConstraintError, ValidationError } from "sequelize";
import { InvalidCuitError, PhoneNumberWithLettersError } from "validations-fiuba-laboral-v2";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Company } from "$models";
import { CompanyNotFoundError } from "$models/Company/Errors";
import { UserRepository, User, FiubaCredentials } from "$models/User";
import { UUID } from "$models/UUID";
import { CompanyRepository } from "$models/Company";

import { CompanyGenerator } from "$generators/Company";
import { CuitGenerator } from "$generators/Cuit";
import { DniGenerator } from "$generators/DNI";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";
import { CompanyUserRepository } from "$models/CompanyUser";

describe("CompanyRepository", () => {
  const companyAttributes = () => ({
    cuit: CuitGenerator.generate(),
    companyName: CompanyGenerator.data.completeData().companyName,
    businessName: CompanyGenerator.data.completeData().businessName
  });

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("Save", () => {
    const expectToUpdateAttribute = async (attributeName: string, value: string | number) => {
      const attributes = {
        cuit: CuitGenerator.generate(),
        companyName: CompanyGenerator.data.completeData().companyName,
        businessName: CompanyGenerator.data.completeData().businessName
      };
      const company = new Company(attributes);
      await CompanyRepository.save(company);
      company.set({ [attributeName]: value });
      await CompanyRepository.save(company);
      const updatedCompany = await CompanyRepository.findByUuid(company.uuid);
      expect(updatedCompany[attributeName]).toEqual(value);
      expect(updatedCompany[attributeName]).not.toEqual(companyAttributes()[attributeName]);
    };

    it("saves a company in the database", async () => {
      const attributes = companyAttributes();
      const company = new Company(attributes);
      await CompanyRepository.save(company);
      const persistedCompany = await CompanyRepository.findByUuid(company.uuid);
      expect(persistedCompany).toBeObjectContaining(attributes);
    });

    it("updates the cuit", async () => {
      await expectToUpdateAttribute("cuit", CuitGenerator.generate());
    });

    it("updates the companyName", async () => {
      await expectToUpdateAttribute("companyName", "newName");
    });

    it("updates the businessName", async () => {
      await expectToUpdateAttribute("businessName", "newBusinessName");
    });

    it("throws an error if cuit is invalid", async () => {
      const company = new Company({ ...companyAttributes(), cuit: "invalidCuit" });
      await expect(CompanyRepository.save(company)).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidCuitError.buildMessage()
      );
    });

    it("throws an error if new company has an already existing cuit", async () => {
      const attributes = companyAttributes();
      const company = new Company(attributes);
      const anotherCompany = new Company(attributes);
      await CompanyRepository.save(company);
      await expect(CompanyRepository.save(anotherCompany)).rejects.toThrow(UniqueConstraintError);
    });

    it("throws an error if cuit is null", async () => {
      const company = new Company({ ...companyAttributes(), cuit: null });
      await expect(CompanyRepository.save(company)).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Company.cuit cannot be null"
      );
    });

    it("throws an error if businessName is null", async () => {
      const company = new Company({ ...companyAttributes(), businessName: null });
      await expect(CompanyRepository.save(company)).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Company.businessName cannot be null"
      );
    });

    it("throws an error if companyName is null", async () => {
      const company = new Company({ ...companyAttributes(), companyName: null });
      await expect(CompanyRepository.save(company)).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Company.companyName cannot be null"
      );
    });

    it("allows to persist a large description", async () => {
      const company = new Company({ ...companyAttributes(), description: "word".repeat(300) });
      await CompanyRepository.save(company);
      await expect(CompanyRepository.save(company)).resolves.not.toThrowError();
    });

    it("allows to persist a logo with more than 255 caracteres", async () => {
      const logo = `data:image/jpeg;base64,/9j/${"4AAQSkZBAAD/4gKgUNDX1BS".repeat(200)}AgICAgIA==`;
      const company = new Company({ ...companyAttributes(), logo });
      await expect(CompanyRepository.save(company)).resolves.not.toThrowError();
    });
  });

  it("throws an error if given an uuid that does not ong to a persisted company", async () => {
    const uuid = UUID.generate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyNotFoundError,
      CompanyNotFoundError.buildMessage(uuid)
    );
  });

  describe("create", () => {
    it("creates a new company", async () => {
      const companyCompleteData = CompanyGenerator.data.completeData();
      const company = await CompanyRepository.create(companyCompleteData);
      expect(company).toEqual(
        expect.objectContaining({
          cuit: companyCompleteData.cuit,
          companyName: companyCompleteData.companyName,
          businessName: companyCompleteData.businessName,
          slogan: companyCompleteData.slogan,
          description: companyCompleteData.description,
          logo: companyCompleteData.logo,
          website: companyCompleteData.website,
          email: companyCompleteData.email
        })
      );
      expect(await company.getPhoneNumbers()).toHaveLength(
        companyCompleteData.phoneNumbers!.length
      );
      expect(await company.getPhotos()).toHaveLength(companyCompleteData.photos!.length);
    });

    it("throws an error if phoneNumbers are invalid", async () => {
      const companyCompleteData = CompanyGenerator.data.completeData();
      await expect(
        CompanyRepository.create({
          ...companyCompleteData,
          phoneNumbers: ["InvalidPhoneNumber1", "InvalidPhoneNumber2"]
        })
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: PhoneNumberWithLettersError.buildMessage()
        },
        {
          errorClass: ValidationError,
          message: PhoneNumberWithLettersError.buildMessage()
        }
      ]);
    });

    it("throws an error if phoneNumbers are duplicated", async () => {
      const companyCompleteData = CompanyGenerator.data.completeData();
      await expect(
        CompanyRepository.create({
          ...companyCompleteData,
          phoneNumbers: ["1159821066", "1159821066"]
        })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("findByUserUuid", () => {
    it("returns the company given a user uuid", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [companyUser] = await CompanyUserRepository.findByCompanyUuid(company.uuid);
      const persistedCompany = await CompanyRepository.findByUserUuid(companyUser.userUuid);
      expect(persistedCompany.uuid).toEqual(company.uuid);
    });

    it("throws an error if the given userUuid is not from a companyUser", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({
        name: "name",
        surname: "surname",
        email: "email@email.com",
        credentials
      });
      await UserRepository.save(user);
      const userUuid = user.uuid!;
      await expect(CompanyRepository.findByUserUuid(userUuid)).rejects.toThrowErrorWithMessage(
        CompanyNotFoundError,
        CompanyNotFoundError.buildMessage()
      );
    });
  });

  describe("findLatest", () => {
    let company1;
    let company2;
    let company3;

    const generateCompanies = async () => {
      return [
        await CompanyGenerator.instance.withMinimumData(),
        await CompanyGenerator.instance.withMinimumData(),
        await CompanyGenerator.instance.withMinimumData()
      ];
    };

    beforeAll(async () => {
      [company1, company2, company3] = await generateCompanies();
    });

    it("returns the latest company first", async () => {
      const companies = await CompanyRepository.findLatest();
      const firstCompanyInList = [companies.results[0], companies.results[1], companies.results[2]];

      expect(companies.shouldFetchMore).toEqual(false);
      expect(firstCompanyInList).toEqual([
        expect.objectContaining({
          uuid: company3.uuid,
          businessName: company3.businessName,
          approvalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          uuid: company2.uuid,
          businessName: company2.businessName,
          approvalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          uuid: company1.uuid,
          businessName: company1.businessName,
          approvalStatus: ApprovalStatus.pending
        })
      ]);
    });

    describe("fetchMore", () => {
      let company4;
      let company5;
      let company6;
      let company7;

      beforeAll(async () => {
        [company4, company5, company6] = await generateCompanies();
        [company7, ,] = await generateCompanies();
      });

      it("gets the next 3 companies", async () => {
        const itemsPerPage = 3;
        mockItemsPerPage(itemsPerPage);

        const updatedBeforeThan = {
          dateTime: company7.updatedAt,
          uuid: company7.uuid
        };

        const companies = await CompanyRepository.findLatest(updatedBeforeThan);
        expect(companies.results).toEqual([
          expect.objectContaining({
            uuid: company6.uuid,
            businessName: company6.businessName,
            approvalStatus: ApprovalStatus.pending
          }),
          expect.objectContaining({
            uuid: company5.uuid,
            businessName: company5.businessName,
            approvalStatus: ApprovalStatus.pending
          }),
          expect.objectContaining({
            uuid: company4.uuid,
            businessName: company4.businessName,
            approvalStatus: ApprovalStatus.pending
          })
        ]);
        expect(companies.shouldFetchMore).toBe(true);
      });
    });
  });

  it("deletes the companies table", async () => {
    await CompanyRepository.truncate();
    await CompanyRepository.save(new Company(companyAttributes()));
    await CompanyRepository.save(new Company(companyAttributes()));
    expect(await CompanyRepository.findAll()).toHaveLength(2);
    await CompanyRepository.truncate();
    expect(await CompanyRepository.findAll()).toHaveLength(0);
  });
});
