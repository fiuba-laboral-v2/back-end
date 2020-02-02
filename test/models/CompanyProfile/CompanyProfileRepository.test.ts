import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/CompanyProfile";
import {
  CompanyProfilePhoneNumber,
  CompanyProfilePhoneNumberRepository
} from "../../../src/models/CompanyProfilePhoneNumber";
import {
  CompanyProfilePhoto,
  CompanyProfilePhotoRepository
} from "../../../src/models/CompanyProfilePhoto";
import Database from "../../../src/config/Database";

describe("CompanyProfileRepository", () => {

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyProfileRepository.truncate();
  });

  afterAll(async () => {
    await Database.close();
  });

  test("create a new companyProfile", async () => {
    const companyProfileData = {
      cuit: "30711819017",
      companyName: "devartis",
      slogan: "We craft web applications for great businesses",
      description: "some description",
      logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
    };
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileData);
    const phoneNumbers: CompanyProfilePhoneNumber[] = CompanyProfilePhoneNumberRepository.build(
      [
        43076555,
        43076556,
        43076455,
        43076599
      ]
    );
    const photos: CompanyProfilePhoto[] = CompanyProfilePhotoRepository.build(
      [
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
      ]
    );
    await CompanyProfileRepository.save(companyProfile, phoneNumbers, photos);

    expect(companyProfile.cuit).toEqual(companyProfileData.cuit);
    expect(companyProfile.companyName).toEqual(companyProfileData.companyName);
    expect(companyProfile.slogan).toEqual(companyProfileData.slogan);
    expect(companyProfile.description).toEqual(companyProfileData.description);
    expect(companyProfile.logo).toEqual(companyProfileData.logo);
    expect(companyProfile.phoneNumbers).toHaveLength(phoneNumbers.length);
    expect(companyProfile.photos).toHaveLength(photos.length);
  });

  test("raise an error if cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: null,
      companyName: "devartis"
    });
    await expect(CompanyProfileRepository.save(companyProfile)).rejects.toThrow();
  });

  test("raise an error if cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "30711819017",
      companyName: null
    });
    await expect(CompanyProfileRepository.save(companyProfile)).rejects.toThrow();
  });

  test("retrieve by id", async () => {
    const companyProfileData = {
      cuit: "30711819017",
      companyName: "devartis",
      slogan: "We craft web applications for great businesses",
      description: "some description",
      logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
    };
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileData);
    const phoneNumbers: CompanyProfilePhoneNumber[] = CompanyProfilePhoneNumberRepository.build(
      [
        43076555,
        43076556,
        43076455,
        43076599
      ]
    );
    const photos: CompanyProfilePhoto[] = CompanyProfilePhotoRepository.build(
      [
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38G
      IAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38G
      IAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
      ]
    );
    await CompanyProfileRepository.save(companyProfile, phoneNumbers, photos);

    const expectedCompanyProfile = await CompanyProfileRepository.findById(companyProfile.id);
    expect(expectedCompanyProfile).not.toBeNull();
    expect(expectedCompanyProfile).not.toBeUndefined();
    expect(expectedCompanyProfile!.id).toEqual(companyProfile.id);
  });


  test("retrieve all CompanyProfiles", async () => {
    const companyProfileData = {
      cuit: "30711819017",
      companyName: "devartis",
      slogan: "We craft web applications for great businesses",
      description: "some description",
      logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
    };
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileData);
    const phoneNumbers: CompanyProfilePhoneNumber[] = CompanyProfilePhoneNumberRepository.build(
      [
        43076555,
        43076556,
        43076455,
        43076599
      ]
    );
    const photos: CompanyProfilePhoto[] = CompanyProfilePhotoRepository.build(
      [
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38G
      IAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
        `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38G
      IAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
      ]
    );
    await CompanyProfileRepository.save(companyProfile, phoneNumbers, photos);

    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(1);
    expect(expectedCompanyProfiles[0].id).toEqual(companyProfile.id);
  });

  test("rollback transaction and raise error if photo is null", async () => {
    const companyProfileData = {
      cuit: "30711819017",
      companyName: "devartis",
      slogan: "We craft web applications for great businesses",
      description: "some description",
      logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
    };
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileData);
    const photo: CompanyProfilePhoto = new CompanyProfilePhoto({ photo: null });
    await expect(CompanyProfileRepository.save(
      companyProfile, [],[photo]
    )).rejects.toThrow();

    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

  test("rollback transaction and raise error if phoneNumber is null", async () => {
    const companyProfileData = {
      cuit: "30711819017",
      companyName: "devartis",
      slogan: "We craft web applications for great businesses",
      description: "some description",
      logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
    };
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileData);
    const phoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber(
      {
        phoneNumber: null
      }
    );
    await expect(CompanyProfileRepository.save(
      companyProfile, [phoneNumber]
    )).rejects.toThrow();

    const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
    expect(expectedCompanyProfiles).not.toBeNull();
    expect(expectedCompanyProfiles).not.toBeUndefined();
    expect(expectedCompanyProfiles!.length).toEqual(0);
  });

});
