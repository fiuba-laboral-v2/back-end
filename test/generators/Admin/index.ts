import { AdminRepository, Secretary } from "$models/Admin";
import { withCompleteData } from "./withCompleteData";
import { IAdminGeneratorAttributes, IUserGeneratorAttributes } from "$generators/interfaces";

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
  extension: (variables?: IUserGeneratorAttributes) =>
    AdminGenerator.instance({ secretary: Secretary.extension, ...variables }),
  graduados: (variables?: IUserGeneratorAttributes) =>
    AdminGenerator.instance({ secretary: Secretary.graduados, ...variables }),
  data: (secretary: Secretary) =>
    withCompleteData({
      index: AdminGenerator.getIndex(),
      secretary
    })
};
