import { GraphQLInputObjectType } from "graphql";
import { ID, nonNull } from "$graphql/fieldTypes";

const GraphQLOfferCareerInput = new GraphQLInputObjectType({
  name: "OfferCareerInput",
  fields: () => ({
    careerCode: {
      type: nonNull(ID)
    }
  })
});

export { GraphQLOfferCareerInput };
