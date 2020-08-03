import { withCompleteData } from "./withCompleteData";
import { AdminRepository, Secretary } from "../../../src/models/Admin";
import { TAdminGenerator, TAdminDataGenerator } from ".";

export const GraduadosAdminGenerator = {
  instance: function*(): TAdminGenerator {
    let index = Number.MAX_SAFE_INTEGER;
    while (true) {
      yield AdminRepository.create(withCompleteData(index, Secretary.graduados));
      index--;
    }
  },
  data: function*(): TAdminDataGenerator {
    let index = Number.MAX_SAFE_INTEGER;
    while (true) {
      yield withCompleteData(index, Secretary.graduados);
      index--;
    }
  }
};
