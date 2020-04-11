import { GraphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import { CompanyRepository } from "../../models/Company";

const companyQueries = {
  getCompanyById: {
    type: GraphQLCompany,
    args: {
      id: {
        type: nonNull(ID)
      }
    },
    resolve: (_: undefined, { id }: { id: number }) => CompanyRepository.findById(id)
  },
  getCompanies: {
    type: List(GraphQLCompany),
    resolve: () => CompanyRepository.findAll()
  }
};

export default companyQueries;
