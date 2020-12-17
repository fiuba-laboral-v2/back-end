import { UserRepository } from "$models/User";
import { IUserTestClientAttributes, IAdminGeneratorAttributes } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { AdminGenerator } from "$generators/Admin";

export const adminTestClient = async ({
  secretary,
  password,
  expressContext
}: IUserTestClientAttributes & IAdminGeneratorAttributes) => {
  const admin = await AdminGenerator.instance({ secretary, password });
  const user = await UserRepository.findByUuid(admin.userUuid);
  const adminContext = { admin: { userUuid: admin.userUuid } };
  const apolloClient = createApolloTestClient(user, expressContext, adminContext);
  return { apolloClient, user, admin };
};
