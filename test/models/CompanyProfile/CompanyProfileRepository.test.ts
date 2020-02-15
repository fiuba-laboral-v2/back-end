import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/CompanyProfile";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";
import Database from "../../../src/config/Database";

describe("CompanyProfileRepository", () => {
  const companyProfileData = {
    cuit: "30711819017",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
          8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
    website: "https://www.devartis.com/",
    email: "info@devartis.com",
    phoneNumbers: [
      43076555,
      43076556,
      43076455,
      43076599
    ],
    photos: [
      `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
      `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
    ]
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
      companyProfileData
    );
    expect(companyProfile).toEqual(expect.objectContaining({
      cuit: companyProfileData.cuit,
      companyName: companyProfileData.companyName,
      slogan: companyProfileData.slogan,
      description: companyProfileData.description,
      logo: companyProfileData.logo,
      website: companyProfileData.website,
      email: companyProfileData.email
    }));
    expect(companyProfile.phoneNumbers).toHaveLength(companyProfileData.phoneNumbers.length);
    expect(companyProfile.photos).toHaveLength(companyProfileData.photos.length);
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
      companyProfileData
    );
    const expectedCompanyProfile = await CompanyProfileRepository.findById(companyProfile.id);
    expect(expectedCompanyProfile).not.toBeNull();
    expect(expectedCompanyProfile).not.toBeUndefined();
    expect(expectedCompanyProfile!.id).toEqual(companyProfile.id);
  });


  it("retrieve all CompanyProfiles", async () => {
    const companyProfile: CompanyProfile = await CompanyProfileRepository.create(
      companyProfileData
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
      companyProfileData
    );
    const id: number = companyProfile.id;
    expect(await CompanyProfileRepository.findById(id)).not.toBeNull();
    await CompanyProfileRepository.truncate();
    await expect(CompanyProfileRepository.findById(id)).rejects.toThrow();
  });
});
