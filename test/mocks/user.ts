import { UserRepository } from "../../src/models/User";
import { internet, name, random, company, lorem } from "faker";
import { ApplicantRepository } from "../../src/models/Applicant";
import { CompanyRepository } from "../../src/models/Company";
import { ApplicantProps } from "./interfaces";

export const userFactory = {
  user: () =>
    UserRepository.create({
      email: internet.email(),
      password: "AValidPassword123",
      name: name.firstName(),
      surname: name.lastName()
    }
  ),
  applicant: ({careers}: ApplicantProps) =>
    ApplicantRepository.create({
      padron: random.number(),
      description: random.words(),
      careers: careers || [],
      user: {
        email: internet.email(),
        password: "AValidPassword123",
        name: name.firstName(),
        surname: name.lastName()
      }
    }),
  company: () =>
    CompanyRepository.create({
      cuit: cuitGenerator(),
      companyName: company.companyName(),
      slogan: company.catchPhrase(),
      description: lorem.paragraph(),
      website: internet.url(),
      email: internet.email(),
      user: {
        email: internet.email(),
        password: "AValidPassword123",
        name: name.firstName(),
        surname: name.lastName()
      }
    })
};

const cuitGenerator = () => {
  const middleNumbers = Array(8).fill(1).map(() => random.number({ max: 9 }));
  const numbers = [2, 0, ...middleNumbers];
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let aux = 0;
  multipliers.forEach((value, index) => aux += value * numbers[index]);

  const resto: number = aux % 11;
  let last = 11 - resto;
  if (last === 11) last = 0;
  if (last === 10) last = 9;
  const cuit = [...numbers, last];
  return cuit.join("");
};
