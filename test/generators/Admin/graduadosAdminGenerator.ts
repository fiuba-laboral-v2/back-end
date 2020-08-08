import { withCompleteData, AdminInputData } from "./withCompleteData";
import { AdminRepository, Secretary } from "$models/Admin";

export const GraduadosAdminGenerator = {
  index: Number.MAX_SAFE_INTEGER,
  getIndex: () => {
    GraduadosAdminGenerator.index -= 1;
    return GraduadosAdminGenerator.index;
  },
  instance: (variables?: AdminInputData) =>
    AdminRepository.create(withCompleteData({
      index: GraduadosAdminGenerator.getIndex(),
      secretary: Secretary.graduados,
      ...variables
    })),
  data: () => withCompleteData({
    index: GraduadosAdminGenerator.getIndex(),
    secretary: Secretary.graduados
  })
};
