import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IApolloServerContext } from "$graphql/Context";
import { CompanyRepository } from "$models/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

export const updateCompanyCriticalAttributes = {
  type: GraphQLCompany,
  args: {
    cuit: {
      type: nonNull(String)
    },
    businessName: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    attributes: IUpdateCompanyCriticalAttributes,
    { currentUser }: IApolloServerContext
  ) => {
    const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
    company.set({ ...attributes, approvalStatus: ApprovalStatus.pending });
    await CompanyRepository.save(company);
    return company;
  }
};

export interface IUpdateCompanyCriticalAttributes {
  cuit: string;
  businessName: string;
}
