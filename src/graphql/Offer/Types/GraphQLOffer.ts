import { GraphQLObjectType } from "graphql";
import { ID, Int, List, nonNull, String } from "../../fieldTypes";
import { GraphQLOfferSection } from "./GraphQLOfferSection";
import { GraphQLCareer } from "../../Career/Types/Career";
import { Offer } from "../../../models/Offer";

const GraphQLOffer = new GraphQLObjectType({
  name: "Offer",
  fields: () => ({
    uuid: {
      type: nonNull(ID),
      resolve: ({ uuid }: Offer) => uuid
    },
    companyId: {
      type: nonNull(Int),
      resolve: ({ companyId }: Offer) => companyId
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
    sections: {
      type: List(GraphQLOfferSection),
      resolve: (offer: Offer) => offer.getSections()
    },
    careers: {
      type: List(GraphQLCareer),
      resolve: (offer: Offer) => offer.getCareers()
    }
  })
});

export { GraphQLOffer };
