import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/CompanyProfile";
import { CompanyProfilePhoneNumberRepository } from "../../../src/models/CompanyProfilePhoneNumber";
import Database from "../../../src/config/Database";

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
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  };
  const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
    new CompanyProfile(companyProfileData)
  );
  const phoneNumbers = [43076555, 43076555];
  companyProfile.phoneNumbers = await CompanyProfilePhoneNumberRepository.createPhoneNumbers(
    companyProfile, phoneNumbers
  );
  expect(companyProfile.cuit).toEqual(companyProfileData.cuit);
  expect(companyProfile.companyName).toEqual(companyProfileData.companyName);
  expect(companyProfile.slogan).toEqual(companyProfileData.slogan);
  expect(companyProfile.description).toEqual(companyProfileData.description);
  expect(companyProfile.logo).toEqual(companyProfileData.logo);
  expect(companyProfile.phoneNumbers).toHaveLength(phoneNumbers.length);
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
    cuit: "30-71181901-7",
    companyName: null
  });
  await expect(CompanyProfileRepository.save(companyProfile)).rejects.toThrow();
});

test("retrieve by id", async () => {
  const companyProfileData = {
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  };
  const phoneNumbers = [
    43076555,
    43076556,
    43076455,
    43076599
  ];
  const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
    new CompanyProfile(companyProfileData)
  );
  companyProfile.phoneNumbers = await CompanyProfilePhoneNumberRepository.createPhoneNumbers(
    companyProfile, phoneNumbers
  );
  await CompanyProfileRepository.save(companyProfile);
  const expectedCompanyProfile = await CompanyProfileRepository.findById(companyProfile.id);
  expect(expectedCompanyProfile).not.toBeNull();
  expect(expectedCompanyProfile).not.toBeUndefined();
  expect(expectedCompanyProfile!.id).toEqual(companyProfile.id);
});


test("retrieve all CompanyProfiles", async () => {
  const companyProfileData = {
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  };
  const phoneNumbers = [
    43076555,
    43076556,
    43076455,
    43076599
  ];
  const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
    new CompanyProfile(companyProfileData)
  );
  companyProfile.phoneNumbers = await CompanyProfilePhoneNumberRepository.createPhoneNumbers(
    companyProfile, phoneNumbers
  );
  await CompanyProfileRepository.save(companyProfile);
  const expectedCompanyProfiles = await CompanyProfileRepository.findAll();
  expect(expectedCompanyProfiles).not.toBeNull();
  expect(expectedCompanyProfiles).not.toBeUndefined();
  expect(expectedCompanyProfiles!.length).toEqual(1);
  expect(expectedCompanyProfiles[0].id).toEqual(companyProfile.id);
});
