import { withMinimumData } from "./withMinimumData";
import { IApplicant, Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CustomGenerator } from "../types";

export type TApplicantGenerator = CustomGenerator<Promise<Applicant>>;
export type TApplicantDataGenerator = CustomGenerator<IApplicant>;

export const ApplicantGenerator = {
  instance: {
    withMinimumData: function*(): TApplicantGenerator {
      let index = 0;
      while (true) {
        yield ApplicantRepository.create(withMinimumData(index));
        index++;
      }
    }
  },
  data: {
    minimum: function*(): TApplicantDataGenerator {
      let index = 0;
      while (true) {
        yield withMinimumData(index);
        index++;
      }
    }
  }
};
