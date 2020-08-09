import { IVariables } from "./interfaces";
import { withObligatoryData } from "./withObligatoryData";
import { IOfferAttributes } from "$models/Offer/Interface";

export const withOneSection = (variables: IVariables): IOfferAttributes => ({
  ...withObligatoryData(variables),
  sections: [{
    title: "title",
    text: "text",
    displayOrder: 1
  }]
});
