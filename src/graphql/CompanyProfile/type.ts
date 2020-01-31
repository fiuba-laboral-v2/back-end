import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../fieldTypes";

const companyProfileType = new GraphQLObjectType({
  name: "CompanyProfile",
  fields: () => ({
    id: {
      type: ID
    },
    cuit: {
      type: nonNull(String)
    },
    companyName: {
      type: nonNull(String)
    },
    slogan: {
      type: String
    },
    description: {
      type: String
    },
    logo: {
      type: String
    },
    phoneNumbers: {
      type: new List(Int)
    }
  })
});

interface ICompanyProfile {
  cuit: string;
  companyName: string;
  slogan: string;
  description: string;
  logo: string;
  phoneNumbers: number[];
}

export { companyProfileType, ICompanyProfile };
