import { IUserProps } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { UserRepository } from "$models/User";

export const userTestClient = async (index: number, { password, expressContext }: IUserProps) => {
  const user = await UserRepository.create({
    email: `userTestClient${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "userName",
    surname: "userSurname"
  });
  const apolloClient = createApolloTestClient(user, expressContext);
  return { apolloClient, user };
};
