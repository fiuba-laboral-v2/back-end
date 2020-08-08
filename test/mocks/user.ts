import { internet } from "faker";

import { UserRepository } from "$models/User";
import { IUserProps } from "./interfaces";

export const userFactory = {
  user: ({ password }: IUserProps = {}) =>
    UserRepository.create({
      email: internet.email(),
      password: password || "AValidPassword123",
      name: "Bruno",
      surname: "Diaz"
    }
  )
};
