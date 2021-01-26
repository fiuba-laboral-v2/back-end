import {
  AdminNotification,
  AdminNotificationRepository,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";
import { Admin } from "$models";

import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";

import { range, sample } from "lodash";
import MockDate from "mockdate";

export const AdminNotificationGenerator = {
  instance: {
    updatedCompanyProfile: async ({ admin }: IGeneratorAttributes = {}) => {
      const { secretary } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const attributes = { secretary, companyUuid };
      const notification = new UpdatedCompanyProfileAdminNotification(attributes);
      await AdminNotificationRepository.save(notification);
      return notification;
    },
    range: async ({ admin, size, mockDate }: IRange) => {
      const values: AdminNotification[] = [];
      const generators = [AdminNotificationGenerator.instance.updatedCompanyProfile];
      for (const milliseconds of range(size)) {
        MockDate.set(mockDate || milliseconds);
        const generator = sample<Generator>(generators);
        values.push(await generator!({ admin }));
        MockDate.reset();
      }
      return values.sort(value => -value.createdAt!);
    }
  }
};

type Generator = (attributes: IGeneratorAttributes) => Promise<AdminNotification>;

interface IGeneratorAttributes {
  admin?: Admin;
}

interface IRange {
  size: number;
  admin: Admin;
  mockDate?: Date;
}
