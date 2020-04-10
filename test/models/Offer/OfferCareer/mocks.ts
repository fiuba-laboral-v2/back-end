import { random } from "faker";

const OfferCareerMocks = {
  completeData: (offerUuid: string, careerCode: string) => (
    {
      careerCode: careerCode,
      offerUuid: offerUuid
    }
  ),
  withNoOfferUuid: (careerCode: string) => ({ careerCode: careerCode }),
  withNoCareerCode: (offerUuid: string) => ({ offerUuid: offerUuid })
};

export { OfferCareerMocks };
