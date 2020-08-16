import { GraphQLCompany } from "../Types/GraphQLCompany";
import { ID, nonNull } from "$graphql/fieldTypes";
import { CompanyRepository } from "$models/Company";

export const getCompanyByUuid = {
  type: GraphQLCompany,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }: { uuid: string }) => CompanyRepository.findByUuid(uuid)
};
