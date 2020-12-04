import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";

export const GraphQLApprovedOfferCompanyNotification = new GraphQLObjectType<
  ApprovedOfferCompanyNotification
>({
  name: "ApprovedOfferCompanyNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    offer: {
      type: nonNull(GraphQLOffer),
      resolve: notification => OfferRepository.findByUuid(notification.offerUuid)
    }
  })
});
