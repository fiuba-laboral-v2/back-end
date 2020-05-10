import { UserRepository } from "../../src/models/User";
import { internet, name, random } from "faker";
import { ApplicantRepository } from "../../src/models/Applicant";

export const userFactory = {
  user: () => UserRepository.create(
    {
      email: internet.email(),
      password: "AValidPassword123",
      name: name.firstName(),
      surname: name.lastName()
    }
  ),
  applicantUser: () => {
    return ApplicantRepository.create(
      {
        padron: random.number(),
        description: random.words(),
        careers: [],
        user: {
          email: internet.email(),
          password: "AValidPassword123",
          name: name.firstName(),
          surname: name.lastName()
        }
      });
  }
};
