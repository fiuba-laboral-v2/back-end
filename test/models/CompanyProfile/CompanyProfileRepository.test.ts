import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/CompanyProfile";
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
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  });
  const createdCompanyProfile: CompanyProfile = await CompanyProfileRepository.save(companyProfile);
  expect(createdCompanyProfile.cuit).toEqual(companyProfile.cuit);
  expect(createdCompanyProfile.companyName).toEqual(companyProfile.companyName);
  expect(createdCompanyProfile.slogan).toEqual(companyProfile.slogan);
  expect(createdCompanyProfile.description).toEqual(companyProfile.description);
  expect(createdCompanyProfile.logo).toEqual(companyProfile.logo);
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
