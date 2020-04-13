import { Company } from "../../../src/models/Company";
import { CompanyPhoneNumber } from "../../../src/models/CompanyPhoneNumber";
import { CompanyPhoto } from "../../../src/models/CompanyPhoto";
import { companyMockData } from "./mocks";
import Database from "../../../src/config/Database";


describe("Company", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Company.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid company", async () => {
    const company: Company = new Company(companyMockData);
    const phoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: 43076555,
      companyId: 1
    });
    const photo: CompanyPhoto = new CompanyPhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACN
              byblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAAB
              JRU5ErkJggg==`,
      companyId: 1
    });
    company.phoneNumbers = [ phoneNumber ];
    company.photos = [ photo ];
    await company.save();
    expect(company.phoneNumbers).toHaveLength(1);
    expect(company.photos).toHaveLength(1);
    expect(company.id).toBeGreaterThan(0);
    expect(company).toEqual(expect.objectContaining({
      cuit: companyMockData.cuit,
      companyName: companyMockData.companyName,
      slogan: companyMockData.slogan,
      description: companyMockData.description,
      logo: companyMockData.logo,
      website: companyMockData.website,
      email: companyMockData.email
    }));
  });

  it("should throw an error if cuit is null", async () => {
    const company: Company = new Company({
      cuit: null,
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if companyName is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if companyName and cuit is null", async () => {
    const company: Company = new Company({
      cuit: null,
      companyName: null
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if cuit has less than eleven digits", async () => {
    const company: Company = new Company({
      cuit: "30",
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if cuit has more than eleven digits", async () => {
    const company: Company = new Company({
      cuit: "3057341761199",
      companyName: "devartis"
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if name is empty", async () => {
    const company: Company = new Company({
      cuit: "3057341761199",
      companyName: ""
    });
    await expect(company.save()).rejects.toThrow();
  });

  it("should throw an error if name has digits", async () => {
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

  it("should throw an error if new company has an already existing cuit", async () => {
    await new Company({
      cuit: "30711819017",
      companyName: "Devartis SA"
    }).save();

    const company = new Company({
      cuit: "30711819017",
      companyName: "Devartis Clone SA"
    });

    await expect(company.save()).rejects.toThrow("Validation error");
  });
});
