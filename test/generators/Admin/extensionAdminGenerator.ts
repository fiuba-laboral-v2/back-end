import { AdminRepository, Secretary } from "$models/Admin";
import { AdminInputData, withCompleteData } from "./withCompleteData";

export const ExtensionAdminGenerator = {
  index: 0,
  getIndex: () => {
    ExtensionAdminGenerator.index += 1;
    return ExtensionAdminGenerator.index;
  },
  instance: (variables?: AdminInputData) =>
    AdminRepository.create(
      withCompleteData({
        index: ExtensionAdminGenerator.getIndex(),
        secretary: Secretary.extension,
        ...variables
      })
    ),
  data: () => withCompleteData({
    index: ExtensionAdminGenerator.getIndex(),
    secretary: Secretary.extension
  })
};
