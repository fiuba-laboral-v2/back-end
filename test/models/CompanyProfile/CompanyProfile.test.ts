import { Company } from "../../../src/models/Company";
import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";
import { companyProfileMockData } from "./CompanyProfileMockData";
import Database from "../../../src/config/Database";


describe("CompanyProfile", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Company.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid profile", async () => {
    const company: Company = new Company(companyProfileMockData);
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
    company.phoneNumbers = [ phoneNumber ];
    company.photos = [ photo ];
    await company.save();
    expect(company.phoneNumbers).toHaveLength(1);
    expect(company.photos).toHaveLength(1);
    expect(company.id).toBeGreaterThan(0);
    expect(company).toEqual(expect.objectContaining({
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
    const company: Company = new Company({
      cuit: null,
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if companyName is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if companyName and cuit is null", async () => {
    const company: Company = new Company({
      cuit: null,
      companyName: null
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if cuit has less than eleven digits", async () => {
    const company: Company = new Company({
      cuit: "30",
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if cuit has more than eleven digits", async () => {
    const company: Company = new Company({
      cuit: "3057341761199",
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if name is empty", async () => {
    const company: Company = new Company({
      cuit: "3057341761199",
      companyName: ""
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("raise an error if name has digits", async () => {
    const company: Company = new Company({
      cuit: "3057341761199",
      companyName: "Google34"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("creates a valid profile with a logo with more than 255 characters", async () => {
    const company: Company = new Company({
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
    await company.save();
    expect(company).not.toBeNull();
    expect(company).not.toBeUndefined();
    expect(company.logo).not.toBeUndefined();
  });
});
