import { CompanyUser, Company } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser";
import { UserGenerator } from "$generators/User";
import { CompanyGenerator } from "$generators/Company";
import { range } from "lodash";
import MockDate from "mockdate";

export const CompanyUserGenerator = {
  instance: async ({ company }: { company?: Company } = {}) => {
    const companyUuid = company?.uuid || (await CompanyGenerator.instance.withMinimumData()).uuid;
    const user = await UserGenerator.instance();
    const companyUser = new CompanyUser({ userUuid: user.uuid, companyUuid, position: "RRHH" });
    await CompanyUserRepository.save(companyUser);
    return companyUser;
  },
  range: async ({ company, size }: { size: number; company: Company }) => {
    const values: CompanyUser[] = [];
    for (const milliseconds of range(size)) {
      MockDate.set(milliseconds);
      values.push(await CompanyUserGenerator.instance({ company }));
      MockDate.reset();
    }
    return values.sort(({ updatedAt }) => -updatedAt!);
  }
};
