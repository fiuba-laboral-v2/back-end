import { Company, CompanyRepository } from "../../../src/models/Company";
import { CompanyPhoneNumber } from "../../../src/models/CompanyPhoneNumber";
import { CompanyPhoto } from "../../../src/models/CompanyPhoto";
import { companyMockData, phoneNumbers, photos } from "./mocks";
import Database from "../../../src/config/Database";

describe("CompanyRepository", () => {
  const companyProfileCompleteData = {
    ...companyMockData,
    ...{ photos: photos, phoneNumbers: phoneNumbers }
  };

  const companyProfileDataWithMinimumData = {
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
      companyProfileCompleteData
    );
    expect(company).toEqual(expect.objectContaining({
      cuit: companyProfileCompleteData.cuit,
      companyName: companyProfileCompleteData.companyName,
      slogan: companyProfileCompleteData.slogan,
      description: companyProfileCompleteData.description,
      logo: companyProfileCompleteData.logo,
      website: companyProfileCompleteData.website,
      email: companyProfileCompleteData.email
    }));
    expect(company.phoneNumbers).toHaveLength(
      companyProfileCompleteData.phoneNumbers.length
    );
    expect(company.photos).toHaveLength(
      companyProfileCompleteData.photos.length
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
      companyProfileCompleteData
    );
    const expectedCompanyProfile = await CompanyRepository.findById(company.id);
    expect(expectedCompanyProfile).not.toBeNull();
    expect(expectedCompanyProfile).not.toBeUndefined();
    expect(expectedCompanyProfile!.id).toEqual(company.id);
  });


  it("retrieve all CompanyProfiles", async () => {
    const company: Company = await CompanyRepository.create(
      companyProfileCompleteData
    );
    const expectedCompanyProfiles = await CompanyRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(1);
    expect(expectedCompanyProfiles[0].id).toEqual(company.id);
  });

  it("rollback transaction and raise error if photo is null", async () => {
    const company: Company = new Company(companyProfileDataWithMinimumData);
    const photo: CompanyPhoto = new CompanyPhoto({ photo: null });
    await expect(CompanyRepository.save(
      company, [],[photo]
    )).rejects.toThrow();

    const expectedCompanyProfiles = await CompanyRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("rollback transaction and raise error if phoneNumber is null", async () => {
    const company: Company = new Company(companyProfileDataWithMinimumData);
    const phoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber(
      { phoneNumber: null }
    );
    await expect(CompanyRepository.save(
      company, [phoneNumber]
    )).rejects.toThrow();
    const expectedCompanyProfiles = await CompanyRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("deletes a companyProfile", async () => {
    const company: Company = await CompanyRepository.create(
      companyProfileCompleteData
    );
    const id: number = company.id;
    expect(await CompanyRepository.findById(id)).not.toBeNull();
    await CompanyRepository.truncate();
    await expect(CompanyRepository.findById(id)).rejects.toThrow();
  });
});
