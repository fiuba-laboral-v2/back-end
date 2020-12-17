import { UserRepository, User } from "$models/User";
import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { IUserGeneratorAttributes } from "$generators/interfaces";

export const UserGenerator = {
  index: 0,
  getIndex: () => {
    UserGenerator.index += 1;
    return UserGenerator.index;
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
  }
};
