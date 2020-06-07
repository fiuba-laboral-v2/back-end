import { internet, random, company, lorem } from "faker";
import { cuitGenerator } from "../generators/Company/cuitGenerator";

import { UserRepository } from "../../src/models/User";
import { ApplicantRepository } from "../../src/models/Applicant";
import { CompanyRepository } from "../../src/models/Company";
import { IUserProps, IApplicantProps } from "./interfaces";

export const userFactory = {
  user: ({ password, isAdmin }: IUserProps = {}) =>
    UserRepository.create({
      email: internet.email(),
      password: password || "AValidPassword123",
      name: "Bruno",
      surname: "Diaz",
      isAdmin
    }
  ),
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
  company: (password?: string) =>
    CompanyRepository.create({
      cuit: cuitGenerator(),
      companyName: "Cachito y Asociados",
      slogan: company.catchPhrase(),
      description: lorem.paragraph(),
      website: internet.url(),
      email: internet.email(),
      user: {
        email: internet.email(),
        password: password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      }
    })
};
