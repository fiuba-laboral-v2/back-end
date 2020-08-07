import { company, internet, lorem, random } from "faker";
import { cuitGenerator } from "../generators/Company/cuitGenerator";

import { UserRepository } from "$models/User";
import { AdminRepository, Secretary } from "$models/Admin";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { IApplicantAttributes, ICompanyAttributes, IUserProps } from "./interfaces";

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
        dni: random.number({ min: 10000000, max: 99999999 }),
        email: internet.email(),
        password: password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      },
      secretary: Secretary.extension
    }),
  applicant: (
    {
      careers, password, capabilities
    }: IApplicantAttributes = { careers: [], capabilities: [], password: null }
  ) => {
    const padron = random.number();
    return ApplicantRepository.create({
      padron,
      description: random.words(),
      careers: careers || [],
      capabilities: capabilities || [],
      user: {
        dni: 99999999 - padron,
        email: internet.email(),
        password: password || "AValidPassword123",
        name: "Bruno",
        surname: "Diaz"
      }
    });
  },
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
