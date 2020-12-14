import { UniqueConstraintError, ValidationError } from "sequelize";
import { InvalidCuitError, PhoneNumberWithLettersError } from "validations-fiuba-laboral-v2";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { CompanyGenerator } from "$generators/Company";
import { mockItemsPerPage } from "$test/mocks/config/PaginationConfig";

describe("CompanyRepository", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

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
    expect(await company.getPhoneNumbers()).toHaveLength(companyCompleteData.phoneNumbers!.length);
    expect(await company.getPhotos()).toHaveLength(companyCompleteData.photos!.length);
  });

  it("creates a company in a pending approval status as default", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyCompleteData);
    expect(company.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid company with a logo with more than 255 characters", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create({
      ...companyCompleteData,
      logo: `data:image/jpeg;base64,/9j/${"4AAQSkZBAAD/4gKgUNDX1BS".repeat(200)}AgICAgIA==`
    });
    expect(company.logo.length).toEqual(4637);
  });

  it("should create a valid company with a large description", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    await expect(
      CompanyRepository.create({
        ...companyCompleteData,
        description: "word".repeat(300)
      })
    ).resolves.not.toThrow();
  });

  it("throws an error if new company has an already existing cuit", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    const cuit = companyCompleteData.cuit;
    const businessName = companyCompleteData.businessName;
    await CompanyRepository.create(companyCompleteData);
    await expect(
      CompanyRepository.create({
        cuit,
        companyName: "Devartis Clone SA",
        businessName,
        user: CompanyGenerator.data.completeData().user
      })
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("throws an error if cuit is null", async () => {
    await expect(
      CompanyRepository.create({
        ...CompanyGenerator.data.completeData(),
        cuit: null as any
      })
    ).rejects.toThrow(ValidationError);
  });

  it("throws an error if businessName is null", async () => {
    await expect(
      CompanyRepository.create({
        ...CompanyGenerator.data.completeData(),
        businessName: null as any
      })
    ).rejects.toThrow(ValidationError);
  });

  it("throws an error if companyName is null", async () => {
    await expect(
      CompanyRepository.create({
        ...CompanyGenerator.data.completeData(),
        companyName: null as any
      })
    ).rejects.toThrow(ValidationError);
  });

  it("retrieve by uuid", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyCompleteData);
    const expectedCompany = await CompanyRepository.findByUuid(company.uuid);
    expect(expectedCompany).not.toBeNull();
    expect(expectedCompany).not.toBeUndefined();
    expect(expectedCompany.uuid).toEqual(company.uuid);
    expect(await expectedCompany.getPhotos()).toHaveLength((await company.getPhotos()).length);
    expect(await expectedCompany.getPhoneNumbers()).toHaveLength(
      (await company.getPhoneNumbers()).length
    );
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

  it("deletes a company", async () => {
    const companyCompleteData = CompanyGenerator.data.completeData();
    const { uuid } = await CompanyRepository.create(companyCompleteData);
    expect(await CompanyRepository.findByUuid(uuid)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrow();
  });

  describe("Update", () => {
    it("updates only company attributes", async () => {
      const companyCompleteData = CompanyGenerator.data.completeData();
      const { uuid } = await CompanyRepository.create(companyCompleteData);
      const dataToUpdate = {
        cuit: "30711311773",
        companyName: "Devartis SA",
        businessName: "entre ca S.A.",
        slogan: "new slogan",
        description: "new description",
        logo: "",
        website: "http://www.new-site.com",
        email: "old@devartis.com"
      };
      const company = await CompanyRepository.update({ uuid, ...dataToUpdate });
      expect(company).toMatchObject(dataToUpdate);
    });

    it("throws an error if cuit is invalid", async () => {
      const companyCompleteData = CompanyGenerator.data.completeData();
      const { uuid } = await CompanyRepository.create(companyCompleteData);
      await expect(
        CompanyRepository.update({ uuid, cuit: "invalidCuit" })
      ).rejects.toThrowErrorWithMessage(ValidationError, InvalidCuitError.buildMessage());
    });
  });
});
