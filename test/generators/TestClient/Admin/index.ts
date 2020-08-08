import { IUserProps } from "../../interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { AdminRepository } from "$models/Admin";
import { Secretary } from "$models/Admin";
import { DniGenerator } from "$generators/DNI";

export const adminTestClient = async (index: number, { password, expressContext }: IUserProps) => {
  const admin = await AdminRepository.create({
    user: {
      dni: DniGenerator.generate(),
      email: `adminTestClient${index}@mail.com`,
      password: password || "ASDqfdsfsdfwe234",
      name: "adminName",
      surname: "adminSurname"
    },
    secretary: Secretary.extension
  });
  const user = await admin.getUser();
  const adminContext = { admin: { userUuid: admin.userUuid } };
  const apolloClient = createApolloTestClient(user, expressContext, adminContext);
  return { apolloClient, user, admin };
};
