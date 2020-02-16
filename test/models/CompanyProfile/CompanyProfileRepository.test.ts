import { Company, CompanyProfileRepository } from "../../../src/models/Company";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";
import { companyProfileMockData, phoneNumbers, photos } from "./CompanyProfileMockData";
import Database from "../../../src/config/Database";

describe("CompanyProfileRepository", () => {
  const companyProfileCompleteData = {
    ...companyProfileMockData,
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
    await CompanyProfileRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a new company", async () => {
    const company: Company = await CompanyProfileRepository.create(
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
    await expect(CompanyProfileRepository.save(company)).rejects.toThrow();
  });

  it("raise an error if cuit is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null
    });
    await expect(CompanyProfileRepository.save(company)).rejects.toThrow();
  });

  it("retrieve by id", async () => {
    const company: Company = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const expectedCompanyProfile = await CompanyProfileRepository.findById(company.id);
    expect(expectedCompanyProfile).not.toBeNull();
    expect(expectedCompanyProfile).not.toBeUndefined();
    expect(expectedCompanyProfile!.id).toEqual(company.id);
  });


  it("retrieve all CompanyProfiles", async () => {
    const company: Company = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(1);
    expect(expectedCompanyProfiles[0].id).toEqual(company.id);
  });

  it("rollback transaction and raise error if photo is null", async () => {
    const company: Company = new Company(companyProfileDataWithMinimumData);
    const photo: CompanyProfilePhoto = new CompanyProfilePhoto({ photo: null });
    await expect(CompanyProfileRepository.save(
      company, [],[photo]
    )).rejects.toThrow();

    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("rollback transaction and raise error if phoneNumber is null", async () => {
    const company: Company = new Company(companyProfileDataWithMinimumData);
    const phoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber(
      { phoneNumber: null }
    );
    await expect(CompanyProfileRepository.save(
      company, [phoneNumber]
    )).rejects.toThrow();
    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("deletes a companyProfile", async () => {
    const company: Company = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const id: number = company.id;
    expect(await CompanyProfileRepository.findById(id)).not.toBeNull();
    await CompanyProfileRepository.truncate();
    await expect(CompanyProfileRepository.findById(id)).rejects.toThrow();
  });
});
