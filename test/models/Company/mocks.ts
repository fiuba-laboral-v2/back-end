import faker from "faker";
import { ICompany } from "../../../src/models/Company";

export const companyMocks = {
  companyData: (): ICompany =>
    ({
      cuit: faker.random.arrayElement(["30711819017", "30701307115", "30703088534"]),
      companyName: faker.name.firstName(),
      slogan: faker.company.catchPhrase(),
      description: faker.lorem.sentence(),
      logo: faker.image.dataUri(),
      website: faker.internet.url(),
      email: faker.internet.email()
    }),
  completeData: (): ICompany =>
    ({
      ...companyMocks.companyData(),
      phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
      photos: [faker.image.dataUri(), faker.image.dataUri()]
    }),
  completeDataWithLogoWithMoreThan255Characters: (): ICompany =>
    ({
      cuit: "30711819017",
      companyName: "Company name",
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
    })
};
