import { Admin } from "$models";
import { AdminRepository, Secretary } from "$models/Admin";
import { withCompleteData } from "./withCompleteData";
import { IAdminGeneratorAttributes, IUserGeneratorAttributes } from "$generators/interfaces";
import { UserGenerator } from "$generators/User";

export const AdminGenerator = {
  index: 0,
  getIndex: () => {
    AdminGenerator.index += 1;
    return AdminGenerator.index;
  },
  instance: async ({ secretary, dni }: IAdminGeneratorAttributes) => {
    const user = await UserGenerator.fiubaUser({ dni });
    const admin = new Admin({ userUuid: user.uuid, secretary });
    await AdminRepository.save(admin);
    return admin;
  },
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
