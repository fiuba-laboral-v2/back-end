import { Company, CompanyRepository } from "../../../src/models/Company";
import { CompanyPhoneNumber } from "../../../src/models/CompanyPhoneNumber";
import { CompanyPhoto } from "../../../src/models/CompanyPhoto";
import { companyMockData, phoneNumbers, photos } from "./mocks";
import Database from "../../../src/config/Database";

describe("CompanyRepository", () => {
  const companyCompleteData = {
    ...companyMockData,
    ...{ photos: photos, phoneNumbers: phoneNumbers }
  };

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

  it("create a new company", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    expect(company).toEqual(expect.objectContaining({
      cuit: companyCompleteData.cuit,
      companyName: companyCompleteData.companyName,
      slogan: companyCompleteData.slogan,
      description: companyCompleteData.description,
      logo: companyCompleteData.logo,
      website: companyCompleteData.website,
      email: companyCompleteData.email
    }));
    expect(company.phoneNumbers).toHaveLength(
      companyCompleteData.phoneNumbers.length
    );
    expect(company.photos).toHaveLength(
      companyCompleteData.photos.length
    );
  });

  it("raise an error if cuit is null", async () => {
    const company: Company = new Company({
      cuit: null,
      companyName: "devartis"
    });
    await expect(CompanyRepository.save(company)).rejects.toThrow();
  });

  it("raise an error if cuit is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null
    });
    await expect(CompanyRepository.save(company)).rejects.toThrow();
  });

  it("retrieve by id", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    const expectedCompany = await CompanyRepository.findById(company.id);
    expect(expectedCompany).not.toBeNull();
    expect(expectedCompany).not.toBeUndefined();
    expect(expectedCompany!.id).toEqual(company.id);
    expect(expectedCompany!.photos).toHaveLength(company.photos.length);
    expect(expectedCompany!.phoneNumbers).toHaveLength(company.phoneNumbers.length);
  });


  it("retrieve all Companies", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    const expectedCompanies = await CompanyRepository.findAll();
    expect(expectedCompanies).not.toBeNull();
    expect(expectedCompanies).not.toBeUndefined();
    expect(expectedCompanies!.length).toEqual(1);
    expect(expectedCompanies[0].id).toEqual(company.id);
  });

  it("rollback transaction and raise error if photo is null", async () => {
    const company: Company = new Company(companyDataWithMinimumData);
    const photo: CompanyPhoto = new CompanyPhoto({ photo: null });
    await expect(CompanyRepository.save(
      company, [],[photo]
    )).rejects.toThrow();

    const expectedCompanies = await CompanyRepository.findAll();
    expect(expectedCompanies).not.toBeNull();
    expect(expectedCompanies).not.toBeUndefined();
    expect(expectedCompanies!.length).toEqual(0);
  });

  it("rollback transaction and raise error if phoneNumber is null", async () => {
    const company: Company = new Company(companyDataWithMinimumData);
    const phoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber(
      { phoneNumber: null }
    );
    await expect(CompanyRepository.save(
      company, [phoneNumber]
    )).rejects.toThrow();
    const expectedCompanies = await CompanyRepository.findAll();
    expect(expectedCompanies).not.toBeNull();
    expect(expectedCompanies).not.toBeUndefined();
    expect(expectedCompanies!.length).toEqual(0);
  });

  it("deletes a company", async () => {
    const company: Company = await CompanyRepository.create(
      companyCompleteData
    );
    const id: number = company.id;
    expect(await CompanyRepository.findById(id)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findById(id)).rejects.toThrow();
  });
});
