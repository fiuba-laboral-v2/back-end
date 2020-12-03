import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { CompanyApprovedOfferNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";

export const GraphQLCompanyApprovedOfferNotification = new GraphQLObjectType<
  CompanyApprovedOfferNotification
>({
  name: "CompanyApprovedOfferNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    offer: {
      type: nonNull(GraphQLOffer),
      resolve: notification => OfferRepository.findByUuid(notification.offerUuid)
    }
  })
});
