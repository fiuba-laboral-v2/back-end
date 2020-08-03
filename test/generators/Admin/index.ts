import { withCompleteData } from "./withCompleteData";
import { AdminRepository, ISaveAdmin, Secretary } from "../../../src/models/Admin";
import { Admin } from "../../../src/models";
import { CustomGenerator } from "../types";

export type TAdminDataGenerator = CustomGenerator<ISaveAdmin>;
export type TAdminGenerator = CustomGenerator<Promise<Admin>>;

export const AdminExtensionGenerator = {
  instance: function*(): TAdminGenerator {
    let index = 0;
    while (true) {
      yield AdminRepository.create(withCompleteData(index, Secretary.extension));
      index++;
    }
  },
  data: function*(): TAdminDataGenerator {
    let index = 0;
    while (true) {
      yield withCompleteData(index, Secretary.extension);
      index++;
    }
  }
};

export const AdminGraduadosGenerator = {
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
