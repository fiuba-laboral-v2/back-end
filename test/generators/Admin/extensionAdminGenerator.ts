import { AdminRepository, Secretary } from "$models/Admin";
import { withCompleteData } from "./withCompleteData";

export const ExtensionAdminGenerator = {
  index: Number.MAX_SAFE_INTEGER,
  getIndex: () => {
    ExtensionAdminGenerator.index -= 1;
    return ExtensionAdminGenerator.index;
  },
  instance: () =>
    AdminRepository.create(
      withCompleteData(ExtensionAdminGenerator.getIndex(), Secretary.extension)
    ),
  data: () => withCompleteData(ExtensionAdminGenerator.getIndex(), Secretary.extension)
};
