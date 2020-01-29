import { CompanyProfile } from "../../../src/models/CompanyProfile";
import Database from "../../../src/config/Database";

const createDevartisProfile = () => {
  return new CompanyProfile({
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  });
};

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
  const companyProfile: CompanyProfile = createDevartisProfile();
  expect(companyProfile).not.toBeNull();
  expect(companyProfile).not.toBeUndefined();
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
    cuit: "30-71181901-7",
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
