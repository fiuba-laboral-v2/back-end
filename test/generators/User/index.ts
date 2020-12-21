import { UserRepository, User } from "$models/User";
import { FiubaCredentials, CompanyUserRawCredentials } from "$models/User/Credentials";
import { IUserGeneratorAttributes } from "$generators/interfaces";
import { DniGenerator } from "$generators/DNI";
import { EmailGenerator } from "$generators/Email";

export const UserGenerator = {
  index: 0,
  getIndex: () => {
    UserGenerator.index += 1;
    return UserGenerator.index;
  },
  fiubaUser: async ({ dni }: IUserGeneratorAttributes = {}) => {
    const index = UserGenerator.getIndex();
    const user = new User({
      email: `userTestClient${index}@mail.com`,
      name: "userName",
      surname: "userSurname",
      credentials: new FiubaCredentials(dni || DniGenerator.generate())
    });
    await UserRepository.save(user);
    return user;
  },
  instance: async ({ password }: IUserGeneratorAttributes = {}) => {
    const index = UserGenerator.getIndex();
    const user = new User({
      email: `userTestClient${index}@mail.com`,
      name: "userName",
      surname: "userSurname",
      credentials: new CompanyUserRawCredentials({ password: password || "ASDqfdsfsdfwe234" })
    });
    await UserRepository.save(user);
    return user;
  },
  data: {
    fiubaUser: ({ dni }: IUserGeneratorAttributes = {}) => ({
      name: "name",
      surname: "surname",
      email: EmailGenerator.generate(),
      dni: dni || DniGenerator.generate(),
      password: "mySecretFiubaPass"
    })
  }
};
