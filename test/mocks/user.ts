import { internet, random, company, lorem } from "faker";
import { cuitGenerator } from "../generators/Company/cuitGenerator";

import { UserRepository } from "../../src/models/User";
import { AdminRepository } from "../../src/models/Admin";
import { ApplicantRepository } from "../../src/models/Applicant";
import { CompanyRepository } from "../../src/models/Company";
import { IUserProps, IApplicantProps, ICompanyAttributes } from "./interfaces";

export const userFactory = {
  user: ({ password }: IUserProps = {}) =>
    UserRepository.create({
      email: internet.email(),
      password: password || "AValidPassword123",
      name: "Bruno",
      surname: "Diaz"
    }
  ),
  admin: ({ password }: IUserProps = {}) =>
    AdminRepository.create({
      user: {
        email: internet.email(),
        password: password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      }
    }),
  applicant: ({
    careers, password, capabilities
  }: IApplicantProps = { careers: [], capabilities: [], password: null }) =>
    ApplicantRepository.create({
      padron: random.number(),
      description: random.words(),
      careers: careers || [],
      capabilities: capabilities || [],
      user: {
        email: internet.email(),
        password: password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      }
    }),
  company: ({ photos, user }: ICompanyAttributes = {}) =>
    CompanyRepository.create({
      cuit: cuitGenerator(),
      companyName: "Cachito y Asociados",
      slogan: company.catchPhrase(),
      description: lorem.paragraph(),
      website: internet.url(),
      email: internet.email(),
      photos,
      user: {
        email: internet.email(),
        password: user?.password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      }
    })
};
