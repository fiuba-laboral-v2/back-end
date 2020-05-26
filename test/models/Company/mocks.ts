import { UserMocks } from "../User/mocks";
import { cuitGenerator } from "../../mocks/user";
import { CompanyRepository, ICompany } from "../../../src/models/Company";

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
    }),
  nineteenCompaniesWithCompleteData: () => (
    companyMocks.nineteenCompaniesWithMinimumData.map(data =>
      ({
        slogan: "Lo mejor está llegando",
        description: "description",
        logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA AgICAgICAgICAgICAgIA==",
        website: "https://jobs.mercadolibre.com/",
        email: "jobs@mercadolibre.com",
        ...data,
        ...additionalData
      })
    )
  ),
  nineteenCompaniesWithMinimumData: [
    {
      cuit: "30711819017",
      companyName: "Devartis",
      user: {
        email: "jjcale@fi.uba.ar",
        password: "ASDqfdsfsdfwe234",
        name: "John",
        surname: "Cale"
      }
    },
    {
      cuit: "30703088534",
      companyName: "Mercado Libre",
      user: {
        email: "freddieking@fi.uba.ar",
        password: "ASDqfedsfswe234",
        name: "Frederick",
        surname: "King"
      }
    },
    {
      cuit: "30701307115",
      companyName: "Despegar",
      user: {
        email: "aking@fi.uba.ar",
        password: "ASDfewfewqwe234",
        name: "Albert",
        surname: "King"
      }
    },
    {
      cuit: "30715200941",
      companyName: "Mule soft",
      user: {
        email: "rjohnson@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Robert",
        surname: "Johnson"
      }
    },
    {
      cuit: "30711696306",
      companyName: "The Fork",
      user: {
        email: "jbonamassa@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Joe",
        surname: "Bonamassa"
      }
    },
    {
      cuit: "30712392513",
      companyName: "Keepcon",
      user: {
        email: "bbking@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Riley",
        surname: "King"
      }
    },
    {
      cuit: "30711311773",
      companyName: "SalesForce",
      user: {
        email: "buddyGuy@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "George",
        surname: "Guy"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Carrefour",
      user: {
        email: "jlennom@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "John",
        surname: "Lennon"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Seru Giran",
      user: {
        email: "cgarcia@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Charly",
        surname: "Garcia"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Sui Generis",
      user: {
        email: "nmestre@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Carlos",
        surname: "Mestre"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Mycrosoft",
      user: {
        email: "bgates@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Bill",
        surname: "Gates"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Apple",
      user: {
        email: "sjobs@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Steve",
        surname: "Jobs"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "IBM",
      user: {
        email: "jkelly@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "John",
        surname: "Kelly"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Zona props",
      user: {
        email: "eminujin@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Edgardo",
        surname: "Minujin"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "LinkedIn",
      user: {
        email: "jperez@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Juan",
        surname: "Perez"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Media",
      user: {
        email: "cmagno@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Carlo",
        surname: "Magno"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Argenprop",
      user: {
        email: "thanks@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Tom",
        surname: "Hanks"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Pretty Woman",
      user: {
        email: "jroberts@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Julia",
        surname: "Roberts"
      }
    },
    {
      cuit: cuitGenerator(),
      companyName: "Godfather",
      user: {
        email: "apaccino@fi.uba.ar",
        password: "ASDqwegregrdfg234",
        name: "Al",
        surname: "Paccino"
      }
    }
  ],
  createNineteenCompaniesWithMinimumData: () => (
    Promise.all(
      companyMocks.nineteenCompaniesWithMinimumData.map(data => CompanyRepository.create(data)
    ))
  )
};
