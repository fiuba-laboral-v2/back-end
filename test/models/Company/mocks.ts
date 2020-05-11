import { UserMocks } from "../User/mocks";
import { ICompany } from "../../../src/models/Company";

const additionalData = {
  phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
  photos: [
    "https://miro.medium.com/max/11520/1*Om-snCmpOoI5vehnF6FBlw.jpeg",
    "https://pbs.twimg.com/media/EK_OWQEWwAIwDXr.jpg"
  ]
};

export const companyMocks = {
  minimumDataWithoutUser: () => ({
    cuit: "30711819017",
    companyName: "devartis"
  }),
  minimumData: () => ({
    ...companyMocks.minimumDataWithoutUser(),
    user: UserMocks.userAttributes
  }),
  companyDataWithoutUser: () => ({
    cuit: "30711819017",
    companyName: "Mercado Libre",
    slogan: "Lo mejor está llegando",
    description:
      "Nuestros equipos de Tecnología están integrados por profesionales de " +
      "desarrollo, arquitectura, ciberseguridad, ingeniería y diseño, cuya misión " +
      "principal es la de mantener nuestra plataforma abierta siempre en la vanguardia. " +
      "¿Te gustaría asumir con nosotros este reto, en una industria que se reinventa " +
      "día a día? ¡Súmate!",
    logo: "https://assets.entrepreneur.com/images/misc/1584487204_LOGOCODOS_fondoblanco-01.png",
    website: "https://jobs.mercadolibre.com/",
    email: "jobs@mercadolibre.com"
  }),
  companyData: (): ICompany => ({
    ...companyMocks.companyDataWithoutUser(),
    user: UserMocks.userAttributes
  }),
  completeDataWithoutUser: () => ({
    ...companyMocks.companyDataWithoutUser(),
    ...additionalData
  }),
  completeData: () => ({
    ...companyMocks.companyData(),
    ...additionalData
  }),
  completeDataWithLogoWithMoreThan255Characters: (): ICompany =>
    ({
      cuit: "30711819017",
      companyName: "Company name",
      user: UserMocks.userAttributes,
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
