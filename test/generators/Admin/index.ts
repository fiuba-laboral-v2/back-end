import { AdminRepository, Secretary } from "$models/Admin";
import { withCompleteData } from "./withCompleteData";
import { IUserGeneratorAttributes } from "$generators/interfaces";

export const AdminGenerator = {
  index: 0,
  getIndex: () => {
    AdminGenerator.index += 1;
    return AdminGenerator.index;
  },
  instance: (secretary: Secretary, variables?: IUserGeneratorAttributes) =>
    AdminRepository.create(
      withCompleteData({
        index: AdminGenerator.getIndex(),
        secretary,
        ...variables,
      })
    ),
  data: (secretary: Secretary) =>
    withCompleteData({
      index: AdminGenerator.getIndex(),
      secretary,
    }),
};
