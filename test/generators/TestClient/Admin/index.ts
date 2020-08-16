import { IUserTestClientAttributes } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { Secretary } from "$models/Admin";
import { AdminGenerator } from "$generators/Admin";

export const adminTestClient = async ({ password, expressContext }: IUserTestClientAttributes) => {
  const admin = await AdminGenerator.instance(Secretary.graduados, {
    password,
  });
  const user = await admin.getUser();
  const adminContext = { admin: { userUuid: admin.userUuid } };
  const apolloClient = createApolloTestClient(user, expressContext, adminContext);
  return { apolloClient, user, admin };
};
