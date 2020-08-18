import { IUserTestClientAttributes, IAdminGeneratorAttributes } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { AdminGenerator } from "$generators/Admin";

export const adminTestClient = async ({
  secretary,
  password,
  expressContext
}: IUserTestClientAttributes & IAdminGeneratorAttributes) => {
  const admin = await AdminGenerator.instance({ secretary, password });
  const user = await admin.getUser();
  const adminContext = { admin: { userUuid: admin.userUuid } };
  const apolloClient = createApolloTestClient(user, expressContext, adminContext);
  return { apolloClient, user, admin };
};
