import { GraphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import {
  Company,
  CompanyRepository,
  CompanySerializer
} from "../../models/Company";

const companyQueries = {
  getCompanyById: {
    type: GraphQLCompany,
    args: {
      id: {
        type: nonNull(ID)
      }
    },
    resolve: async (_: undefined, { id }: { id: number }) => {
      const company: Company = await CompanyRepository.findById(id);
      return CompanySerializer.serialize(company);
    }
  },
  getCompanies: {
    type: List(GraphQLCompany),
    resolve: async () => {
      const companies = await CompanyRepository.findAll();
      return companies.map(company => CompanySerializer.serialize(company));
    }
  }
};

export default companyQueries;
