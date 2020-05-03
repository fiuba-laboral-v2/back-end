import { GraphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import { CompanyRepository } from "../../models/Company";

const companyQueries = {
  getCompanyByUuid: {
    type: GraphQLCompany,
    args: {
      uuid: {
        type: nonNull(ID)
      }
    },
    resolve: (_: undefined, { uuid }: { uuid: string }) => CompanyRepository.findByUuid(uuid)
  },
  getCompanies: {
    type: List(GraphQLCompany),
    resolve: () => CompanyRepository.findAll()
  }
};

export default companyQueries;
