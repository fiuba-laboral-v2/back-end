import { withCompleteData } from "./withCompleteData";
import { AdminRepository, Secretary } from "$models/Admin";

export const GraduadosAdminGenerator = {
  index: Number.MAX_SAFE_INTEGER,
  getIndex: () => {
    GraduadosAdminGenerator.index -= 1;
    return GraduadosAdminGenerator.index;
  },
  instance: () =>
    AdminRepository.create(withCompleteData(
      GraduadosAdminGenerator.getIndex(),
      Secretary.graduados)
    ),
  data: () => withCompleteData(GraduadosAdminGenerator.getIndex(), Secretary.graduados)
};
