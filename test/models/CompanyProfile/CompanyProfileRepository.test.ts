import { CompanyProfile, CompanyProfileRepository } from "../../../src/models/CompanyProfile";
import { CompanyProfileMock } from "./CompanyProfileMock";
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
  const companyProfileMock = CompanyProfileMock();
  let companyProfile: CompanyProfile = new CompanyProfile(companyProfileMock);
  companyProfile = await CompanyProfileRepository.save(companyProfile);
  expect(companyProfile.cuit).toEqual(companyProfileMock.cuit);
  expect(companyProfile.companyName).toEqual(companyProfileMock.companyName);
  expect(companyProfile.slogan).toEqual(companyProfileMock.slogan);
  expect(companyProfile.description).toEqual(companyProfileMock.description);
  expect(companyProfile.logo).toEqual(companyProfileMock.logo);
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
