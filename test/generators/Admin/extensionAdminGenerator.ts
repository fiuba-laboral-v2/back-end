import { AdminRepository, Secretary } from "../../../src/models/Admin";
import { TAdminGenerator, TAdminDataGenerator } from ".";
import { withCompleteData } from "./withCompleteData";

export const ExtensionAdminGenerator = {
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
