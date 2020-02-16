import { graphQLCompany } from "./Types/GraphQLCompany";
import { ID, nonNull, List } from "../fieldTypes";
import {
  Company,
  CompanyProfileRepository,
  CompanyProfileSerializer,
  ICompanyProfile
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
      const company: Company = await CompanyProfileRepository.findById(id);
      return CompanyProfileSerializer.serialize(company);
    }
  },
  getCompanyProfiles: {
    type: List(graphQLCompany),
    resolve: async (): Promise<ICompanyProfile[]> => {
      const companies: Company[] = await CompanyProfileRepository.findAll();
      return companies.map(company => {
        return CompanyProfileSerializer.serialize(company);
      });
    }
  }
};

export default companyProfileQueries;
