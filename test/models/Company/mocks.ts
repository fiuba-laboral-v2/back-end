import { UserMocks } from "../User/mocks";
import { ICompany } from "../../../src/models/Company";

export const companyMocks = {
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
  })
};
