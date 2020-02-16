import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/Company";
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

  it("create a new companyProfile", async () => {
    const companyProfile: CompanyProfile = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    expect(companyProfile).toEqual(expect.objectContaining({
      cuit: companyProfileCompleteData.cuit,
      companyName: companyProfileCompleteData.companyName,
      slogan: companyProfileCompleteData.slogan,
      description: companyProfileCompleteData.description,
      logo: companyProfileCompleteData.logo,
      website: companyProfileCompleteData.website,
      email: companyProfileCompleteData.email
    }));
    expect(companyProfile.phoneNumbers).toHaveLength(
      companyProfileCompleteData.phoneNumbers.length
    );
    expect(companyProfile.photos).toHaveLength(
      companyProfileCompleteData.photos.length
    );
  });

  it("raise an error if cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: null,
      companyName: "devartis"
    });
    await expect(CompanyProfileRepository.save(companyProfile)).rejects.toThrow();
  });

  it("raise an error if cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "30711819017",
      companyName: null
    });
    await expect(CompanyProfileRepository.save(companyProfile)).rejects.toThrow();
  });

  it("retrieve by id", async () => {
    const companyProfile: CompanyProfile = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const expectedCompanyProfile = await CompanyProfileRepository.findById(companyProfile.id);
    expect(expectedCompanyProfile).not.toBeNull();
    expect(expectedCompanyProfile).not.toBeUndefined();
    expect(expectedCompanyProfile!.id).toEqual(companyProfile.id);
  });


  it("retrieve all CompanyProfiles", async () => {
    const companyProfile: CompanyProfile = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(1);
    expect(expectedCompanyProfiles[0].id).toEqual(companyProfile.id);
  });

  it("rollback transaction and raise error if photo is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileDataWithMinimumData);
    const photo: CompanyProfilePhoto = new CompanyProfilePhoto({ photo: null });
    await expect(CompanyProfileRepository.save(
      companyProfile, [],[photo]
    )).rejects.toThrow();

    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("rollback transaction and raise error if phoneNumber is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileDataWithMinimumData);
    const phoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber(
      { phoneNumber: null }
    );
    await expect(CompanyProfileRepository.save(
      companyProfile, [phoneNumber]
    )).rejects.toThrow();
    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  it("deletes a companyProfile", async () => {
    const companyProfile: CompanyProfile = await CompanyProfileRepository.create(
      companyProfileCompleteData
    );
    const id: number = companyProfile.id;
    expect(await CompanyProfileRepository.findById(id)).not.toBeNull();
    await CompanyProfileRepository.truncate();
    await expect(CompanyProfileRepository.findById(id)).rejects.toThrow();
  });
});
