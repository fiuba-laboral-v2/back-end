import { CompanyProfile } from "../../../src/models/CompanyProfile";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";
import Database from "../../../src/config/Database";


describe("CompanyProfile", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyProfile.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  const companyProfileCompleteData = {
    cuit: "30711819017",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg",
    website: "https://www.devartis.com/",
    email: "info@devartis.com"
  };

  it("create a valid profile", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileCompleteData);
    const phoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
      phoneNumber: 43076555,
      companyProfileId: 1
    });
    const photo: CompanyProfilePhoto = new CompanyProfilePhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//
        8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
      companyProfileId: 1
    });
    companyProfile.phoneNumbers = [ phoneNumber ];
    companyProfile.photos = [ photo ];
    await companyProfile.save();
    expect(companyProfile).not.toBeNull();
    expect(companyProfile).not.toBeUndefined();
    expect(companyProfile.phoneNumbers).not.toBeUndefined();
    expect(companyProfile.phoneNumbers).not.toBeNull();
    expect(companyProfile.phoneNumbers).toHaveLength(1);
    expect(companyProfile.photos).not.toBeUndefined();
    expect(companyProfile.photos).not.toBeNull();
    expect(companyProfile.photos).toHaveLength(1);
    expect(companyProfile.id).toBeGreaterThan(0);
    expect(companyProfile.cuit).toBe(companyProfileCompleteData.cuit);
    expect(companyProfile.companyName).toBe(companyProfileCompleteData.companyName);
    expect(companyProfile.slogan).toBe(companyProfileCompleteData.slogan);
    expect(companyProfile.description).toBe(companyProfileCompleteData.description);
    expect(companyProfile.logo).toBe(companyProfileCompleteData.logo);
    expect(companyProfile.website).toBe(companyProfileCompleteData.website);
    expect(companyProfile.email).toBe(companyProfileCompleteData.email);
  });

  it("raise an error if cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: null,
      companyName: "devartis"
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if companyName is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "30711819017",
      companyName: null
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if companyName and cuit is null", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: null,
      companyName: null
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if cuit has less than eleven digits", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "30",
      companyName: "devartis"
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if cuit has more than eleven digits", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "3057341761199",
      companyName: "devartis"
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if name is empty", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "3057341761199",
      companyName: ""
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });

  it("raise an error if name has digits", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "3057341761199",
      companyName: "Google34"
    });
    await expect(companyProfile.save()).rejects.toThrow();
  });
});
