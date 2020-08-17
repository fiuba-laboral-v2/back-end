import { IUserTestClientAttributes } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { UserGenerator } from "$generators/User";

export const userTestClient = async ({ password, expressContext }: IUserTestClientAttributes) => {
  const user = await UserGenerator.instance({ password });
  const apolloClient = createApolloTestClient(user, expressContext);
  return { apolloClient, user };
};
