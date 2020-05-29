import { withMinimumData } from "./withMinimumData";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CustomGenerator, IMaximum } from "../types";

export type TApplicantGenerator = CustomGenerator<Promise<Applicant>>;

export const ApplicantGenerator = {
  withMinimumData: function*({ maximum }: IMaximum = { maximum: 20 }): TApplicantGenerator {
    for (let index = 0; index < maximum; index++) {
      yield ApplicantRepository.create(withMinimumData(index));
    }
    throw new Error("There are no more applicants to generate");
  }
};
