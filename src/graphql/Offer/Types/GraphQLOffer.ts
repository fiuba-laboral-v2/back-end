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
      type: nonNull(ID)
    },
    title: {
      type: nonNull(String)
    },
    description: {
      type: nonNull(String)
    },
    hoursPerDay: {
      type: nonNull(Int)
    },
    minimumSalary: {
      type: nonNull(Int)
    },
    maximumSalary: {
      type: nonNull(Int)
    },
    createdAt: {
      type: nonNull(String)
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
