import { ICompanyTestClientAttributes } from "$generators/interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { CompanyRepository } from "$models/Company";
import { CompanyUserRepository } from "$models/CompanyUser";
import { UserRepository } from "$models/User";
import { CompanyGenerator } from "$generators/Company";

export const companyTestClient = async ({
  status,
  photos,
  expressContext,
  user: userAttributes
}: ICompanyTestClientAttributes) => {
  const company = await CompanyGenerator.instance.withMinimumData({
    photos,
    user: userAttributes
  });
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(company.uuid);
  const userUuids = companyUsers.map(({ userUuid }) => userUuid);
  const [user] = await UserRepository.findByUuids(userUuids);
  const companyContext = { company: { uuid: company.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, companyContext);
  if (status) {
    const { approvalStatus } = status;
    company.set({ approvalStatus });
    await CompanyRepository.save(company);
  }
  return { apolloClient, user, company };
};
