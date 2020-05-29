import { withMinimumData } from "./withMinimumData";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CustomGenerator } from "../types";

export type TApplicantGenerator = CustomGenerator<Promise<Applicant>>;

export const ApplicantGenerator = {
  withMinimumData: function*(): TApplicantGenerator {
    let index = 0;
    while (true) {
      yield ApplicantRepository.create(withMinimumData(index));
      index++;
    }
  }
};
