import { AdminRepository, Secretary } from "$models/Admin";
import { AdminInputData, withCompleteData } from "./withCompleteData";

export const AdminGenerator = {
  index: 0,
  getIndex: () => {
    AdminGenerator.index += 1;
    return AdminGenerator.index;
  },
  instance: (secretary: Secretary, variables?: AdminInputData) =>
    AdminRepository.create(
      withCompleteData({
        index: AdminGenerator.getIndex(),
        secretary,
        ...variables
      })
    ),
  data: (secretary: Secretary) => withCompleteData({
    index: AdminGenerator.getIndex(),
    secretary
  })
};
