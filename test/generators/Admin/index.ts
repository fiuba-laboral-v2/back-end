import { withCompleteData } from "./withCompleteData";
import { ISaveAdmin } from "../../../src/models/Admin";
import { CustomGenerator } from "../types";

export type TAdminDataGenerator = CustomGenerator<ISaveAdmin>;

export const AdminGenerator = {
  data: function*(): TAdminDataGenerator {
    let index = 0;
    while (true) {
      yield withCompleteData(index);
      index++;
    }
  }
};
