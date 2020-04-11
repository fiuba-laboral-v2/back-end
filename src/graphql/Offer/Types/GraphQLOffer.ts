import { GraphQLObjectType } from "graphql";
import { ID, Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLOfferSection } from "./GraphQLOfferSection";
import { GraphQLCareer } from "../../Career/Types/Career";
import { GraphQLCompany } from "../../Company/Types/GraphQLCompany";
import { Offer } from "../../../models/Offer";

const GraphQLOffer = new GraphQLObjectType({
  name: "Offer",
  fields: () => ({
    uuid: {
      type: nonNull(ID),
      resolve: ({ uuid }: Offer) => uuid
    },
    title: {
      type: nonNull(String),
      resolve: ({ title }: Offer) => title
    },
    description: {
      type: nonNull(String),
      resolve: ({ description }: Offer) => description
    },
    hoursPerDay: {
      type: nonNull(Int),
      resolve: ({ hoursPerDay }: Offer) => hoursPerDay
    },
    minimumSalary: {
      type: nonNull(Int),
      resolve: ({ minimumSalary }: Offer) => minimumSalary
    },
    maximumSalary: {
      type: nonNull(Int),
      resolve: ({ maximumSalary }: Offer) => maximumSalary
    },
    createdAt: {
      type: nonNull(String),
      resolve: ({ createdAt }: Offer) => createdAt
    },
    sections: {
      type: List(GraphQLOfferSection),
      resolve: (offer: Offer) => offer.getSections()
    },
    careers: {
      type: List(GraphQLCareer),
      resolve: (offer: Offer) => offer.getCareers()
    },
    company: {
      type: GraphQLCompany,
      resolve: (offer: Offer) => offer.getCompany()
    }
  })
});

export { GraphQLOffer };
