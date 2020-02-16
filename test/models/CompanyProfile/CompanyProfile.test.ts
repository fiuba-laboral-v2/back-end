import { CompanyProfile } from "../../../src/models/CompanyProfile";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";
import { companyProfileMockData } from "./CompanyProfileMockData";
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

  it("create a valid profile", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile(companyProfileMockData);
    const phoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
      phoneNumber: 43076555,
      companyProfileId: 1
    });
    const photo: CompanyProfilePhoto = new CompanyProfilePhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACN
              byblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAAB
              JRU5ErkJggg==`,
      companyProfileId: 1
    });
    companyProfile.phoneNumbers = [ phoneNumber ];
    companyProfile.photos = [ photo ];
    await companyProfile.save();
    expect(companyProfile.phoneNumbers).toHaveLength(1);
    expect(companyProfile.photos).toHaveLength(1);
    expect(companyProfile.id).toBeGreaterThan(0);
    expect(companyProfile).toEqual(expect.objectContaining({
      cuit: companyProfileMockData.cuit,
      companyName: companyProfileMockData.companyName,
      slogan: companyProfileMockData.slogan,
      description: companyProfileMockData.description,
      logo: companyProfileMockData.logo,
      website: companyProfileMockData.website,
      email: companyProfileMockData.email
    }));
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

  it("creates a valid profile with a logo with more than 255 characters", async () => {
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit: "30711819017",
      companyName: "devartis",
      logo: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gKgSUNDX1BS
            T0ZJTEUAAQEAAAKQbGNtcwQwAABtbnRyUkdCIFhZWiAH4gAJAAsADgACABBhY3Nw
            QVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAA
            AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAtkZXNj
            AAABCAAAADhjcHJ0AAABQAAAAE53dHB0AAABkAAAABRjaGFkAAABpAAAACxyWFla
            AAAB0AAAABRiWFlaAAAB5AAAABRnWFlaAAAB+AAAABRyVFJDAAACDAAAACBnVFJD
            AAACLAAAACBiVFJDAAACTAAAACBjaHJtAAACbAAAACRtbHVjAAAAAAAAAAEAAAAM
            ZW5VUwAAABwAAAAcAHMAUgBHAEIAIABiAHUAaQBsAHQALQBpAG4AAG1sdWMAAAAA
            AAAAAQAAAAxlblVTAAAAMgAAABwATgBvACAAYwBvAHAAeQByAGkAZwBoAHQALAAg
            AHUAcwBlACAAZgByAGUAZQBsAHkAAAAAWFlaIAAAAAAAAPbWAAEAAAAA0y1zZjMy
            AAAAAAABDEoAAAXj///zKgAAB5sAAP2H///7ov///aMAAAPYAADAlFhZWiAAAAAA
            AABvlAAAOO4AAAOQWFlaIAAAAAAAACSdAAAPgwAAtr5YWVogAAAAAAAAYqUAALeQ
            AAAY3nBhcmEAAAAAAAMAAAACZmYAAPKnAAANWQAAE9AAAApbcGFyYQAAAAAAAwAA
            AAJmZgAA8qcAAA1ZAAAT0AAACltwYXJhAAAAAAADAAAAAmZmAADypwAADVkAABPQ
            AAAKW2Nocm0AAAAAAAMAAAAAo9cAAFR7AABMzQAAmZoAACZmAAAPXP/bAEMABQME
            BAQDBQQEBAUFBQYHDAgHBwcHDwsLCQwRDxISEQ8RERMWHBcTFBoVEREYIRgaHR0f
            Hx8TFyIkIh4kHB4fHv/bAEMBBQUFBwYHDggIDh4UERQeHh4eHh4eHh4eHh4eHh4e
            Hh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/CABEIAgACAAMBIgAC
            EQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcCBAUDAQj/xAAaAQEAAgMBAAAA
            AAAAAAAAAAAABQYBAwQC/9oADAMBAAIQAxAAAAG5Q AgICAgICAgICAgICAgIA==`
    });
    await companyProfile.save();
    expect(companyProfile).not.toBeNull();
    expect(companyProfile).not.toBeUndefined();
    expect(companyProfile.logo).not.toBeUndefined();
  });
});
