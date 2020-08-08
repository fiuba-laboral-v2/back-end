import { internet, random } from "faker";

import { UserRepository } from "$models/User";
import { AdminRepository, Secretary } from "$models/Admin";
import { IUserProps } from "./interfaces";

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
    })
};
