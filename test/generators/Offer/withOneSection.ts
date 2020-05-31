import { IOffer } from "../../../src/models/Offer";
import { IVariables } from "./interfaces";
import { withObligatoryData } from "./withObligatoryData";

export const withOneSection = (variables: IVariables): IOffer => ({
  ...withObligatoryData(variables),
  sections: [{
    title: "title",
    text: "text",
    displayOrder: 1
  }]
});
