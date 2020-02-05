import { CompanyProfile } from "../../../src/models/CompanyProfile";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import Database from "../../../src/config/Database";

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyProfile.destroy({ truncate: true });
});

afterAll(async () => {
  await Database.close();
});

test("create a valid profile", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "30711819017",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  });
  const companyProfilePhoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
    phoneNumber: 43076555,
    companyProfileId: 1
  });
  companyProfile.phoneNumbers = [ companyProfilePhoneNumber ];
  expect(companyProfile).not.toBeNull();
  expect(companyProfile).not.toBeUndefined();
  expect(companyProfile.phoneNumbers).not.toBeUndefined();
  expect(companyProfile.phoneNumbers).not.toBeNull();
  expect(companyProfile.phoneNumbers).toHaveLength(1);
});

test("raise an error if cuit is null", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: null,
    companyName: "devartis"
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if companyName is null", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "30711819017",
    companyName: null
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if companyName and cuit is null", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: null,
    companyName: null
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if cuit has less than eleven digits", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "30",
    companyName: "devartis"
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if cuit has more than eleven digits", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "3057341761199",
    companyName: "devartis"
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if name is empty", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "3057341761199",
    companyName: ""
  });
  await expect(companyProfile.save()).rejects.toThrow();
});

test("raise an error if name has digits", async () => {
  const companyProfile: CompanyProfile = new CompanyProfile({
    cuit: "3057341761199",
    companyName: "Google34"
  });
  await expect(companyProfile.save()).rejects.toThrow();
});
