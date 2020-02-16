import { graphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import {
  Company,
  CompanyRepository,
  CompanySerializer,
  ICompany
} from "../../models/Company";

const companyProfileQueries = {
  getCompanyProfileById: {
    type: graphQLCompany,
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
  getCompanyProfiles: {
    type: List(graphQLCompany),
    resolve: async (): Promise<ICompany[]> => {
      const companies: Company[] = await CompanyRepository.findAll();
      return companies.map(company => {
        return CompanySerializer.serialize(company);
      });
    }
  }
};

export default companyProfileQueries;
