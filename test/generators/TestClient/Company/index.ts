import { withCompleteData } from "./withCompleteData";
import { ICompanyAttributes } from "$generators/interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { CompanyRepository } from "$models/Company";

export const companyTestClient = async (
  index: number,
  { status, photos, expressContext, user: userAttributes }: ICompanyAttributes
) => {
  let company = await CompanyRepository.create(withCompleteData({
    index,
    photos,
    user: userAttributes
  }));
  const [user] = await company.getUsers();
  const companyContext = { company: { uuid: company.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, companyContext);
  if (status) {
    const { admin, approvalStatus } = status;
    company = await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      company.uuid,
      approvalStatus
    );
  }
  return { apolloClient, user, company };
};
