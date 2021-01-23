import { UniqueConstraintError, ValidationError } from "sequelize";
import { InvalidCuitError } from "validations-fiuba-laboral-v2";
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
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("CompanyRepository", () => {
  const companyAttributes = () => ({
    cuit: CuitGenerator.generate(),
    companyName: CompanyGenerator.data.completeData().companyName,
    businessName: CompanyGenerator.data.completeData().businessName,
    businessSector: CompanyGenerator.data.completeData().businessSector,
    hasAnInternshipAgreement: CompanyGenerator.data.completeData().hasAnInternshipAgreement
  });

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  describe("Save", () => {
    const expectToUpdateAttribute = async (attributeName: string, value: string | number) => {
      const attributes = companyAttributes();
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

  it("throws an error if given an uuid that does not belong to a persisted company", async () => {
    const uuid = UUID.generate();
    await expect(CompanyRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyNotFoundError,
      CompanyNotFoundError.buildMessage(uuid)
    );
  });

  describe("countCompanies", () => {
    beforeAll(async () => {
      await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.approved);
      await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.approved);
      await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.pending);
      await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.rejected);
    });

    it("returns the amount of approved companies", async () => {
      const amountOfCompanies = await CompanyRepository.countCompanies();

      expect(amountOfCompanies).toEqual(2);
    });
  });

  describe("findByUserUuidIfExists", () => {
    it("returns the company given a user uuid", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const [companyUser] = await CompanyUserRepository.findByCompanyUuid(company.uuid);
      const persistedCompany = await CompanyRepository.findByUserUuidIfExists(companyUser.userUuid);
      expect(persistedCompany?.uuid).toEqual(company.uuid);
    });

    it("returns null if the given userUuid is not from a companyUser", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({
        name: "name",
        surname: "surname",
        email: "email@email.com",
        credentials
      });
      await UserRepository.save(user);
      const userUuid = user.uuid!;
      const persistedCompany = await CompanyRepository.findByUserUuidIfExists(userUuid);
      expect(persistedCompany).toBeNull();
    });
  });

  describe("findLatest", () => {
    let devartis;
    let mercadoLibre;
    let despegar;

    const generateCompanies = async () => {
      const generator = CompanyGenerator.instance.withMinimumData;
      return [
        await generator({ companyName: "Devartis", businessSector: "Servicios" }),
        await generator({ companyName: "Mercado Libre", businessSector: "Ventas" }),
        await generator({ companyName: "Despegar", businessSector: "Viajes" })
      ];
    };

    beforeAll(async () => {
      [devartis, mercadoLibre, despegar] = await generateCompanies();
    });

    it("returns the latest company first", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest();
      const companies = [results[0], results[1], results[2]];
      const companyUuids = companies.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([despegar.uuid, mercadoLibre.uuid, devartis.uuid]);
    });

    it("returns companies by name", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        companyName: "Devartis"
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([devartis.uuid]);
    });

    it("returns companies by name with newline characters, spaces and capital letters", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        companyName: "         MERCADÓ\n\n\n   LÍBRÉ                "
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([mercadoLibre.uuid]);
    });

    it("returns companies by businessSector", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        businessSector: "viajes"
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([despegar.uuid]);
    });

    it("returns companies by businessSector with newline characters, spaces and capital letters", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        businessSector: "         SerViCioS\n\n\n     "
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([devartis.uuid]);
    });

    it("returns companies by businessSector and name with newline characters, spaces and capital letters", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        businessSector: "         vENtÁs\n\n\n     ",
        companyName: "         MERCADÓ\n\n\n   LÍBRÉ                "
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([mercadoLibre.uuid]);
    });

    it("returns no companies if the given companyName does not hve the given businessSector", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        businessSector: "viajes",
        companyName: "devartis"
      });
      const companyUuids = results.map(({ uuid }) => uuid);
      expect(shouldFetchMore).toEqual(false);
      expect(companyUuids).toEqual([]);
    });

    it("returns all companies if companyName and businessSector are empty strings", async () => {
      const { shouldFetchMore, results } = await CompanyRepository.findLatest({
        businessSector: "",
        companyName: ""
      });
      const allCompanies = await CompanyRepository.findAll();
      expect(shouldFetchMore).toEqual(false);
      expect(results).toHaveLength(allCompanies.length);
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
        const updatedBeforeThan = { dateTime: company7.updatedAt, uuid: company7.uuid };
        const companies = await CompanyRepository.findLatest({ updatedBeforeThan });
        expect(companies.results.map(({ uuid }) => uuid)).toEqual([
          company6.uuid,
          company5.uuid,
          company4.uuid
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
