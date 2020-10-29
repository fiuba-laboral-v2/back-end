import { UserRepository } from "$models/User";
import { IUserGeneratorAttributes } from "$generators/interfaces";

export const UserGenerator = {
  index: 0,
  getIndex: () => {
    UserGenerator.index += 1;
    return UserGenerator.index;
  },
  instance: ({ password, dni }: IUserGeneratorAttributes = {}) => {
    const index = UserGenerator.getIndex();
    return UserRepository.create({
      email: `userTestClient${index}@mail.com`,
      password: password || "ASDqfdsfsdfwe234",
      dni,
      name: "userName",
      surname: "userSurname"
    });
  }
};
