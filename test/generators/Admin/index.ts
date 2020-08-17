import { AdminRepository, Secretary } from "$models/Admin";
import { withCompleteData } from "./withCompleteData";
import { IAdminGeneratorAttributes } from "$generators/interfaces";

export const AdminGenerator = {
  index: 0,
  getIndex: () => {
    AdminGenerator.index += 1;
    return AdminGenerator.index;
  },
  instance: ({ secretary, ...variables }: IAdminGeneratorAttributes) =>
    AdminRepository.create(
      withCompleteData({
        index: AdminGenerator.getIndex(),
        secretary,
        ...variables
      })
    ),
  data: (secretary: Secretary) =>
    withCompleteData({
      index: AdminGenerator.getIndex(),
      secretary
    })
};
